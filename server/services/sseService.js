import logger from '../utils/logger.js';
import { getPublicAppUrl } from '../utils/publicAppUrl.js';

const adminClients = new Set();
const MAX_SSE_CLIENTS = Math.max(1, parseInt(process.env.MAX_SSE_CLIENTS || '200', 10) || 200);
const HEARTBEAT_INTERVAL_MS = Math.max(
  5_000,
  parseInt(process.env.SSE_HEARTBEAT_INTERVAL_MS || '30000', 10) || 30_000
);
const MAX_DROPPED_WRITES = Math.max(
  1,
  parseInt(process.env.SSE_MAX_DROPPED_WRITES || '3', 10) || 3
);

function cleanupClient(res, reason, meta = {}) {
  if (!adminClients.has(res)) return;
  adminClients.delete(res);
  if (res._heartbeat) clearInterval(res._heartbeat);
  res._heartbeat = null;
  res._droppedWrites = 0;
  logger.info('SSE client removed', { reason, totalClients: adminClients.size, ...meta });
}

/**
 * Add SSE client
 */
export function addSSEClient(res) {
  if (adminClients.size >= MAX_SSE_CLIENTS) {
    logger.warn('SSE client rejected: max clients reached', {
      totalClients: adminClients.size,
      maxClients: MAX_SSE_CLIENTS,
    });
    // setupSSEHeaders likely already wrote headers; best-effort close.
    try {
      res.end();
    } catch (_) {
      // ignore
    }
    return;
  }

  adminClients.add(res);
  logger.info('SSE client connected', { totalClients: adminClients.size });

  res.on('close', () => {
    cleanupClient(res, 'close');
  });

  res.on('error', (error) => {
    adminClients.delete(res);
    if (res._heartbeat) clearInterval(res._heartbeat);
    logger.error('SSE client error', { error: error.message });
  });

  logger.info('SSE client connected', { totalClients: adminClients.size });
}

export function broadcastSSEEvent(eventName, data) {
  const eventData = JSON.stringify({
    type: eventName,
    data,
    timestamp: new Date().toISOString(),
  });
  const message = `event: ${eventName}\ndata: ${eventData}\n\n`;

  adminClients.forEach((client) => {
    try {
      const ok = client.write(message);
      if (!ok) {
        client._droppedWrites = (client._droppedWrites || 0) + 1;
        if (client._droppedWrites >= MAX_DROPPED_WRITES) {
          cleanupClient(client, 'backpressure');
          try {
            client.end();
          } catch (_) {
            // ignore
          }
        }
      } else {
        client._droppedWrites = 0;
      }
    } catch (error) {
      logger.error('Failed to send SSE event', { error: error.message });
      cleanupClient(client, 'write_error', { error: error?.message });
    }
  });

  logger.debug('SSE event broadcast', { event: eventName, clientCount: adminClients.size });
}

export function getConnectedSSEClientsCount() {
  return adminClients.size;
}

const HEALTH_CHECK_INTERVAL_MS = 60000;

setInterval(() => {
  const now = Date.now();
  for (const [client, joined] of adminClients) {
    if (now - joined > HEALTH_CHECK_INTERVAL_MS) {
      try {
        client.write(': ping\n\n');
      } catch {
        if (client._heartbeat) clearInterval(client._heartbeat);
        adminClients.delete(client);
        logger.warn('SSE client evicted (health check failed)', {
          totalClients: adminClients.size,
        });
      }
    }
  }
}, HEALTH_CHECK_INTERVAL_MS).unref();

export function setupSSEHeaders(req, res, next) {
  if (adminClients.size >= MAX_SSE_CLIENTS) {
    res.status(503).end('Too many SSE connections');
    return;
  }

  const allowedOrigin = getPublicAppUrl();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // The app-level cors() middleware already selected the correct origin.
  // Do not overwrite it here, or multi-origin deployments break.

  res.write(': SSE connection established\n\n');

  res._heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (error) {
      clearInterval(res._heartbeat);
      cleanupClient(res, 'heartbeat_error', { error: error?.message });
    }
  }, HEARTBEAT_INTERVAL_MS);

  res.on('close', () => {
    clearInterval(res._heartbeat);
    cleanupClient(res, 'close');
  });

  next();
}

export default {
  addSSEClient,
  broadcastSSEEvent,
  getConnectedSSEClientsCount,
  setupSSEHeaders,
};
