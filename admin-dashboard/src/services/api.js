/**
 * admin-dashboard/src/services/api.js
 *
 * DATA SOURCE ARCHITECTURE — two-tier read model
 * ─────────────────────────────────────────────────────────────────────
 * OFFLINE MODE  (VITE_API_BASE is empty)
 *   Both admin dashboard and frontend read/write from browser localStorage
 *   under the keys:  ns_db_events, ns_db_core_team, ns_db_membership
 *   Changes in admin dashboard are immediately visible on the same device.
 *
 * ONLINE MODE  (VITE_API_BASE is set to the backend URL)
 *   Admin dashboard:  calls /api/admin/* endpoints (authenticated)
 *   Frontend:         calls /api/content/* endpoints (public read-only)
 *   localStorage is ONLY used as a fallback if the API is unreachable.
 *
 * MEMBERSHIP RESPONSES
 *   Read from VITE_MEMBERSHIP_SCRIPT_URL (Google Apps Script) in the admin.
 *   The frontend writes to the same GAS endpoint via POST.
 *   If VITE_MEMBERSHIP_SCRIPT_URL is empty the admin shows an offline banner.
 * ─────────────────────────────────────────────────────────────────────
 */
import { eventEmitter, EVENTS } from './eventEmitter';
import { auth } from './auth';
import { broadcastContentUpdate, initAdminSocket } from './socketClient';

// Team images are served from the main app's public dir.
// Using URL strings avoids broken asset imports in the admin monorepo build.
const MAIN_APP = import.meta.env.VITE_MAIN_APP_URL || 'https://nexasphere-glbajaj.vercel.app';
const teamImg = (name) => `${MAIN_APP}/assets/${name}`;

// Initialize socket connection on module load (gracefully fails if server is down)
initAdminSocket();

const ayushImg = teamImg('ayush.png');
const tanishkImg = teamImg('tanishk.png');
const tusharImg = teamImg('tushar.png');
const swayamImg = teamImg('swayam.png');
const aryanImg = teamImg('aryan.png');
const vartikaImg = teamImg('vartika.png');
const ankitImg = teamImg('ankit.png');
const surjeetImg = teamImg('surjeet.png');
const asthaImg = teamImg('astha.png');
const aryaImg = teamImg('arya.png');
const roshniImg = teamImg('roshni.png');
const vikasImg = teamImg('vikas.png');

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

// Migration: upgrade pre-v2 localStorage seed to the full 12-member official team.
// Uses a version key so migrations are idempotent — they run exactly once per browser.
// If the schema version is already >= 2, skip entirely to avoid touching real data.
const SCHEMA_VERSION = 2;
try {
  const currentVersion = parseInt(localStorage.getItem('ns_db_schema_version') || '0', 10);
  if (currentVersion < SCHEMA_VERSION) {
    const oldTeamRaw = localStorage.getItem('ns_db_core_team');
    if (oldTeamRaw) {
      const oldTeam = JSON.parse(oldTeamRaw);
      const hasFakePhotos =
        oldTeam.length > 0 &&
        typeof oldTeam[0].photo === 'string' &&
        oldTeam[0].photo.startsWith('http://via.placeholder');
      if (oldTeam.length === 3 && hasFakePhotos) {
        localStorage.removeItem('ns_db_core_team');
        localStorage.removeItem('ns_db_events');
      }
    }
    localStorage.setItem('ns_db_schema_version', String(SCHEMA_VERSION));
  }
} catch (e) {
  if (import.meta.env.DEV) console.error('Migration failed', e);
}

