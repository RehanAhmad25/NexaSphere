import 'dotenv/config';
import helmet from 'helmet';
import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { sendWelcomeVerificationEmail } from './services/emailService.js';
import { ZodError } from 'zod';
import { EventEmitter } from 'events';
import { normalizeFormSubmission } from './validators/formSchemas.js';
import { adminAuthMiddleware } from './middleware/adminAuthMiddleware.js';
import analyticsRouter from './routes/analytics.js';
import { initializeSocketIO, emitToRoom, getRoom } from './config/socket.js';
import adminStreamRouter from './routes/adminStream.js';
import { broadcastSSEEvent } from './services/sseService.js';
import {
  apiRateLimiter,
  authRateLimiter,
  formRateLimiter,
  notificationRateLimiter,
  portfolioRateLimiter,
  validateLimiters,
} from './middleware/rateLimiter.js';
import { getPublicAppUrl } from './utils/publicAppUrl.js';

// Import required controllers and services
import * as eventsController from './controllers/eventsController.js';
import * as activityEventsController from './controllers/activityEventsController.js';
import * as coreTeamController from './controllers/coreTeamController.js';
import * as formsController from './controllers/formsController.js';
import { eventsService } from './services/eventsService.js';
import { coreTeamService } from './services/coreTeamService.js';
import notificationsService from './services/notificationsService.js';
import { portfolioRepository } from './repositories/portfolioRepository.js';

// Fail fast on startup if any rate limiter failed to export correctly.
validateLimiters();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_FILE = path.join(__dirname, 'data', 'content.json');

const app = express();
const adminEvents = new EventEmitter();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((value) => value.trim()).filter(Boolean) : true,
  credentials: false,
}));
app.use(express.json({ limit: '512kb' }));

function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  const { method, path } = req;

  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e6;
    const status = res.statusCode;
    const message = `[${method}] ${path} → ${status} (${Math.round(duration)}ms)`;

    if (status >= 500) {
      console.error(message);
    } else if (status >= 400) {
      console.warn(message);
    } else {
      console.log(message);
    }
  });

  next();
}

app.use(requestLogger);

const adminAuth = adminAuthMiddleware.requireAdmin;
adminEvents.on('CORE_TEAM_MEMBER_ADDED', (event) => console.log(`[EVENT] CORE_TEAM_MEMBER_ADDED:`, event));
adminEvents.on('CORE_TEAM_MEMBER_REMOVED', (event) => console.log(`[EVENT] CORE_TEAM_MEMBER_REMOVED:`, event));

const defaultContent = {
  events: [
    {
      id: 'kss-153',
      name: 'KSS #153 — Knowledge Sharing Session',
      shortName: 'KSS #153',
      date: 'March 14, 2025',
      description: 'NexaSphere\'s inaugural Knowledge Sharing Session focused on the impact of AI.',
      status: 'completed',
      icon: 'Brain',
      tags: ['AI', 'Learning', 'Community'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  activityEvents: {},
  coreTeam: [],
};

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
export const HAS_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY);

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

function requiredStrongPassword(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);

  if (value.length < 12 || !hasLower || !hasUpper || !hasNumber || !hasSymbol) {
    throw new Error(
      `${name} must be at least 12 characters and include uppercase, lowercase, number, and symbol`,
    );
  }

  return value;
}

// Enforce admin event password format validation if it's set
const ADMIN_EVENT_PASSWORD = requiredStrongPassword('ADMIN_EVENT_PASSWORD');

getPublicAppUrl();

function normalizePrivateKey(k) {
  return k.includes('\\n') ? k.replace(/\\n/g, '\n') : k;
}

async function ensureContentFile() {
  const dir = path.dirname(CONTENT_FILE);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(CONTENT_FILE);
  } catch {
    await fs.writeFile(CONTENT_FILE, JSON.stringify(defaultContent, null, 2), 'utf8');
  }
}

// REST Endpoints
app.get('/healthz', async (req, res) => {
  try {
    const list = await eventsService.listEvents({ page: 1, limit: 1 });
    res.json({
      ok: true,
      events: list?.total ?? 0,
      storage: HAS_SUPABASE ? 'supabase' : 'file',
    });
  } catch (e) {
    res.status(503).json({
      ok: false,
      error: e?.message || 'Health check failed',
      storage: HAS_SUPABASE ? 'supabase' : 'file',
    });
  }
});

