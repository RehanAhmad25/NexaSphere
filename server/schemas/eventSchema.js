import { z } from 'zod';
import { toSafeString } from '../utils/sanitize.js';

const tagsSchema = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((value) => {
    if (!value) return [];
    const list = Array.isArray(value)
      ? value
      : String(value)
          .split(',')
          .map((entry) => entry.trim());

    return list
      .map((entry) => toSafeString(entry, 40))
      .filter(Boolean)
      .slice(0, 12);
  });

const eventBaseSchema = z.object({
  id: z.string().trim().min(1).max(80).optional(),
  name: z.string().trim().min(1, 'name is required').max(120),
  shortName: z.string().trim().min(1).max(60).optional(),
  date: z.string().trim().min(1, 'date is required').max(80),
  description: z.string().trim().min(1, 'description is required').max(1200),
  status: z.enum(['upcoming', 'completed']).optional().default('completed'),
  icon: z.string().trim().max(32).optional().default('Pin'),
  tags: tagsSchema,
});

export const eventSchema = eventBaseSchema
  .transform((data) => {
    const baseId = data.id || data.shortName || data.name;
    const id = String(baseId)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `event-${Date.now()}`;

    return {
      ...data,
      id,
      name: toSafeString(data.name, 120),
      shortName: toSafeString(data.shortName || data.name, 60),
      date: toSafeString(data.date, 80),
      description: toSafeString(data.description, 1200),
      status: data.status === 'upcoming' ? 'upcoming' : 'completed',
      icon: toSafeString(data.icon || 'Pin', 32),
      tags: Array.isArray(data.tags) ? data.tags : [],
    };
  });

export const eventPatchSchema = eventBaseSchema.partial().transform((data) => ({
  ...data,
  tags: Array.isArray(data.tags) ? data.tags : data.tags || [],
}));