// Mock DB helpers with default seeding
const getDb = (key, defaultVal) => {
  try {
    const data = localStorage.getItem(`ns_db_${key}`);
    if (data) return JSON.parse(data);

    // Seed initial data if empty
    if (key === 'events') {
      const initialEvents = [
        {
          id: '1',
          name: 'KSS #153 — Knowledge Sharing Session',
          shortName: 'KSS #153',
          date: 'March 14, 2025',
          description: "NexaSphere's inaugural Knowledge Sharing Session.",
          status: 'completed',
          icon: 'Brain',
          tags: ['AI', 'Learning'],
          category: 'kss',
          location: 'Conference Hall',
          capacity: 50,
          hasDetailPage: true,
          gradientColors: ['#6b21a8', '#7c3aed', '#a855f7'],
        },
        {
          id: '2',
          name: 'Workshop: Git & GitHub',
          shortName: 'Git & GitHub',
          date: 'April 24',
          description: 'Version control mastery for every developer.',
          status: 'upcoming',
          icon: 'Wrench',
          tags: ['Git', 'GitHub'],
          category: 'workshop',
          location: 'Computer Lab',
          capacity: 30,
          hasDetailPage: true,
          gradientColors: ['#0369a1', '#0ea5e9'],
        },
      ];
      setDb(key, initialEvents);
      return initialEvents;
    }
    if (key === 'core_team') {
      const initialTeam = [
        {
          id: '1',
          name: 'Ayush Sharma',
          role: 'Organiser',
          branch: 'CSE (AI & ML)',
          photo: ayushImg,
        },
        {
          id: '2',
          name: 'Tanishk Bansal',
          role: 'Organiser',
          branch: 'CSE',
          photo: tanishkImg,
        },
        {
          id: '4',
          name: 'Tushar Goswami',
          role: 'Core Team Member',
          branch: 'CSE (AI & ML)',
          photo: tusharImg,
        },
        {
          id: '3',
          name: 'Swayam Dwivedi',
          role: 'Core Team Member',
          branch: 'CSE',
          photo: swayamImg,
        },
        {
          id: '5',
          name: 'Aryan Singh',
          role: 'Core Team Member',
          branch: 'CS (AI & ML)',
          photo: aryanImg,
        },
        {
          id: '11',
          name: 'Vartika Sharma',
          role: 'Core Team Member',
          branch: 'CS',
          photo: vartikaImg,
        },
        {
          id: '6',
          name: 'Arya Kaushik',
          role: 'Core Team Member',
          branch: 'CS (AI & ML)',
          photo: aryaImg,
        },
        {
          id: '7',
          name: 'Astha Shukla',
          role: 'Core Team Member',
          branch: 'CS (AI & ML)',
          photo: asthaImg,
        },
        {
          id: '8',
          name: 'Ankit Singh',
          role: 'Core Team Member',
          branch: 'CS',
          photo: ankitImg,
        },
        {
          id: '9',
          name: 'Vikas Kumar Sharma',
          role: 'Core Team Member',
          branch: 'CSE',
          photo: vikasImg,
        },
        {
          id: '10',
          name: 'Suryjeet Singh',
          role: 'Core Team Member',
          branch: 'CS',
          photo: surjeetImg,
        },
        {
          id: '12',
          name: 'Roshni Gupta',
          role: 'Core Team Member',
          branch: 'CST',
          photo: roshniImg,
        },
      ];
      setDb(key, initialTeam);
      return initialTeam;
    }
    if (key === 'announcements') {
      const initialAnnouncements = [
        {
          id: '1',
          title: 'Welcome to the NexaSphere Admin Dashboard',
          content: 'Manage events, team members, announcements, and certificates with real-time updates.',
          category: 'general',
          pinned: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Upcoming Hackathon Registration Open',
          content: 'Registration for the national hackathon closes in 3 days. Push notifications are active.',
          category: 'event',
          pinned: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        }
      ];
      setDb(key, initialAnnouncements);
      return initialAnnouncements;
    }

    return defaultVal;
  } catch {
    return defaultVal;
  }
};
const setDb = (key, val) => localStorage.setItem(`ns_db_${key}`, JSON.stringify(val));

/**
 * Notify other origins (website on a different port) of content changes.
 * Dispatches a same-origin custom event AND posts a message to the
 * sync-bridge iframe so the website can pick up the change.
 */
