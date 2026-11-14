/**
 * Free trial + paid full course.
 *
 * Free: the whole first two Luau courses (0 and 1) and the first three lessons of C++ and Java.
 * Paid ($9.99, one-time): everything else, unlocked with a license key: from Gumroad (checked online
 * once) or an offline-signed LUMORA1 key from the Lumora Discord bot (crypto/PayPal sales).
 *
 * SETUP (seller): create a Gumroad product, tick "Generate a unique license key per sale",
 * then paste its product ID below (Gumroad → product → Content/Settings → "product_id").
 * Until then the app shows the store page but cannot activate keys, and says so.
 */
export const LICENSE_CONFIG = {
  /** Gumroad product ID (not the permalink). Empty = selling not set up yet. */
  gumroadProductId: '',
  /** Page where students buy the full course. */
  buyUrl: 'https://gumroad.com/',
  price: '$9.99',
  /** Re-check the key online at most this often; offline use always keeps working. */
  recheckDays: 14,
  /**
   * Public Ed25519 key (raw 32 bytes, base64) of the Lumora Discord bot. Keys it signs ("LUMORA1-…",
   * sold via crypto/PayPal) are checked fully offline. Only the bot holds the private key.
   */
  offlinePublicKey: 'qD8SDMi2EKouKXIC2YEGhBjHb4MFMP1Bw7kXH+pPPdo=',
};

/** Offline-signed keys made by the Discord bot. */
export const OFFLINE_KEY_PATTERN = /^LUMORA1-[A-Za-z0-9_-]{102}$/;

export const FREE_COURSES = new Set(['course-0', 'course-1']);
export const FREE_LESSONS_PER_EXTRA_TRACK = 3;

export interface LicenseStatus {
  unlocked: boolean;
  /** Last 4 characters only, never the full key. */
  keyHint: string | null;
  sellingConfigured: boolean;
  buyUrl: string;
  price: string;
}

/** Gumroad keys look like 8 groups: XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX. Be generous, Gumroad decides. */
export const GUMROAD_KEY_PATTERN = /^[A-Za-z0-9]{4,12}(-[A-Za-z0-9]{4,12}){2,7}$/;
export const isLicenseKeyShape = (k: string) => OFFLINE_KEY_PATTERN.test(k) || GUMROAD_KEY_PATTERN.test(k);
