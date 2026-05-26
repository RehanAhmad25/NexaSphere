import assert from 'node:assert/strict';
import test from 'node:test';

import { getPublicAppUrl } from '../utils/publicAppUrl.js';

test('getPublicAppUrl uses PUBLIC_APP_URL when configured', () => {
  assert.equal(
    getPublicAppUrl({
      PUBLIC_APP_URL: 'https://app.example.com/',
      CORS_ORIGIN: 'https://admin.example.com',
    }),
    'https://app.example.com'
  );
});

test('getPublicAppUrl selects the first configured CORS origin', () => {
  assert.equal(
    getPublicAppUrl({
      CORS_ORIGIN: ' http://localhost:5173, http://127.0.0.1:5173 ',
    }),
    'http://localhost:5173'
  );
});

test('getPublicAppUrl rejects comma-separated PUBLIC_APP_URL values', () => {
  assert.throws(
    () =>
      getPublicAppUrl({
        PUBLIC_APP_URL: 'https://app.example.com,https://admin.example.com',
      }),
    /PUBLIC_APP_URL must be a single URL/
  );
});

test('getPublicAppUrl falls back to the local frontend origin', () => {
  assert.equal(getPublicAppUrl({}), 'http://localhost:5173');
});