// Event channels/content
app.get('/api/content/events', eventsController.listEvents);
app.get('/api/content/activity-events/:activityKey', activityEventsController.listActivityEvents);
app.post('/api/content/activity-events/:activityKey', activityEventsController.addActivityEvent);
app.delete('/api/content/activity-events/:activityKey/:eventId', activityEventsController.deleteActivityEvent);

// Admin Auth Endpoints
app.post('/api/admin/login', authRateLimiter, adminAuthMiddleware.login);
app.post('/api/admin/logout', adminAuthMiddleware.logout);
app.use('/api/admin/analytics', adminAuth, analyticsRouter);
app.use('/api/admin/metrics', adminAuth, adminStreamRouter);

// Event Admin Management
app.get('/api/admin/events', adminAuth, eventsController.adminListEvents);
app.post('/api/admin/events', adminAuth, eventsController.adminCreateEvent);
app.put('/api/admin/events/:id', adminAuth, eventsController.adminUpdateEvent);
app.delete('/api/admin/events/:id', adminAuth, eventsController.adminDeleteEvent);

// Public listings
app.get('/api/content/team', async (req, res) => {
  try {
    const rawMembers = await coreTeamService.listMembers();
    const members = (rawMembers || []).map(m => {
      let email = m.email || null;
      if (email && !email.toLowerCase().endsWith('@glbajajgroup.org')) {
        email = null; // hide personal emails entirely
      }
      return {
        ...m,
        email,
        whatsapp: 'https://chat.whatsapp.com/FhpJEaod2g419jFMfqrhGZ' // official community link
      };
    });
    return res.json({ members });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to load core team' });
  }
});

app.get('/api/content/core-team', async (req, res) => {
  try {
    const rawMembers = await coreTeamService.listMembers();
    const members = (rawMembers || []).map(m => {
      let email = m.email || null;
      if (email && !email.toLowerCase().endsWith('@glbajajgroup.org')) {
        email = null; // hide personal emails entirely
      }
      return {
        ...m,
        email,
        whatsapp: 'https://chat.whatsapp.com/FhpJEaod2g419jFMfqrhGZ' // official community link
      };
    });
    return res.json({ members });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to load core team' });
  }
});

// Admin Team Management
app.get('/api/admin/core-team', adminAuth, coreTeamController.adminListCoreTeamMembers);
app.post('/api/admin/core-team', adminAuth, coreTeamController.adminAddCoreTeamMember);
app.delete('/api/admin/core-team/:id', adminAuth, coreTeamController.adminDeleteCoreTeamMember);

// Dynamic forms
app.post('/api/forms/membership', formRateLimiter, formsController.makeHandleForm('membership'));
app.post('/api/forms/recruitment', formRateLimiter, formsController.makeHandleForm('recruitment'));
app.post('/api/core-team/apply', formRateLimiter, formsController.makeHandleForm('core_team'));

app.post('/api/submissions/membership', formRateLimiter, formsController.makeHandleForm('membership'));
app.post('/api/submissions/recruitment', formRateLimiter, formsController.makeHandleForm('recruitment'));

