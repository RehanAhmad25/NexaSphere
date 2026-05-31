import { describe, test, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';

// Set env before importing module under test (dynamic import to control timing)
const API_BASE = 'http://test:8080';
let auth;

beforeAll(async () => {
  process.env.VITE_API_BASE = API_BASE;
  const mod = await import('../../services/auth.js');
  auth = mod.auth;
});

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('auth.login', () => {
  test('sends POST with trimmed credentials and stores token + email + expiry', async () => {
    const token = 'eyJhbGciOiJIUzI1NiJ9.test-token';
    const expiresAt = '2026-06-01T12:00:00Z';
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token, expiresAt }),
    });

    const result = await auth.login('  Test@Example.com  ', '  secret123  ');

    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'secret123' }),
    });
    expect(localStorage.getItem('ns_admin_token')).toBe(token);
    expect(localStorage.getItem('ns_admin_email')).toBe('test@example.com');
    expect(localStorage.getItem('ns_admin_token_expiry')).toBe(expiresAt);
    expect(result.token).toBe(token);
  });

  test('stores token but not expiry when expiresAt is missing', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'tok' }),
    });

    await auth.login('a@b.com', 'x');

    expect(localStorage.getItem('ns_admin_token')).toBe('tok');
    expect(localStorage.getItem('ns_admin_token_expiry')).toBeNull();
  });

  test('throws error message from response body', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Account locked' }),
    });

    await expect(auth.login('a@b.com', 'x')).rejects.toThrow('Account locked');
  });

  test('throws "Invalid credentials" when response body has no error or message field', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'something went wrong' }),
    });

    await expect(auth.login('a@b.com', 'x')).rejects.toThrow('Invalid credentials');
  });

  test('throws "Invalid credentials" when response json() fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => { throw new Error('parse fail'); },
    });

    await expect(auth.login('a@b.com', 'x')).rejects.toThrow('Invalid credentials');
  });

  test('rethrows network errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    await expect(auth.login('a@b.com', 'x')).rejects.toThrow('Failed to fetch');
  });
});

describe('auth.logout', () => {
  test('clears all token/email/expiry from localStorage', async () => {
    localStorage.setItem('ns_admin_token', 'tok');
    localStorage.setItem('ns_admin_email', 'a@b.com');
    localStorage.setItem('ns_admin_token_expiry', '2026-06-01');
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    await auth.logout();

    expect(localStorage.getItem('ns_admin_token')).toBeNull();
    expect(localStorage.getItem('ns_admin_email')).toBeNull();
    expect(localStorage.getItem('ns_admin_token_expiry')).toBeNull();
  });

  test('sends fire-and-forget POST to logout endpoint', async () => {
    localStorage.setItem('ns_admin_token', 'bearer-tok');
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    await auth.logout();

    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/api/admin/logout`, {
      method: 'POST',
      headers: { Authorization: 'Bearer bearer-tok' },
    });
  });

  test('does not throw when logout POST fails', async () => {
    localStorage.setItem('ns_admin_token', 'tok');
    global.fetch = vi.fn().mockRejectedValue(new Error('net err'));

    await expect(auth.logout()).resolves.toBeUndefined();
    // localStorage should still be cleared even if POST fails
    expect(localStorage.getItem('ns_admin_token')).toBeNull();
  });

  test('does nothing fancy when no token exists', async () => {
    global.fetch = vi.fn();

    await auth.logout();

    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('auth.verifySession', () => {
  test('returns true when /api/admin/me returns ok', async () => {
    localStorage.setItem('ns_admin_token', 'valid-tok');
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    const result = await auth.verifySession();

    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/api/admin/me`, {
      headers: { Authorization: 'Bearer valid-tok' },
    });
  });

  test('returns false when /api/admin/me returns non-ok', async () => {
    localStorage.setItem('ns_admin_token', 'expired-tok');
    global.fetch = vi.fn().mockResolvedValue({ ok: false });

    const result = await auth.verifySession();

    expect(result).toBe(false);
  });

  test('returns false when no token in localStorage', async () => {
    const result = await auth.verifySession();
    expect(result).toBe(false);
  });

  test('returns false on network error without throwing', async () => {
    localStorage.setItem('ns_admin_token', 'tok');
    global.fetch = vi.fn().mockRejectedValue(new Error('net fail'));

    const result = await auth.verifySession();
    expect(result).toBe(false);
  });
});

describe('auth.getToken / getEmail', () => {
  test('getToken returns stored token', () => {
    localStorage.setItem('ns_admin_token', 'my-tok');
    expect(auth.getToken()).toBe('my-tok');
  });

  test('getToken returns null when no token', () => {
    expect(auth.getToken()).toBeNull();
  });

  test('getEmail returns stored email', () => {
    localStorage.setItem('ns_admin_email', 'user@example.com');
    expect(auth.getEmail()).toBe('user@example.com');
  });

  test('getEmail returns null when no email', () => {
    expect(auth.getEmail()).toBeNull();
  });
});

describe('auth.isOffline / isOfflineMode', () => {
  test('isOffline returns false when VITE_API_BASE is set', () => {
    expect(auth.isOffline()).toBe(false);
  });

  test('isOfflineMode mirrors isOffline', () => {
    expect(auth.isOfflineMode()).toBe(auth.isOffline());
  });
});
