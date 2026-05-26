import {
  createAdminSession,
  getAdminSession,
  revokeAdminSession,
  startAdminSessionCleanup,
} from '../repositories/adminSessionsRepository.js';

const ADMIN_USERNAME = requiredEnv('ADMIN_USERNAME');
const ADMIN_PASSWORD = requiredStrongPassword('ADMIN_PASSWORD');
const LOGIN_WINDOW_MS = parsePositiveInteger(process.env.ADMIN_LOGIN_WINDOW_MS, 15 * 60 * 1000);
const LOGIN_MAX_ATTEMPTS = parsePositiveInteger(process.env.ADMIN_LOGIN_MAX_ATTEMPTS, 5);
const LOGIN_MAX_TRACKED_IPS = parsePositiveInteger(process.env.ADMIN_LOGIN_MAX_TRACKED_IPS, 10000);
const LOGIN_CLEANUP_INTERVAL_MS = parsePositiveInteger(process.env.ADMIN_LOGIN_CLEANUP_INTERVAL_MS, 15 * 60 * 1000);

const loginAttemptsByIp = new Map();

// Periodic background cleanup of expired IPs to prevent memory exhaustion
const cleanupAttemptsTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of loginAttemptsByIp.entries()) {
    if (entry.expiresAt <= now) {
      loginAttemptsByIp.delete(ip);
    }
  }
}, LOGIN_CLEANUP_INTERVAL_MS);

// Allow Node process to exit cleanly if this timer is active
if (cleanupAttemptsTimer && typeof cleanupAttemptsTimer.unref === 'function') {
  cleanupAttemptsTimer.unref();
}

function requiredEnv(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function requiredStrongPassword(name) {
  const value = requiredEnv(name);
  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);

  if (value.length < 12 || !hasLower || !hasUpper || !hasNumber || !hasSymbol) {
    throw new Error(
      `${name} must be at least 12 characters and include uppercase, lowercase, number, and symbol`
    );
  }

  return value;
}

function getClientIp(req) {
  const ip = String(req.ip || req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim() || 'unknown';
  // Truncate to maximum 128 characters to prevent extremely large malicious headers from causing memory exhaustion
  return ip.slice(0, 128);
}

function recordLoginAttempt(ip) {
  const now = Date.now();

  // Enforce size-based bound to protect against memory exhaustion via distributed/IP-rotating brute force
  if (loginAttemptsByIp.size >= LOGIN_MAX_TRACKED_IPS && !loginAttemptsByIp.has(ip)) {
    // 1. Evict any expired entries
    for (const [key, entry] of loginAttemptsByIp.entries()) {
      if (entry.expiresAt <= now) {
        loginAttemptsByIp.delete(key);
      }
    }

    // 2. If still full, use intelligent eviction to prioritize unblocked IPs over active brute-force attackers
    if (loginAttemptsByIp.size >= LOGIN_MAX_TRACKED_IPS) {
      let evictKey = null;
      for (const [key, entry] of loginAttemptsByIp.entries()) {
        if (entry.attempts <= LOGIN_MAX_ATTEMPTS) {
          evictKey = key;
          break;
        }
      }

      // Fallback to oldest entry (FIFO) only if all tracked IPs are currently blocked
      if (!evictKey) {
        evictKey = loginAttemptsByIp.keys().next().value;
      }

      if (evictKey) {
        loginAttemptsByIp.delete(evictKey);
      }
    }
  }

  const existing = loginAttemptsByIp.get(ip);
  const attempts = existing && existing.expiresAt > now ? existing.attempts : 0;
  const entry = {
    attempts: attempts + 1,
    expiresAt: now + LOGIN_WINDOW_MS,
  };
  loginAttemptsByIp.set(ip, entry);
  return entry;
}

function getLoginAttemptState(ip) {
  const state = loginAttemptsByIp.get(ip);
  if (!state) return null;
  if (state.expiresAt <= Date.now()) {
    loginAttemptsByIp.delete(ip);
    return null;
  }
  return state;
}

function clearLoginAttempts(ip) {
  loginAttemptsByIp.delete(ip);
}

startAdminSessionCleanup();

function parseBearer(authHeader = '') {
  if (!authHeader.startsWith('Bearer ')) return '';
  return authHeader.slice(7).trim();
}

async function requireAdmin(req, res, next) {
  try {
    if (req.query.token) {
      return res.status(400).json({ error: 'Do not pass tokens in URLs. Use Authorization: Bearer header.' });
    }

    const bearer = parseBearer(req.headers.authorization || '');
    const session = await getAdminSession(bearer);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.adminSession = session;
    return next();
  } catch {
    return res.status(500).json({ error: 'Unable to validate admin session' });
  }
}

async function login(req, res) {
  try {
    const u = String(req.body?.username || '').trim();
    const p = String(req.body?.password || '');
    const ip = getClientIp(req);

    const state = getLoginAttemptState(ip);
    if (state && state.attempts > LOGIN_MAX_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many login attempts. Please wait and try again.' });
    }

    if (u !== ADMIN_USERNAME || p !== ADMIN_PASSWORD) {
      recordLoginAttempt(ip);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    clearLoginAttempts(ip);

    const session = await createAdminSession({
      username: u,
      metadata: {
        userAgent: req.get('user-agent') || '',
        ip,
      },
    });

    return res.json({
      token: session.token,
      username: u,
      expiresAt: session.expiresAt,
    });
  } catch {
    return res.status(500).json({ error: 'Unable to create admin session' });
  }
}

async function logout(req, res) {
  try {
    const bearer = parseBearer(req.headers.authorization || '');
    if (bearer) {
      await revokeAdminSession(bearer);
    }

    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Unable to revoke admin session' });
  }
}

export const adminAuthMiddleware = {
  login,
  logout,
  requireAdmin,
  // Private test exports for auditing & validation
  _getLoginAttemptsMapSize: () => loginAttemptsByIp.size,
  _clearAllLoginAttempts: () => loginAttemptsByIp.clear(),
  _cleanupExpiredAttempts: () => {
    const now = Date.now();
    for (const [ip, entry] of loginAttemptsByIp.entries()) {
      if (entry.expiresAt <= now) {
        loginAttemptsByIp.delete(ip);
      }
    }
  },
  _getAttemptsTimer: () => cleanupAttemptsTimer,
};