function notifyContentUpdated(key) {
  window.dispatchEvent(new Event('ns-content-updated'));
  // Post to the sync-bridge iframe embedded by the website
  const bridge = document.querySelector('iframe[title="NexaSphere Sync Bridge"]');
  if (bridge?.contentWindow) {
    bridge.contentWindow.postMessage({ type: 'ns-sync', key }, '*');
  }
}

let isLoggingOut = false;

async function fetchWithAuth(url, options = {}) {
  const isOffline = auth.isOfflineMode();

  if (!isOffline) {
    // --- ONLINE: real API call ---
    try {
      const res = await fetch(`${API_BASE}${url}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.getToken()}`,
          ...options.headers,
        },
      });

      if (res.status === 401) {
        if (!isLoggingOut) {
          isLoggingOut = true;
          eventEmitter.emit(EVENTS.AUTH_TOKEN_EXPIRED);
          setTimeout(() => {
            isLoggingOut = false;
          }, 3000);
        }
        throw new Error('Session expired');
      }
      if (res.status === 204) return null;
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${res.status})`);
      }
      return res.json();
    } catch (e) {
      throw e;
    }
  }

  // --- OFFLINE MOCK DATABASE ---
  return new Promise((resolve) => {
    setTimeout(() => {
      const method = options.method || 'GET';
      const body = options.body ? JSON.parse(options.body) : null;

      // /api/admin/events
      if (url.startsWith('/api/admin/events')) {
        let events = getDb('events', []);
        if (method === 'GET') resolve({ events });
        if (method === 'POST') {
          const newEv = { ...body, id: Date.now().toString() };
          events = [newEv, ...events];
          setDb('events', events);
          resolve(newEv);
        }
        if (method === 'PUT') {
          const id = url.split('/').pop();
          events = events.map((e) => (e.id === id ? { ...body, id } : e));
          setDb('events', events);
          resolve({ ...body, id });
        }
        if (method === 'DELETE') {
          const id = url.split('/').pop();
          events = events.filter((e) => e.id !== id);
          setDb('events', events);
          resolve({ success: true });
        }
      }

      // /api/admin/activity-events
      else if (url.startsWith('/api/admin/activity-events')) {
        const parts = url.split('/');
        const activityKey = parts[3];
        const eventId = parts[4];
        let allActs = getDb('activity_events', {});
        let acts = allActs[activityKey] || [];

        if (method === 'GET') resolve({ events: acts });
        if (method === 'POST') {
          const newEv = { ...body, id: Date.now().toString() };
          allActs[activityKey] = [newEv, ...acts];
          setDb('activity_events', allActs);
          resolve(newEv);
        }
        if (method === 'DELETE') {
          allActs[activityKey] = acts.filter((e) => e.id !== eventId);
          setDb('activity_events', allActs);
          resolve({ success: true });
        }
      }

      // /api/admin/core-team
      else if (url.startsWith('/api/admin/core-team')) {
        let team = getDb('core_team', []);
        if (method === 'GET') resolve({ members: team });
        if (method === 'POST') {
          const newMem = { ...body, id: Date.now().toString() };
          team = [...team, newMem];
          setDb('core_team', team);
          resolve(newMem);
        }
        if (method === 'PUT') {
          const id = url.split('/').pop();
          team = team.map((m) => (m.id === id ? { ...body, id } : m));
          setDb('core_team', team);
          resolve({ ...body, id });
        }
        if (method === 'DELETE') {
          const id = url.split('/').pop();
          team = team.filter((m) => m.id !== id);
          setDb('core_team', team);
          resolve({ success: true });
        }
      }

      // /api/admin/membership
      else if (url.startsWith('/api/admin/membership')) {
        resolve({
          responses: [
            {
              timestamp: new Date().toISOString(),
              fullName: 'Test User',
              collegeEmail: 'test@glbajaj.org',
              rollNumber: '21001',
              course: 'B.Tech',
              branch: 'CSE',
              groupsSelected: 'Web, AI',
              submittedAt: new Date().toISOString(),
            },
          ],
        });
      }

      // /api/admin/announcements
      else if (url.startsWith('/api/admin/announcements')) {
        let announcements = getDb('announcements', []);
        if (method === 'GET') resolve({ announcements });
        if (method === 'POST') {
          const newAnn = {
            ...body,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
          };
          announcements = [newAnn, ...announcements];
          setDb('announcements', announcements);
          resolve(newAnn);
        }
        if (method === 'PUT') {
          const id = url.split('/').pop();
          announcements = announcements.map((a) => (a.id === id ? { ...body, id, updatedAt: new Date().toISOString() } : a));
          setDb('announcements', announcements);
          resolve({ ...body, id });
        }
        if (method === 'DELETE') {
          const id = url.split('/').pop();
          announcements = announcements.filter((a) => a.id !== id);
          setDb('announcements', announcements);
          resolve({ success: true });
        }
      }
    }, 300); // simulate slight network delay
  });
}

export const api = {
  events: {
    getAll: () => fetchWithAuth('/api/admin/events'),
    create: async (event) => {
      if (auth.isOfflineMode()) {
        eventEmitter.emit(EVENTS.NOTIFY, {
          type: 'warning',
          message: 'Offline — changes not saved to server',
        });
      }
      const result = await fetchWithAuth('/api/admin/events', {
        method: 'POST',
        body: JSON.stringify(event),
      });
      eventEmitter.emit(EVENTS.EVENT_CREATED, result);
      eventEmitter.emit(EVENTS.NOTIFY, {
        type: 'success',
        message: 'Event created',
      });
      broadcastContentUpdate('events');
      notifyContentUpdated('ns_db_events');
      return result;
    },
    update: async (id, event) => {
      if (auth.isOfflineMode()) {
        eventEmitter.emit(EVENTS.NOTIFY, {
          type: 'warning',
          message: 'Offline — changes not saved to server',
        });
      }
      const result = await fetchWithAuth(`/api/admin/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(event),
      });
      eventEmitter.emit(EVENTS.EVENT_UPDATED, result);
      eventEmitter.emit(EVENTS.NOTIFY, {
        type: 'success',
        message: 'Event updated',
      });
      broadcastContentUpdate('events');
      notifyContentUpdated('ns_db_events');
      return result;
    },
    delete: async (id) => {
      if (auth.isOfflineMode()) {
        eventEmitter.emit(EVENTS.NOTIFY, {
          type: 'warning',
          message: 'Offline — changes not saved to server',
        });
      }
      await fetchWithAuth(`/api/admin/events/${id}`, { method: 'DELETE' });
      eventEmitter.emit(EVENTS.EVENT_DELETED, { id });
      eventEmitter.emit(EVENTS.NOTIFY, {
        type: 'success',
        message: 'Event deleted',
      });
      broadcastContentUpdate('events');
      notifyContentUpdated('ns_db_events');
    },
  },

  activityEvents: {
    getAll: (activityKey) => fetchWithAuth(`/api/admin/activity-events/${activityKey}`),
    create: async (activityKey, event) => {
      if (auth.isOfflineMode()) {
        eventEmitter.emit(EVENTS.NOTIFY, {
          type: 'warning',
          message: 'Offline — changes not saved to server',
        });
      }
      const result = await fetchWithAuth(`/api/admin/activity-events/${activityKey}`, {
        method: 'POST',
        body: JSON.stringify(event),
      });
      eventEmitter.emit(EVENTS.ACTIVITY_EVENT_CREATED, {
        activityKey,
        event: result,
      });
      eventEmitter.emit(EVENTS.NOTIFY, {
        type: 'success',
        message: 'Activity event added',
      });
      broadcastContentUpdate('activities');
      notifyContentUpdated('ns_db_events');
    },
    delete: async (activityKey, eventId) => {
      if (auth.isOfflineMode()) {
        eventEmitter.emit(EVENTS.NOTIFY, {
          type: 'warning',
          message: 'Offline — changes not saved to server',
        });
      }
      await fetchWithAuth(`/api/admin/activity-events/${activityKey}/${eventId}`, {
        method: 'DELETE',
      });
      eventEmitter.emit(EVENTS.ACTIVITY_EVENT_DELETED, {
        activityKey,
        eventId,
      });
      eventEmitter.emit(EVENTS.NOTIFY, {
        type: 'success',
        message: 'Activity event deleted',
      });
      broadcastContentUpdate('activities');
      notifyContentUpdated('ns_db_events');
    },
  },

  coreTeam: {
    getAll: async () => {
      const result = await fetchWithAuth('/api/admin/core-team');
      const members = result?.members ?? result ?? [];

      // If Java DB is empty, seed it with the official team data
      // (photos are bundled assets and can't live in Java, so we always merge)
      if (members.length === 0) {
        // Return the local seeded team so admin always sees the real team
        const seeded = getDb('core_team', []);
        return { members: seeded };
      }
      return { members };
    },
    add: async (member) => {
      if (auth.isOfflineMode()) {
        eventEmitter.emit(EVENTS.NOTIFY, {
          type: 'warning',
          message: 'Offline — changes not saved to server',
        });
      }
      const result = await fetchWithAuth('/api/admin/core-team', {
        method: 'POST',
        body: JSON.stringify(member),
      });
      eventEmitter.emit(EVENTS.CORE_TEAM_MEMBER_ADDED, result);
      eventEmitter.emit(EVENTS.NOTIFY, {
        type: 'success',
        message: 'Member added',
      });
      broadcastContentUpdate('team');
      notifyContentUpdated('ns_db_core_team');
    },
    update: async (id, member) => {
      if (auth.isOfflineMode()) {
        eventEmitter.emit(EVENTS.NOTIFY, {
          type: 'warning',
          message: 'Offline — changes not saved to server',
        });
      }
      const result = await fetchWithAuth(`/api/admin/core-team/${id}`, {
        method: 'PUT',
        body: JSON.stringify(member),
      });
      eventEmitter.emit(EVENTS.CORE_TEAM_MEMBER_UPDATED, result);
      eventEmitter.emit(EVENTS.NOTIFY, {
        type: 'success',
        message: 'Member updated',
      });
      broadcastContentUpdate('team');
      notifyContentUpdated('ns_db_core_team');
    },
    remove: async (id) => {
      if (auth.isOfflineMode()) {
        eventEmitter.emit(EVENTS.NOTIFY, {
          type: 'warning',
          message: 'Offline — changes not saved to server',
        });
      }
      await fetchWithAuth(`/api/admin/core-team/${id}`, { method: 'DELETE' });
      eventEmitter.emit(EVENTS.CORE_TEAM_MEMBER_REMOVED, { id });
      eventEmitter.emit(EVENTS.NOTIFY, {
        type: 'success',
        message: 'Member removed',
      });
      broadcastContentUpdate('team');
      notifyContentUpdated('ns_db_core_team');
    },
  },

  membership: {
    getAll: () => fetchWithAuth('/api/admin/membership'),
  },

  recruitment: {
    getAll: () => fetchWithAuth('/api/admin/submissions/recruitment'),
    updateStatus: async (id, status) => {
      const result = await fetchWithAuth(`/api/admin/submissions/recruitment/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      eventEmitter.emit(EVENTS.NOTIFY, {
        type: 'success',
        message: `Application status updated to ${status}`,
      });
      return result;
    },
  },

  certificates: {
    getTemplates: () => fetchWithAuth('/api/admin/certificates/templates'),
    createTemplate: async (template) => {
      const result = await fetchWithAuth('/api/admin/certificates/templates', {
        method: 'POST',
        body: JSON.stringify(template),
      });
      eventEmitter.emit(EVENTS.NOTIFY, { type: 'success', message: 'Template saved' });
      return result;
    },
    updateTemplate: async (id, template) => {
      const result = await fetchWithAuth(`/api/admin/certificates/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(template),
      });
      eventEmitter.emit(EVENTS.NOTIFY, { type: 'success', message: 'Template updated' });
      return result;
    },
    deleteTemplate: async (id) => {
      await fetchWithAuth(`/api/admin/certificates/templates/${id}`, { method: 'DELETE' });
      eventEmitter.emit(EVENTS.NOTIFY, { type: 'success', message: 'Template deleted' });
    },
    getParticipants: (eventId) => fetchWithAuth(`/api/admin/certificates/participants/${eventId}`),
    addParticipant: async (eventId, participant) => {
      return fetchWithAuth(`/api/admin/certificates/participants/${eventId}`, {
        method: 'POST',
        body: JSON.stringify(participant),
      });
    },
    bulkAddParticipants: async (eventId, participants) => {
      return fetchWithAuth(`/api/admin/certificates/participants/${eventId}/bulk`, {
        method: 'POST',
        body: JSON.stringify(participants),
      });
    },
    generate: async (data) => {
      const result = await fetchWithAuth('/api/admin/certificates/generate', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      eventEmitter.emit(EVENTS.NOTIFY, {
        type: 'success',
        message: `Generated ${result.generated} certificate(s)`,
      });
      return result;
    },
    getAll: () => fetchWithAuth('/api/admin/certificates'),
    revoke: async (id) => {
      const result = await fetchWithAuth(`/api/admin/certificates/${id}/revoke`, {
        method: 'PATCH',
      });
      eventEmitter.emit(EVENTS.NOTIFY, { type: 'success', message: 'Certificate revoked' });
      return result;
    },
  },

  announcements: {
    getAll: () => fetchWithAuth('/api/admin/announcements'),
    create: async (announcement) => {
      if (auth.isOfflineMode()) {
        eventEmitter.emit(EVENTS.NOTIFY, {
          type: 'warning',
          message: 'Offline — changes not saved to server',
        });
      }
      const result = await fetchWithAuth('/api/admin/announcements', {
        method: 'POST',
        body: JSON.stringify(announcement),
      });
      eventEmitter.emit(EVENTS.ANNOUNCEMENT_CREATED, result);
      eventEmitter.emit(EVENTS.NOTIFY, {
        type: 'success',
        message: 'Announcement published',
      });
      broadcastContentUpdate('announcements');
      notifyContentUpdated('ns_db_announcements');
      return result;
    },
    update: async (id, announcement) => {
      if (auth.isOfflineMode()) {
        eventEmitter.emit(EVENTS.NOTIFY, {
          type: 'warning',
          message: 'Offline — changes not saved to server',
        });
      }
      const result = await fetchWithAuth(`/api/admin/announcements/${id}`, {
        method: 'PUT',
        body: JSON.stringify(announcement),
      });
      eventEmitter.emit(EVENTS.ANNOUNCEMENT_UPDATED, result);
      eventEmitter.emit(EVENTS.NOTIFY, {
        type: 'success',
        message: 'Announcement updated',
      });
      broadcastContentUpdate('announcements');
      notifyContentUpdated('ns_db_announcements');
      return result;
    },
    delete: async (id) => {
      if (auth.isOfflineMode()) {
        eventEmitter.emit(EVENTS.NOTIFY, {
          type: 'warning',
          message: 'Offline — changes not saved to server',
        });
      }
      await fetchWithAuth(`/api/admin/announcements/${id}`, { method: 'DELETE' });
      eventEmitter.emit(EVENTS.ANNOUNCEMENT_DELETED, { id });
      eventEmitter.emit(EVENTS.NOTIFY, {
        type: 'success',
        message: 'Announcement deleted',
      });
      broadcastContentUpdate('announcements');
      notifyContentUpdated('ns_db_announcements');
    },
  },
};

export { auth, eventEmitter, EVENTS };
