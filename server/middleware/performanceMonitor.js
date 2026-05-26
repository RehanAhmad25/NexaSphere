/**
 * Performance Monitoring Middleware
 * Tracks response times, error rates, and other metrics
 */

import logger from "../utils/logger.js";
import { captureMessage, addBreadcrumb } from "../utils/sentry.js";

// Store metrics in memory (consider using Redis in production)
const metrics = {
  endpoints: {},
  errorRate: 0,
  totalRequests: 0,
  totalErrors: 0,
};

const MAX_TRACKED_ENDPOINTS = parsePositiveInteger(process.env.MONITORING_MAX_TRACKED_ENDPOINTS, 1000);

function parsePositiveInteger(val, defaultVal) {
  const parsed = parseInt(val, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : defaultVal;
}

function normalizePathPattern(path) {
  if (!path || typeof path !== 'string') return 'unknown';
  
  // Split path into segments
  const segments = path.split('/').map(segment => {
    // 1. UUID check
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(segment)) {
      return ':id';
    }
    
    // 2. MongoDB ObjectID check (24 hex characters)
    const mongoIdRegex = /^[0-9a-f]{24}$/i;
    if (mongoIdRegex.test(segment)) {
      return ':id';
    }
    
    // 3. Numeric ID check
    const numericRegex = /^\d+$/;
    if (numericRegex.test(segment)) {
      return ':id';
    }
    
    // 4. Return original segment if no dynamic pattern matches
    return segment;
  });
  
  return segments.join('/');
}

/**
 * Performance monitoring middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;

  // Override send to capture response
  res.send = function (data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // 1. Resolve to route pattern (if matched by router) or normalize raw path (for 404s/early middleware issues)
    let routePath = '';
    if (req.route) {
      if (typeof req.route.path === 'string') {
        routePath = req.route.path;
      } else if (Array.isArray(req.route.path)) {
        routePath = req.route.path.join('|');
      } else if (req.route.path instanceof RegExp) {
        routePath = req.route.path.toString();
      }
    }

    let endpoint = '';
    if (req.route) {
      endpoint = `${req.method} ${req.baseUrl || ''}${routePath}`;
    } else {
      const normalizedPath = normalizePathPattern(req.path);
      endpoint = `${req.method} ${normalizedPath}`;
    }

    // Trailing slash consolidation
    if (endpoint.length > 1 && endpoint.endsWith('/')) {
      endpoint = endpoint.slice(0, -1);
    }

    // Update metrics
    metrics.totalRequests++;
    if (statusCode >= 400) {
      metrics.totalErrors++;
    }

    // Update endpoint-specific metrics with upper bound validation
    if (!metrics.endpoints[endpoint]) {
      const currentKeys = Object.keys(metrics.endpoints);
      if (currentKeys.length >= MAX_TRACKED_ENDPOINTS) {
        // Safe FIFO eviction: delete the oldest inserted key (O(1) operation due to V8 key insertion ordering)
        const oldestKey = currentKeys[0];
        if (oldestKey) {
          delete metrics.endpoints[oldestKey];
        }
      }

      metrics.endpoints[endpoint] = {
        count: 0,
        totalTime: 0,
        errors: 0,
        avgTime: 0,
        maxTime: 0,
        minTime: Infinity,
      };
    }

    const endpointMetrics = metrics.endpoints[endpoint];
    endpointMetrics.count++;
    endpointMetrics.totalTime += duration;
    endpointMetrics.avgTime = endpointMetrics.totalTime / endpointMetrics.count;
    endpointMetrics.maxTime = Math.max(endpointMetrics.maxTime, duration);
    endpointMetrics.minTime = Math.min(endpointMetrics.minTime, duration);

    if (statusCode >= 400) {
      endpointMetrics.errors++;
    }

    // Calculate error rate
    metrics.errorRate = (metrics.totalErrors / metrics.totalRequests) * 100;

    // Log slow requests
    if (duration > 1000) {
      logger.warn("Slow Request Detected", {
        endpoint,
        duration,
        status: statusCode,
      });

      addBreadcrumb({
        category: "performance",
        message: `Slow request: ${endpoint} took ${duration}ms`,
        level: "warning",
        data: { duration, endpoint, status: statusCode },
      });

      // Alert if request took more than 5 seconds
      if (duration > 5000) {
        captureMessage(`Critical slow request: ${endpoint} took ${duration}ms`, "warning", {
          tags: { type: "performance", endpoint },
          extra: { duration, statusCode },
        });
      }
    }

    // Log response
    logger.http("HTTP Response", {
      method: req.method,
      url: req.originalUrl,
      status: statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id,
    });

    // Add breadcrumb for Sentry
    addBreadcrumb({
      category: "http",
      message: `${req.method} ${req.path} - ${statusCode}`,
      level: statusCode >= 400 ? "error" : "info",
      data: { duration, statusCode, method: req.method, path: req.path },
    });

    // Call original send
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Get current metrics
 */
const getMetrics = () => {
  return {
    totalRequests: metrics.totalRequests,
    totalErrors: metrics.totalErrors,
    errorRate: metrics.errorRate.toFixed(2) + "%",
    endpoints: Object.entries(metrics.endpoints).map(([endpoint, data]) => ({
      endpoint,
      count: data.count,
      avgTime: data.avgTime.toFixed(2) + "ms",
      maxTime: data.maxTime + "ms",
      minTime: data.minTime === Infinity ? 0 : data.minTime + "ms",
      errorCount: data.errors,
      errorRate: ((data.errors / data.count) * 100).toFixed(2) + "%",
    })),
  };
};

/**
 * Reset metrics
 */
const resetMetrics = () => {
  metrics.endpoints = {};
  metrics.errorRate = 0;
  metrics.totalRequests = 0;
  metrics.totalErrors = 0;
};

/**
 * Alert if error rate exceeds threshold
 */
const checkErrorRateThreshold = (threshold = 5) => {
  if (metrics.errorRate > threshold) {
    captureMessage(`Alert: Error rate exceeded ${threshold}%! Current: ${metrics.errorRate.toFixed(2)}%`, "error", {
      tags: { type: "performance", alert: "error_rate" },
      extra: { errorRate: metrics.errorRate, totalRequests: metrics.totalRequests },
    });

    logger.error("Error Rate Threshold Exceeded", {
      threshold,
      current: metrics.errorRate,
      totalRequests: metrics.totalRequests,
      totalErrors: metrics.totalErrors,
    });

    return true;
  }
  return false;
};

export {
  performanceMonitor,
  getMetrics,
  resetMetrics,
  checkErrorRateThreshold,
  metrics,
};
