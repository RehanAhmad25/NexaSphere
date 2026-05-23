import { supabaseRequest, HAS_SUPABASE } from '../storage/supabaseClient.js';
import { readContent, writeContent } from '../storage/contentFileStore.js';
import { sanitizeActivityEventRecord } from '../utils/sanitize.js';
import { coreTeamService } from './coreTeamService.js';

function toSafeString(value, max = 4000) {
  return String(value ?? '').trim().slice(0, max);
}

function normalizePhone(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

export const activityEventsService = {
  async listActivityEvents(activityKey) {
    if (HAS_SUPABASE) {
      const rows = await supabaseRequest(`activity_events?activity_key=eq.${encodeURIComponent(activityKey)}&select=*&order=created_at.desc`);
      return rows.map(r => sanitizeActivityEventRecord({
        id: r.id,
        name: r.name,
        date: r.date_text || r.date,
        tagline: r.tagline,
        description: r.description,
        status: r.status || 'completed',
        createdAt: r.created_at,
      }));
    }
    const content = await readContent();
    return (content.activityEvents?.[activityKey] || []).map((event) => sanitizeActivityEventRecord(event));
  },

  async addActivityEvent(activityKey, body) {
    const event = {
      id: `manual-${Date.now()}`,
      name: toSafeString(body.eventName, 120),
      date: toSafeString(body.eventDate, 80),
      tagline: toSafeString(body.eventTagline, 240),
      description: toSafeString(body.eventDescription, 1200),
      status: 'completed',
      createdAt: new Date().toISOString(),
      createdBy: {
        name: toSafeString(body.name, 120),
        email: toSafeString(body.email, 140),
        phone: normalizePhone(body.phone),
      },
    };

    if (!event.name || !event.date || !event.description) {
      throw new Error('Event name, date and description are required.');
    }

    if (HAS_SUPABASE) {
      const [row] = await supabaseRequest('activity_events', {
        method: 'POST',
        body: [{
          id: event.id,
          activity_key: activityKey,
          name: event.name,
          date_text: event.date,
          tagline: event.tagline,
          description: event.description,
          status: event.status,
          created_by_name: event.createdBy?.name || '',
          created_by_email: event.createdBy?.email || '',
          created_by_phone: event.createdBy?.phone || '',
        }],
      });
      return sanitizeActivityEventRecord({
        id: row.id,
        name: row.name,
        date: row.date_text,
        tagline: row.tagline,
        description: row.description,
        status: row.status || 'completed',
        createdAt: row.created_at,
      });
    }

    const content = await readContent();
    content.activityEvents = content.activityEvents || {};
    content.activityEvents[activityKey] = content.activityEvents[activityKey] || [];
    content.activityEvents[activityKey].unshift(event);
    await writeContent(content);
    return sanitizeActivityEventRecord(event);
  },

  async deleteActivityEvent(activityKey, eventId) {
    if (HAS_SUPABASE) {
      const rows = await supabaseRequest(`activity_events?activity_key=eq.${encodeURIComponent(activityKey)}&id=eq.${encodeURIComponent(eventId)}`, { method: 'DELETE' });
      return Array.isArray(rows) && rows.length > 0;
    }
    const content = await readContent();
    content.activityEvents = content.activityEvents || {};
    const list = content.activityEvents[activityKey] || [];
    const next = list.filter(e => e.id !== eventId);
    if (next.length === list.length) return false;
    content.activityEvents[activityKey] = next;
    await writeContent(content);
    return true;
  },

  async assertCanManage(auth) {
    const expectedPassword = process.env.ADMIN_EVENT_PASSWORD || 'Admin@123';
    if (String(auth?.password || '') !== expectedPassword) throw new Error('Unauthorized');
    const n = String(auth?.name || '').trim().toLowerCase();
    const e = String(auth?.email || '').trim().toLowerCase();
    const p = normalizePhone(auth?.phone);

    const members = await coreTeamService.listMembers();
    const ok = members.some(m =>
      String(m.name || '').toLowerCase() === n &&
      String(m.email || '').toLowerCase() === e &&
      String(m.whatsapp || '').replace(/[^\d]/g, '') === p
    );
    if (!ok) throw new Error('Unauthorized');
  },
};
import { activityEventsRepository } from '../repositories/activityEventsRepository.js';
import { coreTeamService } from './coreTeamService.js';
import { UnauthorizedError } from '../utils/errors.js';

export const activityEventsService = {
  async listActivityEvents(activityKey) {
    if (HAS_SUPABASE) {
      const rows = await supabaseRequest(`activity_events?activity_key=eq.${encodeURIComponent(activityKey)}&select=*&order=created_at.desc`);
      return rows.map((row) => sanitizeActivityEventRecord({
        id: row.id,
        name: row.name,
        date: row.date_text || row.date,
        tagline: row.tagline,
        description: row.description,
        status: row.status || 'completed',
        createdAt: row.created_at,
      }));
    }

    const content = await readContent();
    return (content.activityEvents?.[activityKey] || []).map((event) => sanitizeActivityEventRecord(event));
  },

  async addActivityEvent(activityKey, input) {
    const event = activityEventSchema.parse(input);

    if (HAS_SUPABASE) {
      const [row] = await supabaseRequest('activity_events', {
        method: 'POST',
        body: [{
          id: event.id,
          activity_key: activityKey,
          name: event.name,
          date_text: event.date,
          tagline: event.tagline,
          description: event.description,
          status: event.status,
          created_by_name: event.createdBy?.name || '',
          created_by_email: event.createdBy?.email || '',
          created_by_phone: event.createdBy?.phone || '',
        }],
      });

      return sanitizeActivityEventRecord({
        id: row.id,
        name: row.name,
        date: row.date_text,
        tagline: row.tagline,
        description: row.description,
        status: row.status || 'completed',
        createdAt: row.created_at,
      });
    }

    const content = await readContent();
    content.activityEvents = content.activityEvents || {};
    content.activityEvents[activityKey] = content.activityEvents[activityKey] || [];
    content.activityEvents[activityKey].unshift(event);
    await writeContent(content);
    return sanitizeActivityEventRecord(event);
  },

  async deleteActivityEvent(activityKey, eventId, body) {
    await coreTeamService.assertCanManageActivityEvent(body);

    if (HAS_SUPABASE) {
      const rows = await supabaseRequest(`activity_events?activity_key=eq.${encodeURIComponent(activityKey)}&id=eq.${encodeURIComponent(eventId)}`, { method: 'DELETE' });
      return Array.isArray(rows) && rows.length > 0;
    }

    const content = await readContent();
    content.activityEvents = content.activityEvents || {};
    const list = content.activityEvents[activityKey] || [];
    const next = list.filter((event) => event.id !== eventId);
    if (next.length === list.length) return false;
    content.activityEvents[activityKey] = next;
    await writeContent(content);
    return true;
  },

};
