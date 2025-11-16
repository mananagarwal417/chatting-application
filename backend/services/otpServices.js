// backend/services/otpService.js
// Simple in-memory OTP service. Replace with Redis for production.

const DEFAULT_TTL_MS = 2 * 60 * 1000; // 2 minutes
const MIN_RESEND_INTERVAL_MS = 30 * 1000; // 30s between sends
const MAX_SENDS_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 5;

const store = new Map(); // recipient -> { code, expiresAt, attempts, sentHistory: [timestamp,...] }

// helper to generate a 6-digit code
function genCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * createOtp(recipient, options)
 * recipient: string (email or phone)
 * options: { ttlMs } optional
 * returns: { code, expiresAt }
 */
function createOtp(recipient, options = {}) {
  const now = Date.now();
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const info = store.get(recipient);

  // enforce resend interval & rate limit
  if (info && info.sentHistory && info.sentHistory.length) {
    const lastSent = info.sentHistory[info.sentHistory.length - 1];
    if (now - lastSent < MIN_RESEND_INTERVAL_MS) {
      throw new Error(`Too many requests. Wait ${Math.ceil((MIN_RESEND_INTERVAL_MS - (now - lastSent)) / 1000)}s`);
    }
    // prune sentHistory older than 1 hour
    info.sentHistory = info.sentHistory.filter(ts => now - ts <= 60 * 60 * 1000);
    if (info.sentHistory.length >= MAX_SENDS_PER_HOUR) {
      throw new Error('Rate limit reached. Try again later.');
    }
  }

  const code = genCode();
  const expiresAt = now + ttlMs;

  const newInfo = {
    code,
    expiresAt,
    attempts: 0,
    sentHistory: (info && info.sentHistory) ? [...info.sentHistory, now] : [now],
  };

  store.set(recipient, newInfo);
  return { code, expiresAt };
}

/**
 * verifyOtp(recipient, code)
 * returns: { ok: boolean, reason?: string }
 */
function verifyOtp(recipient, code) {
  const now = Date.now();
  const info = store.get(recipient);
  if (!info) return { ok: false, reason: 'No OTP generated for this recipient' };
  if (now > info.expiresAt) {
    store.delete(recipient);
    return { ok: false, reason: 'OTP expired' };
  }

  info.attempts = (info.attempts || 0) + 1;
  if (info.attempts > MAX_VERIFY_ATTEMPTS) {
    store.delete(recipient);
    return { ok: false, reason: 'Too many attempts. Try again later' };
  }

  if (info.code === code) {
    store.delete(recipient); // one-time use
    return { ok: true };
  } else {
    // keep the info (attempts increments) until expiry or attempts exceeded
    return { ok: false, reason: 'Invalid OTP' };
  }
}

// background cleanup of expired OTPs
setInterval(() => {
  const now = Date.now();
  for (const [recipient, info] of store.entries()) {
    if (info.expiresAt && now > info.expiresAt + 1000) { // +1s grace
      store.delete(recipient);
    }
  }
}, 30 * 1000); // every 30s

module.exports = {
  createOtp,
  verifyOtp,
  // expose internals for testing/debugging (optional)
  _store: store,
  // constants so other parts of app can respect the same TTL/rate limits
  DEFAULT_TTL_MS,
  MIN_RESEND_INTERVAL_MS,
  MAX_SENDS_PER_HOUR,
  MAX_VERIFY_ATTEMPTS,
};
