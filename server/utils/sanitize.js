const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"'`]/g, (character) => HTML_ESCAPE_MAP[character]).trim();
}

function toSafeString(value, max = 4000) {
  return String(value ?? '').trim().slice(0, max);
}

function sanitizeText(value, max = 4000) {
  return escapeHtml(toSafeString(value, max));
}

function sanitizeNullableText(value, max = 4000) {
  const text = toSafeString(value, max);
  return text ? escapeHtml(text) : null;
}

function sanitizeTextArray(values, max = 40) {
  if (!Array.isArray(values)) {
    return String(values || '')
      .split(',')
      .map((entry) => sanitizeText(entry, max))
      .filter(Boolean)
      .slice(0, 12);
  }

  return values.map((entry) => sanitizeText(entry, max)).filter(Boolean).slice(0, 12);
}

function normalizePhone(value) {
  return String(value ?? '').replace(/[^\d]/g, '');
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim());
}

function validateWhatsApp(value) {
  const normalized = normalizePhone(value);
  if (!/^\d{10}$/.test(normalized)) {
    throw new Error('WhatsApp must be exactly 10 digits');
  }
  return normalized;
}

function validateSection(value) {
  const normalized = String(value ?? '').trim().toUpperCase();
  if (!/^[A-Z]$/.test(normalized)) {
    throw new Error('Section must be a single letter (A-Z)');
  }
  return normalized;
}

export function sanitizeEventRecord(event = {}) {
  return {
    ...event,
    name: sanitizeText(event.name, 120),
    shortName: sanitizeText(event.shortName || event.name, 60),
    date: sanitizeText(event.date, 80),
    description: sanitizeText(event.description, 1200),
    icon: sanitizeText(event.icon || 'Pin', 32),
    tags: sanitizeTextArray(event.tags, 40),
  };
}

export function sanitizeActivityEventRecord(event = {}) {
  return {
    ...event,
    name: sanitizeText(event.name, 120),
    date: sanitizeText(event.date, 80),
    tagline: sanitizeNullableText(event.tagline, 240),
    description: sanitizeText(event.description, 1200),
    createdBy: event.createdBy
      ? {
          name: sanitizeText(event.createdBy.name, 120),
          email: sanitizeText(event.createdBy.email, 140),
          phone: sanitizeText(event.createdBy.phone, 40),
        }
      : undefined,
  };
}

export function sanitizeCoreTeamMemberRecord(member = {}) {
  return {
    ...member,
    name: sanitizeText(member.name, 100),
    role: sanitizeText(member.role, 100),
    year: sanitizeText(member.year, 20),
    branch: sanitizeText(member.branch, 100),
    section: sanitizeText(member.section, 12),
    email: sanitizeText(member.email, 140),
    whatsapp: sanitizeText(member.whatsapp, 40),
    linkedin: sanitizeNullableText(member.linkedin, 255),
    instagram: sanitizeNullableText(member.instagram, 255),
    photoUrl: sanitizeNullableText(member.photoUrl, 500),
  };
}

export { escapeHtml, isEmail, normalizePhone, sanitizeNullableText, sanitizeText, sanitizeTextArray, toSafeString, validateSection, validateWhatsApp };