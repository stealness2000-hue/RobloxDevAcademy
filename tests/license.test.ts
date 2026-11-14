import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { LicenseService, verifyOfflineKey } from '../electron/services/license';

// A throwaway signer for tests (the real private key lives only in the Discord bot).
function makeSigner() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
  const spki = publicKey.export({ format: 'der', type: 'spki' });
  const pubB64 = spki.subarray(spki.length - 32).toString('base64');
  const sign = (tier = 1, days = 300) => {
    const payload = Buffer.alloc(12);
    payload[0] = 1;
    payload[1] = tier;
    payload.writeUInt16BE(days, 2);
    crypto.randomBytes(8).copy(payload, 4);
    return 'LUMORA1-' + Buffer.concat([payload, crypto.sign(null, payload, privateKey)]).toString('base64url');
  };
  return { pubB64, sign };
}

function memoryStore() {
  let row: { key: string; verifiedAt: string; lastCheckAt: string } | null = null;
  return {
    get: () => row,
    save: (key: string) => { row = { key, verifiedAt: new Date().toISOString(), lastCheckAt: new Date().toISOString() }; },
    remove: () => { row = null; },
  };
}

const noNetwork = async () => { throw new Error('offline'); };

describe('offline LUMORA1 license keys', () => {
  const a = makeSigner();
  const b = makeSigner();

  it('accepts a key signed by our key, fully offline', async () => {
    const key = a.sign();
    expect(key).toMatch(/^LUMORA1-[A-Za-z0-9_-]{102}$/);
    expect(verifyOfflineKey(key, a.pubB64)?.issued).toBe('2026-10-28');
    const svc = new LicenseService(memoryStore(), noNetwork, '', a.pubB64);
    const st = await svc.activate(key);
    expect(st.unlocked).toBe(true);
    expect(st.keyHint).toBe(key.slice(-4));
  });

  it('rejects a tampered key', async () => {
    const key = a.sign();
    const flipped = key.slice(0, 12) + (key[12] === 'A' ? 'B' : 'A') + key.slice(13);
    expect(verifyOfflineKey(flipped, a.pubB64)).toBeNull();
    await expect(new LicenseService(memoryStore(), noNetwork, '', a.pubB64).activate(flipped)).rejects.toThrow();
  });

  it('rejects a key from a different signer', async () => {
    const key = b.sign();
    expect(verifyOfflineKey(key, a.pubB64)).toBeNull();
    await expect(new LicenseService(memoryStore(), noNetwork, '', a.pubB64).activate(key)).rejects.toThrow();
  });

  it('rejects unknown tiers and malformed keys', () => {
    expect(verifyOfflineKey(a.sign(2), a.pubB64)).toBeNull();
    expect(verifyOfflineKey('LUMORA1-short', a.pubB64)).toBeNull();
  });

  it('never re-checks offline keys online', async () => {
    let calls = 0;
    const store = memoryStore();
    const svc = new LicenseService(store, async () => { calls++; throw new Error('x'); }, 'prod', a.pubB64);
    await svc.activate(a.sign());
    await svc.recheck(Date.now() + 365 * 86_400_000);
    expect(calls).toBe(0);
    expect(svc.status().unlocked).toBe(true);
  });

  it('the real bot public key is a valid Ed25519 key', () => {
    // Any valid-shaped key fails verification but must not throw.
    expect(verifyOfflineKey(a.sign())).toBeNull();
  });
});

describe('Gumroad keys', () => {
  const ok = { ok: true, status: 200, json: async () => ({ success: true, purchase: {} }) };
  it('activates when Gumroad accepts and stays unlocked when offline later', async () => {
    let online = true;
    const svc = new LicenseService(memoryStore(), async () => { if (!online) throw new Error('offline'); return ok; }, 'prod-id', '');
    expect((await svc.activate('AAAA1111-BBBB2222-CCCC3333-DDDD4444')).unlocked).toBe(true);
    online = false;
    await svc.recheck(Date.now() + 30 * 86_400_000);
    expect(svc.status().unlocked).toBe(true);
  });
  it('locks again when Gumroad reports a refund', async () => {
    let refunded = false;
    const svc = new LicenseService(memoryStore(), async () => ({ ok: true, status: 200, json: async () => ({ success: true, purchase: { refunded } }) }), 'prod-id', '');
    await svc.activate('AAAA1111-BBBB2222-CCCC3333-DDDD4444');
    refunded = true;
    await svc.recheck(Date.now() + 30 * 86_400_000);
    expect(svc.status().unlocked).toBe(false);
  });
  it('explains when Gumroad selling is not configured', async () => {
    await expect(new LicenseService(memoryStore(), noNetwork, '', '').activate('AAAA1111-BBBB2222-CCCC3333-DDDD4444')).rejects.toThrow(/not set up/);
  });
});

import { fromNumberTokens, toNumberTokens } from '../electron/services/translator';
describe('translator number tokens', () => {
  it('round-trips tokens and rejects lost or doubled ones', () => {
    expect(toNumberTokens('Lesson {0}: {1}')).toBe('Lesson 9101: 9102');
    expect(fromNumberTokens('Lección 9101: 9102', 2)).toBe('Lección {0}: {1}');
    expect(fromNumberTokens('Lección 910: 9102', 2)).toBeNull();
    expect(fromNumberTokens('9101 9101', 1)).toBeNull();
    expect(fromNumberTokens('Tiene 100 monedas 9101', 1)).toBe('Tiene 100 monedas {0}');
  });
});
