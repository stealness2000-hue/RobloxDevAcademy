/**
 * Local bridge between the Academy and the Roblox Studio companion plugin.
 *
 * Security model:
 *  - listens on 127.0.0.1 only; requests from other addresses are rejected
 *  - Host header must be 127.0.0.1/localhost:<port> (DNS-rebinding protection); requests with an Origin header
 *    (i.e. from web pages in a browser) are rejected — Roblox HttpService does not send one
 *  - pairing needs explicit consent: the student clicks "Koppelen" in the Academy, which shows a 6-digit code
 *    valid for 2 minutes and 5 attempts; the plugin exchanges it for a random 256-bit session token
 *  - every other route needs `Authorization: Bearer <token>`; only a SHA-256 hash of the token is stored
 *  - fixed allowlist of routes; JSON bodies validated with Zod; 256 KB body limit; per-route rate limit
 *  - the bridge never executes code, never touches files, and never changes the place by itself:
 *    script updates are offered to the plugin, which asks the student and refuses on conflicts
 */
import crypto from 'node:crypto';
import http from 'node:http';
import { z } from 'zod';
import { STUDIO_EXERCISE_BY_ID, factQueries, type StudioExercise, type StudioFacts } from '../../shared/studio';

export const BRIDGE_PORT = 34873;
export const PROTOCOL_VERSION = 1;
const MAX_BODY = 256 * 1024;
const PAIR_TTL_MS = 120_000;
const CONNECTED_WINDOW_MS = 8_000;

const source = z.string().max(200_000);
const studioPath = z.string().min(1).max(300).regex(/^[A-Za-z0-9_ .-]+$/);

const Schemas = {
  pair: z.object({ code: z.string().regex(/^\d{6}$/), placeName: z.string().max(200).optional() }).strict(),
  poll: z.object({ placeName: z.string().max(200).optional(), isRunning: z.boolean().optional() }).strict(),
  report: z
    .object({
      exerciseId: z.string().max(80),
      facts: z
        .object({
          parentExists: z.boolean(),
          instances: z.record(z.string().max(300), z.object({ exists: z.boolean(), className: z.string().max(80).optional(), props: z.record(z.string().max(40), z.union([z.boolean(), z.number(), z.string().max(200)])).optional() }).strict()),
          scripts: z.array(z.object({ name: z.string().max(100), className: z.string().max(40), source }).strict()).max(20),
        })
        .strict(),
    })
    .strict(),
  pushResult: z.object({ pushId: z.string().max(64), applied: z.boolean(), reason: z.enum(['applied', 'declined', 'conflict', 'missing']), currentSource: source.optional() }).strict(),
  pull: z.object({ path: studioPath, source }).strict(),
  log: z.object({ messages: z.array(z.object({ kind: z.enum(['error', 'warning', 'info']), text: z.string().max(2000) }).strict()).max(50) }).strict(),
};

export type BridgeStatus = 'connected' | 'disconnected' | 'permission-required' | 'plugin-unavailable' | 'studio-not-detected' | 'error';

export interface PendingPush {
  id: string;
  path: string;
  source: string;
  /** The source the Academy last saw in Studio; the plugin refuses to apply if Studio changed since. */
  baseSource: string;
}

export interface BridgeEvents {
  onFacts(ex: StudioExercise, facts: StudioFacts): void;
  onPushResult(push: PendingPush, result: z.infer<typeof Schemas.pushResult>): void;
  onPull(path: string, source: string): void;
  onLog(messages: { kind: 'error' | 'warning' | 'info'; text: string }[]): void;
  onChange(): void;
  /** Persisted token hash (survives restarts). */
  loadTokenHash(): string | null;
  saveTokenHash(hash: string | null): void;
}

const sha = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

export class StudioBridge {
  private server: http.Server | null = null;
  private pairing: { code: string; expires: number; attempts: number } | null = null;
  private tokenHash: string | null;
  private lastSeen = 0;
  private everSeen = false;
  private placeName: string | null = null;
  private isRunning = false;
  private currentExerciseId: string | null = null;
  private checkRequested = false;
  private pushes: PendingPush[] = [];
  private rate = new Map<string, number[]>();
  port = 0;
  lastError: string | null = null;
  studioRunning: boolean | null = null;

  constructor(private events: BridgeEvents, private wantedPort = BRIDGE_PORT, private now = () => Date.now()) {
    this.tokenHash = events.loadTokenHash();
  }

