import assert from 'node:assert/strict';
import test from 'node:test';

import {
  __portfolioRepositoryInternals,
  canonicalizeUsername,
} from '../repositories/portfolioRepository.js';

test('canonicalizeUsername maps case variants to the same portfolio identity', () => {
  assert.equal(canonicalizeUsername(' Alice '), 'alice');
  assert.equal(canonicalizeUsername('alice'), 'alice');
  assert.equal(canonicalizeUsername('ALICE'), 'alice');
});

test('ensureSchema repairs case-variant duplicates before adding unique lower(username) index', async () => {
  const queries = [];
  const client = {
    async query(sql) {
      queries.push(sql.replace(/\s+/g, ' ').trim());
      return { rows: [] };
    },
  };

  await __portfolioRepositoryInternals.ensureSchema(client);

  const backupQuery = queries.find((query) =>
    query.includes('portfolio_username_case_duplicates_backup')
    && query.includes('TO_JSONB(duplicate_rows)')
  );
  const deleteDuplicateQuery = queries.find((query) =>
    query.includes('DELETE FROM portfolios p')
    && query.includes('PARTITION BY LOWER(TRIM(username))')
  );
  const canonicalUpdateQuery = queries.find((query) =>
    query.includes('UPDATE portfolios')
    && query.includes('SET username = LOWER(TRIM(username))')
  );
  const uniqueIndexQuery = queries.find((query) =>
    query.includes('CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolios_username_lower_unique')
    && query.includes('ON portfolios (LOWER(username))')
  );

  assert.ok(backupQuery, 'backs up Alice/alice style duplicate rows before repair');
  assert.ok(deleteDuplicateQuery, 'removes all but one row per canonical username');
  assert.ok(canonicalUpdateQuery, 'stores the canonical lowercase username');
  assert.ok(uniqueIndexQuery, 'enforces case-insensitive uniqueness in PostgreSQL');
  assert.ok(
    queries.indexOf(deleteDuplicateQuery) < queries.indexOf(uniqueIndexQuery),
    'duplicates are repaired before the unique index is created'
  );
});
