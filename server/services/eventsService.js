import { supabaseRequest, HAS_SUPABASE } from '../storage/supabaseClient.js';
import { readContent, writeContent } from '../storage/contentFileStore.js';
import { sanitizeEventRecord } from '../utils/sanitize.js';

function toSafeString(value, max = 4000) {
  return String(value ?? '').trim().slice(0, max);
}

function sanitizeInput(event = {}) {
  const status = event.status === 'upcoming' ? 'upcoming' : 'completed';
  const tags = Array.isArray(event.tags)
    ? event.tags.map(t => toSafeString(t, 40)).filter(Boolean).slice(0, 12)
    : String(event.tags || '').split(',').map(t => t.trim()).filter(Boolean).slice(0, 12);

  return {
    id: toSafeString(event.id || event.shortName || event.name, 80)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `event-${Date.now()}`,
    name: toSafeString(event.name, 120),
    shortName: toSafeString(event.shortName || event.name, 60),
    date: toSafeString(event.date, 80),
    description: toSafeString(event.description, 1200),
    status,
    icon: toSafeString(event.icon || 'Pin', 32),
    tags,
  };
}

export const eventsService = {
  async listEvents() {
    if (HAS_SUPABASE) {
      const rows = await supabaseRequest('events?select=*&order=created_at.desc');
      return rows.map(r => sanitizeEventRecord({
        id: r.id,
        name: r.name,
        shortName: r.short_name || r.shortName || r.name,
        date: r.date_text || r.date,
        description: r.description,
        status: r.status,
        icon: r.icon || 'Pin',
        tags: Array.isArray(r.tags) ? r.tags : [],
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    }
    const content = await readContent();
    return (content.events || []).map(e => sanitizeEventRecord(e));
  },

  async createEvent(input) {
    const event = sanitizeInput(input || {});
    if (HAS_SUPABASE) {
      let payload = {
        id: event.id,
        name: event.name,
        short_name: event.shortName,
        date_text: event.date,
        description: event.description,
        status: event.status,
        icon: event.icon,
        tags: event.tags,
      };
      let row;
      try {
        [row] = await supabaseRequest('events', { method: 'POST', body: [payload] });
      } catch (e) {
        payload = { ...payload, id: `${event.id}-${Date.now()}` };
        [row] = await supabaseRequest('events', { method: 'POST', body: [payload] });
      }
      return sanitizeEventRecord({
        id: row.id,
        name: row.name,
        shortName: row.short_name || row.name,
        date: row.date_text,
        description: row.description,
        status: row.status,
        icon: row.icon || 'Pin',
        tags: Array.isArray(row.tags) ? row.tags : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }

    const content = await readContent();
    content.events = content.events || [];
    const toInsert = { ...event, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    content.events.unshift(toInsert);
    await writeContent(content);
    return sanitizeEventRecord(content.events[0]);
  },

  async updateEvent(id, patch) {
    const sanitizedPatch = sanitizeInput({ ...patch, id });
    if (HAS_SUPABASE) {
      const [row] = await supabaseRequest(`events?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: {
          name: sanitizedPatch.name,
          short_name: sanitizedPatch.shortName,
          date_text: sanitizedPatch.date,
          description: sanitizedPatch.description,
          status: sanitizedPatch.status,
          icon: sanitizedPatch.icon,
          tags: sanitizedPatch.tags,
          updated_at: new Date().toISOString(),
        },
      });
      if (!row) return null;
      return sanitizeEventRecord({
        id: row.id,
        name: row.name,
        shortName: row.short_name || row.name,
        date: row.date_text,
        description: row.description,
        status: row.status,
        icon: row.icon || 'Pin',
        tags: Array.isArray(row.tags) ? row.tags : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }

    const content = await readContent();
    const idx = content.events.findIndex(e => e.id === id);
    if (idx < 0) return null;
    content.events[idx] = { ...content.events[idx], ...sanitizedPatch, id, updatedAt: new Date().toISOString() };
    await writeContent(content);
    return sanitizeEventRecord(content.events[idx]);
  },

  async deleteEvent(id) {
    if (HAS_SUPABASE) {
      const rows = await supabaseRequest(`events?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      return Array.isArray(rows) && rows.length > 0;
    }
    const content = await readContent();
    const before = (content.events || []).length;
    content.events = (content.events || []).filter(e => e.id !== id);
    if (content.events.length === before) return false;
    await writeContent(content);
    return true;
  },
};
import { eventsRepository } from '../repositories/eventsRepository.js';
import { eventSchema } from '../validators/eventSchemas.js';

export const eventsService = {
  async listEvents() {
    if (HAS_SUPABASE) {
      const rows = await supabaseRequest('events?select=*&order=created_at.desc');
      return rows.map((row) => sanitizeEventRecord({
        id: row.id,
        name: row.name,
        shortName: row.short_name || row.shortName || row.name,
        date: row.date_text || row.date,
        description: row.description,
        status: row.status,
        icon: row.icon || 'Pin',
        tags: Array.isArray(row.tags) ? row.tags : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    }

    const content = await readContent();
    return (content.events || []).map((event) => sanitizeEventRecord(event));
  },

  async createEvent(input) {
    const event = eventSchema.parse(input);

    if (HAS_SUPABASE) {
      const payload = {
        id: event.id,
        name: event.name,
        short_name: event.shortName,
        date_text: event.date,
        description: event.description,
        status: event.status,
        icon: event.icon,
        tags: event.tags,
      };

      let row;
      try {
        [row] = await supabaseRequest('events', { method: 'POST', body: [payload] });
      } catch {
        [row] = await supabaseRequest('events', { method: 'POST', body: [{ ...payload, id: `${event.id}-${Date.now()}` }] });
      }

      return sanitizeEventRecord({
        id: row.id,
        name: row.name,
        shortName: row.short_name || row.name,
        date: row.date_text,
        description: row.description,
        status: row.status,
        icon: row.icon || 'Pin',
        tags: Array.isArray(row.tags) ? row.tags : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }

    const content = await readContent();
    content.events = content.events || [];
    const now = new Date().toISOString();
    content.events.unshift({ ...event, createdAt: now, updatedAt: now });
    await writeContent(content);
    return sanitizeEventRecord(content.events[0]);
  },

  async updateEvent(id, input) {
    const patch = eventPatchSchema.parse({ ...input, id });

    if (HAS_SUPABASE) {
      const [row] = await supabaseRequest(`events?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: {
          name: patch.name,
          short_name: patch.shortName,
          date_text: patch.date,
          description: patch.description,
          status: patch.status,
          icon: patch.icon,
          tags: patch.tags,
          updated_at: new Date().toISOString(),
        },
      });

      if (!row) return null;
      return sanitizeEventRecord({
        id: row.id,
        name: row.name,
        shortName: row.short_name || row.name,
        date: row.date_text,
        description: row.description,
        status: row.status,
        icon: row.icon || 'Pin',
        tags: Array.isArray(row.tags) ? row.tags : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }

    const content = await readContent();
    const index = (content.events || []).findIndex((event) => event.id === id);
    if (index < 0) return null;

    content.events[index] = { ...content.events[index], ...patch, id, updatedAt: new Date().toISOString() };
    await writeContent(content);
    return sanitizeEventRecord(content.events[index]);
  },

  async deleteEvent(id) {
    if (HAS_SUPABASE) {
      const rows = await supabaseRequest(`events?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      return Array.isArray(rows) && rows.length > 0;
    }

    const content = await readContent();
    const before = (content.events || []).length;
    content.events = (content.events || []).filter((event) => event.id !== id);
    if (content.events.length === before) return false;
    await writeContent(content);
    return true;
  },
};