  start(): Promise<number> {
    return new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => void this.handle(req, res));
      server.on('error', (e: NodeJS.ErrnoException) => {
        this.lastError = e.code === 'EADDRINUSE' ? `Poort ${this.wantedPort} is al in gebruik door een ander programma.` : e.message;
        this.events.onChange();
        reject(e);
      });
      server.listen(this.wantedPort, '127.0.0.1', () => {
        this.server = server;
        this.port = (server.address() as { port: number }).port;
        resolve(this.port);
      });
    });
  }

  stop() {
    this.server?.close();
    this.server = null;
  }

  // ---------------------------------------------------------------- state for the UI
  get status(): BridgeStatus {
    if (this.lastError) return 'error';
    if (this.tokenHash && this.now() - this.lastSeen < CONNECTED_WINDOW_MS) return 'connected';
    if (this.pairing && this.pairing.expires > this.now()) return 'permission-required';
    if (this.studioRunning === false) return 'studio-not-detected';
    if (!this.everSeen && !this.tokenHash) return 'plugin-unavailable';
    return 'disconnected';
  }

  snapshot() {
    return {
      status: this.status,
      paired: !!this.tokenHash,
      pairingCode: this.pairing && this.pairing.expires > this.now() ? this.pairing.code : null,
      pairingExpiresAt: this.pairing?.expires ?? null,
      placeName: this.placeName,
      isRunning: this.isRunning,
      currentExerciseId: this.currentExerciseId,
      pendingPushes: this.pushes.map((p) => p.path),
      port: this.port,
      error: this.lastError,
    };
  }

  /** Called only from a user click in the Academy (explicit consent). */
  startPairing(): string {
    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
    this.pairing = { code, expires: this.now() + PAIR_TTL_MS, attempts: 0 };
    this.events.onChange();
    return code;
  }

  unpair() {
    this.tokenHash = null;
    this.pairing = null;
    this.lastSeen = 0;
    this.events.saveTokenHash(null);
    this.events.onChange();
  }

  setExercise(id: string | null) {
    if (id && !STUDIO_EXERCISE_BY_ID.has(id)) throw new Error('Onbekende Studio-oefening');
    this.currentExerciseId = id;
    this.events.onChange();
  }

  requestCheck() {
    this.checkRequested = true;
  }

  queuePush(path: string, source: string, baseSource: string): PendingPush {
    const push = { id: crypto.randomUUID(), path, source, baseSource };
    this.pushes = [...this.pushes.filter((p) => p.path !== path), push];
    this.events.onChange();
    return push;
  }

  // ---------------------------------------------------------------- HTTP
  private send(res: http.ServerResponse, status: number, body: unknown) {
    const data = JSON.stringify(body);
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(data);
  }

  private limited(key: string, perSecond: number): boolean {
    const t = this.now();
    const list = (this.rate.get(key) ?? []).filter((x) => t - x < 1000);
    list.push(t);
    this.rate.set(key, list);
    return list.length > perSecond;
  }

  private readBody(req: http.IncomingMessage): Promise<unknown> {
    return new Promise((resolve, reject) => {
      let size = 0;
      const chunks: Buffer[] = [];
      req.on('data', (c: Buffer) => {
        size += c.length;
        if (size > MAX_BODY) {
          reject(new Error('too-large'));
          req.destroy();
          return;
        }
        chunks.push(c);
      });
      req.on('end', () => {
        if (!chunks.length) return resolve({});
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        } catch {
          reject(new Error('bad-json'));
        }
      });
      req.on('error', reject);
    });
  }

  private authorized(req: http.IncomingMessage): boolean {
    const h = req.headers.authorization ?? '';
    const m = /^Bearer ([a-f0-9]{64})$/.exec(h);
    if (!m || !this.tokenHash) return false;
    const a = Buffer.from(sha(m[1]), 'hex');
    const b = Buffer.from(this.tokenHash, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }

  private async handle(req: http.IncomingMessage, res: http.ServerResponse) {
    try {
      const remote = req.socket.remoteAddress ?? '';
      if (!['127.0.0.1', '::ffff:127.0.0.1', '::1'].includes(remote)) return this.send(res, 403, { error: 'forbidden' });
      const host = (req.headers.host ?? '').toLowerCase();
      if (host !== `127.0.0.1:${this.port}` && host !== `localhost:${this.port}`) return this.send(res, 403, { error: 'bad-host' });
      if (req.headers.origin) return this.send(res, 403, { error: 'browser-requests-not-allowed' });

      const url = new URL(req.url ?? '/', `http://127.0.0.1:${this.port}`);
      const route = `${req.method} ${url.pathname}`;
      if (this.limited(url.pathname, route === 'POST /v1/pair' ? 3 : 20)) return this.send(res, 429, { error: 'rate-limited' });

      if (route === 'GET /v1/hello') {
        this.everSeen = true;
        this.events.onChange();
        return this.send(res, 200, { app: 'roblox-dev-academy', protocol: PROTOCOL_VERSION, paired: false });
      }
      if (req.method !== 'POST') return this.send(res, 404, { error: 'unknown-operation' });
      if (!(req.headers['content-type'] ?? '').startsWith('application/json')) return this.send(res, 415, { error: 'json-only' });

      let body: unknown;
      try {
        body = await this.readBody(req);
      } catch (e) {
        return this.send(res, (e as Error).message === 'too-large' ? 413 : 400, { error: (e as Error).message });
      }

      if (url.pathname === '/v1/pair') {
        this.everSeen = true;
        const p = Schemas.pair.safeParse(body);
        if (!p.success) return this.send(res, 400, { error: 'invalid' });
        const pairing = this.pairing;
        if (!pairing || pairing.expires < this.now()) return this.send(res, 403, { error: 'no-pairing-active', message: 'Klik eerst op "Koppelen" in de Academy.' });
        pairing.attempts++;
        const ok = crypto.timingSafeEqual(Buffer.from(p.data.code), Buffer.from(pairing.code));
        if (!ok) {
          if (pairing.attempts >= 5) this.pairing = null;
          this.events.onChange();
          return this.send(res, 403, { error: 'wrong-code', message: 'Deze code klopt niet.' });
        }
        const token = crypto.randomBytes(32).toString('hex');
        this.tokenHash = sha(token);
        this.events.saveTokenHash(this.tokenHash);
        this.pairing = null;
        this.lastSeen = this.now();
        this.placeName = p.data.placeName ?? null;
        this.events.onChange();
        return this.send(res, 200, { token });
      }

      if (!this.authorized(req)) return this.send(res, 401, { error: 'unauthorized', message: 'Koppel opnieuw met de Academy.' });
      const wasConnected = this.status === 'connected';
      this.lastSeen = this.now();
      this.everSeen = true;

      switch (url.pathname) {
        case '/v1/poll': {
          const p = Schemas.poll.safeParse(body);
          if (!p.success) return this.send(res, 400, { error: 'invalid' });
          this.placeName = p.data.placeName ?? this.placeName;
          this.isRunning = !!p.data.isRunning;
          if (!wasConnected) this.events.onChange();
          const ex = this.currentExerciseId ? STUDIO_EXERCISE_BY_ID.get(this.currentExerciseId) : undefined;
          const check = this.checkRequested;
          this.checkRequested = false;
          return this.send(res, 200, {
            exercise: ex
              ? { id: ex.id, title: ex.title, goal: ex.goal, steps: ex.steps, scriptClass: ex.scriptClass, scriptParent: ex.scriptParent, scriptName: ex.scriptName, starterSource: ex.starterSource, playtest: ex.playtest, queries: factQueries(ex) }
              : null,
            check,
            pushes: this.pushes.map((x) => ({ id: x.id, path: x.path, source: x.source, baseSource: x.baseSource })),
          });
        }
        case '/v1/report': {
          const p = Schemas.report.safeParse(body);
          if (!p.success) return this.send(res, 400, { error: 'invalid' });
          const ex = STUDIO_EXERCISE_BY_ID.get(p.data.exerciseId);
          if (!ex) return this.send(res, 404, { error: 'unknown-exercise' });
          this.events.onFacts(ex, p.data.facts as StudioFacts);
          return this.send(res, 200, { ok: true });
        }
        case '/v1/push-result': {
          const p = Schemas.pushResult.safeParse(body);
          if (!p.success) return this.send(res, 400, { error: 'invalid' });
          const push = this.pushes.find((x) => x.id === p.data.pushId);
          if (!push) return this.send(res, 404, { error: 'unknown-push' });
          this.pushes = this.pushes.filter((x) => x.id !== push.id);
          this.events.onPushResult(push, p.data);
          this.events.onChange();
          return this.send(res, 200, { ok: true });
        }
        case '/v1/pull': {
          const p = Schemas.pull.safeParse(body);
          if (!p.success) return this.send(res, 400, { error: 'invalid' });
          this.events.onPull(p.data.path, p.data.source);
          return this.send(res, 200, { ok: true });
        }
        case '/v1/log': {
          const p = Schemas.log.safeParse(body);
          if (!p.success) return this.send(res, 400, { error: 'invalid' });
          this.events.onLog(p.data.messages);
          return this.send(res, 200, { ok: true });
        }
        default:
          return this.send(res, 404, { error: 'unknown-operation' });
      }
    } catch {
      if (!res.headersSent) this.send(res, 500, { error: 'internal' });
    }
  }
}
