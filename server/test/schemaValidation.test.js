import assert from 'node:assert/strict';
import test from 'node:test';

import { eventSchema } from '../schemas/eventSchema.js';
import { activityEventSchema } from '../schemas/activityEventSchema.js';
import { coreTeamMemberSchema } from '../schemas/coreTeamMemberSchema.js';

test('event schema rejects missing and empty required fields', () => {
  assert.throws(() => eventSchema.parse({}));
  assert.throws(() => eventSchema.parse({ name: '', date: '2026-05-16', description: 'x' }));
  assert.throws(() => eventSchema.parse({ name: 'Event', date: '', description: 'x' }));
  assert.throws(() => eventSchema.parse({ name: 'Event', date: '2026-05-16', description: '' }));
});

test('event schema trims and normalizes long values', () => {
  const parsed = eventSchema.parse({
    name: '  Example Event  ',
    shortName: '  Short Name  ',
    date: '  May 16, 2026  ',
    description: '  Description  ',
    tags: [' alpha ', 'beta', '', 'gamma'],
  });

  assert.equal(parsed.name, 'Example Event');
  assert.equal(parsed.shortName, 'Short Name');
  assert.equal(parsed.date, 'May 16, 2026');
  assert.equal(parsed.description, 'Description');
  assert.deepEqual(parsed.tags, ['alpha', 'beta', 'gamma']);
});

test('activity event schema rejects missing fields and normalizes createdBy', () => {
  assert.throws(() => activityEventSchema.parse({}));

  const parsed = activityEventSchema.parse({
    name: '  Session  ',
    date: '  June 1, 2026  ',
    description: '  Body  ',
    tagline: '  Tagline  ',
    createdBy: { name: '  Alice  ', email: '  alice@example.com  ', phone: ' 123-456-7890 ' },
  });

  assert.equal(parsed.name, 'Session');
  assert.equal(parsed.date, 'June 1, 2026');
  assert.equal(parsed.tagline, 'Tagline');
  assert.equal(parsed.createdBy.name, 'Alice');
  assert.equal(parsed.createdBy.email, 'alice@example.com');
  assert.equal(parsed.createdBy.phone, '123-456-7890');
});

test('core team schema rejects invalid contact data', () => {
  assert.throws(() => coreTeamMemberSchema.parse({
    name: 'A',
    role: 'R',
    year: '3',
    branch: 'CSE',
    section: 'AA',
    email: 'not-an-email',
    whatsapp: '123',
  }), /Invalid email format|section must be a single letter|WhatsApp must be exactly 10 digits/i);
});

test('core team schema normalizes valid member data', () => {
  const parsed = coreTeamMemberSchema.parse({
    name: '  Alice  ',
    role: '  Lead  ',
    year: '  3rd  ',
    branch: '  CSE  ',
    section: '  a  ',
    email: '  Alice@Example.com  ',
    whatsapp: ' 12345-67890 ',
    linkedin: '  https://example.com  ',
  });

  assert.equal(parsed.name, 'Alice');
  assert.equal(parsed.role, 'Lead');
  assert.equal(parsed.section, 'A');
  assert.equal(parsed.email, 'alice@example.com');
  assert.equal(parsed.whatsapp, '1234567890');
  assert.equal(parsed.linkedin, 'https://example.com');
});
