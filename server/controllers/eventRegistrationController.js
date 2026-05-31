import { capacityLockingService } from '../services/capacityLockingService.js';

function wrapAsync(fn) {
  return (req, res) =>
    Promise.resolve(fn(req, res)).catch((e) => {
      const status = e.status || 500;
      res.status(status).json({ error: e?.message || 'Internal server error' });
    });
}

export const registerForEvent = wrapAsync(async (req, res) => {
  const eventId = String(req.params.eventId || '').trim();
  const { fullName, email } = req.body;

  if (!eventId) {
    return res.status(400).json({ error: 'Event ID is required' });
  }
  if (!fullName || !email) {
    return res.status(400).json({ error: 'Full name and email are required' });
  }

  const result = await capacityLockingService.registerForEvent(eventId, fullName, email);
  return res.status(201).json(result);
});
