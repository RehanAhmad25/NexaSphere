import rateLimit from "express-rate-limit";
import logger from "../utils/logger.js";

// ---------------------------------------------------------------------------
// Shared env-var config for the general API limiter
// Override via API_RATE_LIMIT_WINDOW_MS and API_RATE_LIMIT_MAX in .env
// ---------------------------------------------------------------------------
const API_WINDOW_MS = process.env.API_RATE_LIMIT_WINDOW_MS
  ? parseInt(process.env.API_RATE_LIMIT_WINDOW_MS, 10)
  : 10 * 60 * 1000; // 10 minutes

const API_MAX_REQUESTS = process.env.API_RATE_LIMIT_MAX
  ? parseInt(process.env.API_RATE_LIMIT_MAX, 10)
  : 100;

// Shared env-var config for the form limiter
const FORM_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS
  ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10)
  : 10 * 60 * 1000; // 10 minutes

const FORM_MAX_REQUESTS = process.env.RATE_LIMIT_MAX_REQUESTS
  ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10)
  : 5;

// ---------------------------------------------------------------------------
// Global API rate limiter — applied to every /api route
// Protects against request flooding and database connection pool exhaustion.
// Previously missing: the export did not exist, so app.use("/api", apiRateLimiter)
// received undefined and Express silently skipped the middleware entirely.
// ---------------------------------------------------------------------------
export const apiRateLimiter = rateLimit({
  windowMs: API_WINDOW_MS,
  max: API_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    logger.warn("Global API rate limit exceeded", {
      ip: req.ip,
      path: req.originalUrl || req.path,
      method: req.method,
      limit: options.max,
      windowMs: options.windowMs,
    });
    res.status(options.statusCode).json({
      error: "Too many requests from this IP, please try again later.",
    });
  },
});

// ---------------------------------------------------------------------------
// Form submission rate limiter — applied to membership, recruitment, core-team
// ---------------------------------------------------------------------------
export const formRateLimiter = rateLimit({
  windowMs: FORM_WINDOW_MS,
  max: FORM_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    logger.warn("Rate limit exceeded for public form API", {
      ip: req.ip,
      path: req.originalUrl || req.path,
      method: req.method,
      limit: options.max,
      windowMs: options.windowMs,
    });
    res.status(options.statusCode).json({
      error: "Too many form submissions from this IP, please try again later.",
    });
  },
});

// Authentication rate limiter — 10 requests per IP per minute
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many login attempts, please try again after a minute.",
  },
});

// Notification mutation rate limiter — 60 requests per IP per 15 minutes
export const notificationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many notification requests, please try again later.",
  },
});

// Portfolio update rate limiter — 10 requests per IP per 15 minutes
export const portfolioRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      "Too many portfolio update attempts from this IP, please try again after 15 minutes.",
  },
});

// ---------------------------------------------------------------------------
// Startup guard — call once during server boot to catch missing exports early.
// Throws immediately if any limiter failed to initialise, preventing the silent
// "undefined middleware" failure mode that this issue was created to fix.
// ---------------------------------------------------------------------------
export function validateLimiters() {
  const limiters = {
    apiRateLimiter,
    formRateLimiter,
    authRateLimiter,
    notificationRateLimiter,
    portfolioRateLimiter,
  };

  for (const [name, limiter] of Object.entries(limiters)) {
    if (typeof limiter !== "function") {
      throw new Error(
        `Rate limiter misconfiguration: "${name}" is not a function. Check rateLimiter.js exports.`
      );
    }
  }
}
