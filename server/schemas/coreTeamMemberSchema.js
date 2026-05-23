import { z } from 'zod';
import { normalizePhone, toSafeString, validateSection, validateWhatsApp } from '../utils/sanitize.js';

const optionalText = (max) => z.string().trim().max(max).optional().transform((value) => {
  const text = String(value ?? '').trim();
  return text ? toSafeString(text, max) : null;
});

const coreTeamMemberBaseSchema = z.object({
  id: z.string().trim().min(1).max(120).optional(),
  name: z.string().trim().min(1, 'name is required').max(100),
  role: z.string().trim().min(1, 'role is required').max(100),
  year: z.string().trim().min(1, 'year is required').max(20),
  branch: z.string().trim().min(1, 'branch is required').max(100),
  section: z.string().trim().min(1, 'section is required').max(12),
  email: z.string().trim().email('Invalid email format').max(140),
  whatsapp: z.string().trim().min(10).max(30),
  linkedin: optionalText(255),
  instagram: optionalText(255),
  photoUrl: optionalText(500),
});

export const coreTeamMemberSchema = coreTeamMemberBaseSchema
  .transform((data) => ({
    ...data,
    id: data.id || `core-${Date.now()}`,
    name: toSafeString(data.name, 100),
    role: toSafeString(data.role, 100),
    year: toSafeString(data.year, 20),
    branch: toSafeString(data.branch, 100),
    section: validateSection(data.section),
    email: toSafeString(data.email, 140).toLowerCase(),
    whatsapp: validateWhatsApp(data.whatsapp),
    linkedin: data.linkedin,
    instagram: data.instagram,
    photoUrl: data.photoUrl,
  }));

export const coreTeamMemberPatchSchema = coreTeamMemberBaseSchema.partial().transform((data) => ({
  ...data,
  email: data.email ? toSafeString(data.email, 140).toLowerCase() : data.email,
}));

export function normalizeCoreTeamGate(body = {}) {
  return {
    name: toSafeString(body.name, 120),
    email: toSafeString(body.email, 140).toLowerCase(),
    phone: normalizePhone(body.phone),
    password: toSafeString(body.password, 140),
  };
}