// Admin membership responses
app.get('/api/admin/membership', adminAuth, async (req, res) => {
  const scriptUrl = process.env.MEMBERSHIP_SCRIPT_URL;
  const secret = process.env.MEMBERSHIP_SECRET;

  if (!scriptUrl || !secret) {
    return res.json({ responses: [] });
  }

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getResponses', token: secret }),
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script returned ${response.status}`);
    }

    const data = await response.json();
    return res.json({ responses: data.responses || [] });
  } catch (err) {
    console.error('[Membership] Failed to fetch responses:', err.message);
    return res.status(500).json({ error: 'Failed to fetch membership responses' });
  }
});

// Real-time Push Subscriber channels
const pushSubscriptions = new Set();
app.post('/api/notifications/subscribe', (req, res) => {
  try {
    const { subscription } = req.body;
    if (subscription) {
      pushSubscriptions.add(JSON.stringify(subscription));
      if (pushSubscriptions.size > 10000) {
        const oldest = pushSubscriptions.values().next().value;
        pushSubscriptions.delete(oldest);
      }
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications/unsubscribe', (req, res) => {
  try {
    const { subscription } = req.body;
    if (subscription) pushSubscriptions.delete(JSON.stringify(subscription));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Server side notifications store api
app.get('/api/notifications', (req, res) => {
  try {
    const userId = req.query.userId || 'global';
    const list = notificationsService.getNotifications(userId);
    return res.json({ notifications: list });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications/mark-read', adminAuth, notificationRateLimiter, (req, res) => {
  try {
    const { id, userId } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });
    const uid = userId || 'global';
    const ok = notificationsService.markAsRead(uid, id);
    return res.json({ success: ok });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications/mark-all-read', adminAuth, notificationRateLimiter, (req, res) => {
  try {
    const { userId } = req.body || {};
    notificationsService.markAllAsRead(userId || 'global');
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notifications/:id', adminAuth, notificationRateLimiter, (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.query.userId || 'global';
    const removed = notificationsService.removeNotification(userId, id);
    if (!removed) return res.status(404).json({ error: 'Notification not found' });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notifications', adminAuth, notificationRateLimiter, (req, res) => {
  try {
    const userId = req.query.userId || 'global';
    notificationsService.clearAll(userId);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/notifications', adminAuth, notificationRateLimiter, (req, res) => {
  try {
    const { userId, title, message, type, link } = req.body || {};
    if (!title || !message) {
      return res.status(400).json({ error: 'title and message are required' });
    }
    const note = notificationsService.addNotification(userId || 'global', {
      title,
      message,
      type,
      link,
    });
    return res.json({ success: true, notification: note });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Portfolio routing support
app.get('/api/portfolio/:username', async (req, res) => {
  try {
    const username = String(req.params.username || '').trim();
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const portfolio = await portfolioRepository.getByUsername(username);
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    return res.json(portfolio);
  } catch (err) {
    console.error('Error fetching portfolio:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

const failedPasskeyAttempts = new Map();

function checkPasskeyLockout(username, ip) {
  const key = `${String(username || '').toLowerCase()}:${ip}`;
  const entry = failedPasskeyAttempts.get(key);
  if (!entry) return null;
  if (Date.now() > entry.lockoutUntil) {
    failedPasskeyAttempts.delete(key);
    return null;
  }
  return entry;
}

function recordFailedPasskeyAttempt(username, ip) {
  const key = `${String(username || '').toLowerCase()}:${ip}`;
  const entry = failedPasskeyAttempts.get(key) || { count: 0, lockoutUntil: 0 };
  entry.count += 1;
  if (entry.count >= 5) {
    entry.lockoutUntil = Date.now() + 15 * 60 * 1000; // 15 min lockout
    entry.count = 0;
  }
  failedPasskeyAttempts.set(key, entry);
  return entry;
}

function clearPasskeyAttempts(username, ip) {
  const key = `${String(username || '').toLowerCase()}:${ip}`;
  failedPasskeyAttempts.delete(key);
}

app.put('/api/portfolio', portfolioRateLimiter, async (req, res) => {
  try {
    const body = req.body || {};
    const username = String(body.username || '').trim();
    const passkey = String(body.passkey || '').trim();
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';

    if (!username || username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return res.status(400).json({
        error: 'Username can only contain alphanumeric characters, underscores, and hyphens',
      });
    }
    if (!passkey || passkey.length < 12) {
      return res.status(400).json({ error: 'Passkey must be at least 12 characters long' });
    }

    const lockout = checkPasskeyLockout(username, ip);
    if (lockout) {
      return res.status(429).json({
        error: 'Too many failed passkey attempts. Please try again later.',
      });
    }

    const isAuthorized = await portfolioRepository.verifyPasskey(username, passkey);
    if (!isAuthorized) {
      recordFailedPasskeyAttempt(username, ip);
      return res.status(401).json({ error: 'Incorrect passkey for this username' });
    }

    clearPasskeyAttempts(username, ip);

    const saved = await portfolioRepository.createOrUpdate(body);
    return res.json({ ok: true, portfolio: saved });
  } catch (err) {
    console.error('Error saving portfolio:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

process.on('unhandledRejection', (reason) => {
  console.error(
    '[Process] Unhandled rejection:',
    reason instanceof Error ? reason.message : reason,
  );
});

process.on('uncaughtException', (err) => {
  console.error(
    '[Process] Uncaught exception:',
    err instanceof Error ? err.message : err,
  );
  if (err && err.stack) console.error(err.stack);
});

const port = Number(process.env.PORT || 8787);
let server;

if (!process.env.VERCEL) {
  const boot = HAS_SUPABASE ? Promise.resolve() : ensureContentFile();
  boot.then(() => {
    server = app.listen(port, () => {
      console.log(`NexaSphere server listening on http://localhost:${port}`);
    });
    initializeSocketIO(server);
  });
} else {
  server = app.listen(port, () => {
    console.log(`NexaSphere server listening on http://localhost:${port}`);
  });
  initializeSocketIO(server);
}

export default app;
