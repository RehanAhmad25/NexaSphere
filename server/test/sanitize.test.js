import assert from 'node:assert/strict';
import test from 'node:test';

import {
  escapeHtml,
  sanitizeActivityEventRecord,
  sanitizeCoreTeamMemberRecord,
  sanitizeEventRecord,
} from '../utils/sanitize.js';

test('escapeHtml neutralizes script tags, ampersands, and quotes', () => {
  assert.equal(
    escapeHtml('<script>alert("x")</script> & "quoted" and \'single\''),
    '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &quot;quoted&quot; and &#39;single&#39;'
  );
});

test('sanitizeEventRecord escapes user-controlled event fields uniformly', () => {
  const sanitized = sanitizeEventRecord({
    name: '<script>Event</script> & "name"',
    shortName: '"Short" & <tag>',
    date: 'May 12, 2026',
    description: 'desc <b>bold</b> & "quote"',
    icon: '<Pin>',
    tags: ['<script>tag</script>', 'amp & quote "'],
  });

  assert.equal(sanitized.name, '&lt;script&gt;Event&lt;/script&gt; &amp; &quot;name&quot;');
  assert.equal(sanitized.shortName, '&quot;Short&quot; &amp; &lt;tag&gt;');
  assert.equal(sanitized.description, 'desc &lt;b&gt;bold&lt;/b&gt; &amp; &quot;quote&quot;');
  assert.equal(sanitized.icon, '&lt;Pin&gt;');
  assert.deepEqual(sanitized.tags, ['&lt;script&gt;tag&lt;/script&gt;', 'amp &amp; quote &quot;']);
});

test('sanitizeCoreTeamMemberRecord escapes profile fields and optional links', () => {
  const sanitized = sanitizeCoreTeamMemberRecord({
    name: '<script>Alice</script>',
    role: 'Lead & "Owner"',
    year: '3rd <year>',
    branch: 'CSE & IT',
    section: 'A',
    email: 'alice+test@example.com',
    whatsapp: '1234567890',
    linkedin: 'https://example.com/?q="x"&y=<z>',
    instagram: 'https://instagram.com/<handle>',
    photoUrl: 'https://cdn.example.com/"avatar".png?alt=<img>',
  });

  assert.equal(sanitized.name, '&lt;script&gt;Alice&lt;/script&gt;');
  assert.equal(sanitized.role, 'Lead &amp; &quot;Owner&quot;');
  assert.equal(sanitized.year, '3rd &lt;year&gt;');
  assert.equal(sanitized.branch, 'CSE &amp; IT');
  assert.equal(sanitized.linkedin, 'https://example.com/?q=&quot;x&quot;&amp;y=&lt;z&gt;');
  assert.equal(sanitized.instagram, 'https://instagram.com/&lt;handle&gt;');
  assert.equal(sanitized.photoUrl, 'https://cdn.example.com/&quot;avatar&quot;.png?alt=&lt;img&gt;');
});

test('sanitizeActivityEventRecord strips createdBy PII', () => {
  const sanitized = sanitizeActivityEventRecord({
    name: '<script>Session</script>',
    date: 'June 1, 2026',
    tagline: 'Tagline & "quote"',
    description: '<p>body</p> & "data"',
    createdBy: {
      name: 'Bob <admin>',
      email: 'bob@example.com',
      phone: '123-456-7890',
    },
  });

  assert.equal(sanitized.name, '&lt;script&gt;Session&lt;/script&gt;');
  assert.equal(sanitized.tagline, 'Tagline &amp; &quot;quote&quot;');
  assert.equal(sanitized.description, '&lt;p&gt;body&lt;/p&gt; &amp; &quot;data&quot;');
  assert.equal(sanitized.createdBy, undefined);
});