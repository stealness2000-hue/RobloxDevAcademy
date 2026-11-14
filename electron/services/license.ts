/**
 * License key check against Gumroad's public verify endpoint (no secret needed, no account data sent
 * except the product ID and the key the student typed). Offline-first: once a key is verified the
 * full course stays unlocked without internet; we only re-check now and then, and only lock again
 * when Gumroad clearly says the purchase was refunded, charged back or the key is unknown.
 */
import crypto from 'node:crypto';
import { GUMROAD_KEY_PATTERN, LICENSE_CONFIG, OFFLINE_KEY_PATTERN, type LicenseStatus } from '../../shared/license';
import { t } from '../../shared/i18n';

export interface LicenseStore {
  get(): { key: string; verifiedAt: string; lastCheckAt: string } | null;
  save(key: string): void;
  remove(): void;
}

type Fetch = (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

interface VerifyResponse {
  success?: boolean;
  message?: string;
  purchase?: { refunded?: boolean; chargebacked?: boolean; disputed?: boolean; product_id?: string };
}

const OFFLINE_EPOCH = Date.UTC(2026, 0, 1);
const ED25519_SPKI_HEADER = Buffer.from('302a300506032b6570032100', 'hex');

/**
 * Checks a LUMORA1 key made by the Discord bot: 12-byte payload + Ed25519 signature, base64url.
 * payload = [version 1][tier][uint16 BE days since 2026-01-01][8-byte random id]. Fully offline.
 */
export function verifyOfflineKey(key: string, publicKeyB64 = LICENSE_CONFIG.offlinePublicKey): { id: string; tier: number; issued: string } | null {
  const k = key.trim();
  if (!OFFLINE_KEY_PATTERN.test(k) || !publicKeyB64) return null;
  const raw = Buffer.from(k.slice('LUMORA1-'.length), 'base64url');
  if (raw.length !== 76 || raw[0] !== 1) return null;
  const payload = raw.subarray(0, 12);
  try {
    const pub = crypto.createPublicKey({ key: Buffer.concat([ED25519_SPKI_HEADER, Buffer.from(publicKeyB64, 'base64')]), format: 'der', type: 'spki' });
    if (!crypto.verify(null, payload, pub, raw.subarray(12))) return null;
  } catch {
    return null;
  }
  if (payload[1] !== 1) return null; // tier 1 = full course
  return { id: payload.subarray(4).toString('hex'), tier: payload[1], issued: new Date(OFFLINE_EPOCH + payload.readUInt16BE(2) * 86_400_000).toISOString().slice(0, 10) };
}

export class LicenseService {
  constructor(private store: LicenseStore, private fetchFn: Fetch, private productId = LICENSE_CONFIG.gumroadProductId, private offlinePublicKey = LICENSE_CONFIG.offlinePublicKey) {}

  status(): LicenseStatus {
    const l = this.store.get();
    return {
      unlocked: !!l,
      keyHint: l ? l.key.slice(-4) : null,
      sellingConfigured: !!this.productId || !!this.offlinePublicKey,
      buyUrl: LICENSE_CONFIG.buyUrl,
      price: LICENSE_CONFIG.price,
    };
  }

  /** 'valid' | 'invalid' (Gumroad said no) | 'offline' (could not ask). */
  private async verify(key: string): Promise<{ result: 'valid' | 'invalid' | 'offline'; message?: string }> {
    let res;
    try {
      res = await this.fetchFn('https://api.gumroad.com/v2/licenses/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ product_id: this.productId, license_key: key, increment_uses_count: 'false' }).toString(),
      });
    } catch {
      return { result: 'offline' };
    }
    let body: VerifyResponse = {};
    try {
      body = (await res.json()) as VerifyResponse;
    } catch {
      /* non-JSON answer */
    }
    if (res.status >= 500) return { result: 'offline' };
    if (!body.success) return { result: 'invalid', message: body.message };
    const p = body.purchase ?? {};
    if (p.refunded || p.chargebacked || p.disputed) return { result: 'invalid', message: t('This purchase was refunded or disputed.') };
    return { result: 'valid' };
  }

  async activate(rawKey: string): Promise<LicenseStatus> {
    const key = rawKey.trim();
    if (key.toUpperCase().startsWith('LUMORA1-')) {
      if (!verifyOfflineKey(key, this.offlinePublicKey)) throw new Error(t('This key is not valid. Copy it exactly as the Lumora bot sent it.'));
      this.store.save(key);
      return this.status();
    }
    if (!this.productId) throw new Error(t('Selling is not set up yet in this version, so keys cannot be checked. Please contact the seller.'));
    if (!GUMROAD_KEY_PATTERN.test(key)) throw new Error(t('That does not look like a license key. Copy it exactly from your Gumroad receipt.'));
    const v = await this.verify(key);
    if (v.result === 'offline') throw new Error(t('Could not reach Gumroad to check your key. Check your internet connection and try again.'));
    if (v.result === 'invalid') throw new Error(t('Gumroad did not accept this key.') + (v.message ? ` (${v.message})` : ''));
    this.store.save(key);
    return this.status();
  }

  deactivate(): LicenseStatus {
    this.store.remove();
    return this.status();
  }

  /** Background re-check; never locks because of being offline. */
  async recheck(now = Date.now()): Promise<void> {
    const l = this.store.get();
    if (!l) return;
    if (OFFLINE_KEY_PATTERN.test(l.key)) {
      // Offline keys never need the internet; only drop a stored key whose signature no longer checks out.
      if (!verifyOfflineKey(l.key, this.offlinePublicKey)) this.store.remove();
      return;
    }
    if (!this.productId) return;
    if (now - Date.parse(l.lastCheckAt) < LICENSE_CONFIG.recheckDays * 86_400_000) return;
    const v = await this.verify(l.key);
    if (v.result === 'valid') this.store.save(l.key);
    else if (v.result === 'invalid') this.store.remove();
  }
}
