const EVENTS_KEY = 'ns_db_events';
const TEAM_KEY = 'ns_db_core_team';

function safeJsonParse(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

function mergeById(fallbackItems, liveItems, normalize) {
  const byId = new Map();

  fallbackItems.forEach((item) => {
    const key = String(item.id ?? item.name ?? item.title);
    byId.set(key, item);
  });

  liveItems.forEach((item) => {
    const key = String(item.id ?? item.name ?? item.title);
    const previous = byId.get(key) || {};
    byId.set(key, normalize(previous, item, key));
  });

  return Array.from(byId.values());
}

export function getLocalEvents(fallbackEvents = []) {
  if (typeof window === 'undefined') return fallbackEvents;

  const stored = toArray(safeJsonParse(window.localStorage.getItem(EVENTS_KEY), []));
  if (!stored.length) return fallbackEvents;

  return mergeEvents(fallbackEvents, stored);
}

export function mergeEvents(fallbackEvents = [], liveEvents = []) {
  return mergeById(fallbackEvents, toArray(liveEvents), (previous, event, key) => ({
    ...previous,
    ...event,
    id: event.id ?? previous.id ?? key,
    name:
      event.name ??
      event.title ??
      event.shortName ??
      previous.name ??
      previous.title ??
      'Untitled Event',
    dateText: event.dateText ?? event.date ?? previous.dateText ?? previous.date,
    status: String(event.status ?? previous.status ?? 'upcoming').toLowerCase(),
    tags: normalizeTags(event.tags ?? previous.tags),
  }));
}

export function getLocalTeamMembers(fallbackMembers = []) {
  if (typeof window === 'undefined') return fallbackMembers;

  const stored = toArray(safeJsonParse(window.localStorage.getItem(TEAM_KEY), []));
  if (!stored.length) return fallbackMembers;

  return mergeTeamMembers(fallbackMembers, stored);
}

export function mergeTeamMembers(fallbackMembers = [], liveMembers = []) {
  return mergeById(fallbackMembers, toArray(liveMembers), (previous, member, key) => {
    const adminPhoto = member.photo;
    const adminUsesDeploymentAsset =
      typeof adminPhoto === 'string' &&
      (adminPhoto.includes('/assets/') || adminPhoto.includes('nexasphere-glbajaj.vercel.app'));

    return {
      ...previous,
      ...member,
      id: member.id ?? previous.id ?? key,
      photo:
        adminUsesDeploymentAsset && previous.photo ? previous.photo : adminPhoto || previous.photo,
      achievements: toArray(member.achievements ?? previous.achievements),
      testimonials: toArray(member.testimonials ?? previous.testimonials),
    };
  });
}

export function subscribePublicContent(callback, intervalMs = 2000) {
  if (typeof window === 'undefined') return () => {};

  const onStorage = (event) => {
    if (!event.key || event.key === EVENTS_KEY || event.key === TEAM_KEY) callback();
  };

  const onNsContentUpdated = () => callback();

  window.addEventListener('storage', onStorage);
  window.addEventListener('ns-content-updated', onNsContentUpdated);
  const interval = window.setInterval(callback, intervalMs);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('ns-content-updated', onNsContentUpdated);
    window.clearInterval(interval);
  };
}

/**
 * Initialize the cross-origin localStorage sync bridge.
 * Embeds an invisible iframe pointing to the admin dashboard origin
 * so that localStorage changes in the admin are relayed to this origin.
 * Only active in offline/local development mode.
 */
let bridgeInitialized = false;
export function initStorageSyncBridge() {
  if (bridgeInitialized || typeof window === 'undefined') return;
  bridgeInitialized = true;

  const adminOrigin = 'http://localhost:5001';
  const bridgeUrl = `${adminOrigin}/sync-bridge.html`;

  // Check if we're in a cross-origin context (different port)
  const sameOrigin = window.location.origin === adminOrigin;
  if (sameOrigin) return;

  const iframe = document.createElement('iframe');
  iframe.src = bridgeUrl;
  iframe.style.cssText = 'position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none;';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.tabIndex = -1;

  iframe.onload = () => {
    console.log('[StorageSync] Bridge iframe loaded from', adminOrigin);
  };

  iframe.onerror = () => {
    console.debug('[StorageSync] Bridge iframe failed to load — offline sync unavailable.');
  };

  document.documentElement.appendChild(iframe);

  // Listen for messages relayed through the bridge
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'ns-content-updated' && event.data.key) {
      // Update our own localStorage to match the admin's
      if (event.data.value !== null) {
        localStorage.setItem(event.data.key, event.data.value);
      } else {
        localStorage.removeItem(event.data.key);
      }
      // Fire the custom event so subscribers pick it up
      window.dispatchEvent(new Event('ns-content-updated'));
    }
  });
}
