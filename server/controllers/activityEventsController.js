import { activityEventsService } from '../services/activityEventsService.js';
import { paginationSchema } from '../validators/eventSchemas.js';

function wrapAsync(fn) {
  return (req, res) =>
    Promise.resolve(fn(req, res)).catch((e) => {
      res.status(500).json({ error: e?.message || 'Internal server error' });
    });
}

function parsePagination(query) {
  const { page, limit } = paginationSchema.parse(query);
  return { page, limit };
}

function buildPaginationMeta(page, limit, total) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export const listActivityEvents = wrapAsync(async (req, res) => {
  const activityKey = String(req.params.activityKey || '').trim();
  const { page, limit } = parsePagination(req.query);
  const { rows, total } = await activityEventsService.listActivityEvents(activityKey, { page, limit });
  return res.json({ events: rows, pagination: buildPaginationMeta(page, limit, total) });
});

export const addActivityEvent = wrapAsync(async (req, res) => {
  const activityKey = String(req.params.activityKey || '').trim();
  const result = await activityEventsService.addActivityEvent(activityKey, req.body);
  return res.status(201).json({ ok: true, event: result });
});

export const deleteActivityEvent = wrapAsync(async (req, res) => {
  const activityKey = String(req.params.activityKey || '').trim();
  const eventId = String(req.params.eventId || '').trim();
  await activityEventsService.assertCanManage(req.body);
  const deleted = await activityEventsService.deleteActivityEvent(activityKey, eventId);
  if (!deleted) return res.status(404).json({ error: 'Event not found in manual activity events.' });
  return res.json({ ok: true });
});
