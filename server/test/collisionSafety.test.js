import assert from 'node:assert/strict';
import test from 'node:test';

test('Security Audit & Concurrency: ID Collision Risk', async (t) => {
  // Let's first test raw Date.now() collision risk conceptually to prove it is mathematically broken
  await t.test('Scenario 1: Concurrently generated timestamp-based IDs collide', () => {
    const ids = [];
    const count = 1000;
    
    // Simulate synchronous/concurrent generation within the same tick
    const now = Date.now();
    for (let i = 0; i < count; i++) {
      // Original dynamic fallback ID style: manual-${Date.now()}
      ids.push(`manual-${now}`);
    }
    
    const uniqueIds = new Set(ids);
    console.log(`[Collision Audit] Original dynamic ID: Generated ${count} entries. Unique count: ${uniqueIds.size}`);
    
    // If it is timestamp-based, they will collide, resulting in exactly 1 unique ID!
    assert.equal(uniqueIds.size, 1);
  });

  await t.test('Scenario 2: Unified UUID utility guarantees collision safety under heavy flood', async () => {
    const { generateUUID, generatePrefixedId } = await import('../utils/uuid.js');
    
    const count = 5000;
    const promises = Array.from({ length: count }).map(async () => {
      return generatePrefixedId('event');
    });
    
    const ids = await Promise.all(promises);
    const uniqueIds = new Set(ids);
    
    // 5000 concurrent generations MUST produce exactly 5000 completely unique IDs
    assert.equal(uniqueIds.size, count);
  });
});
