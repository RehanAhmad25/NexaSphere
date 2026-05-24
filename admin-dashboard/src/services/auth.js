const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const TOKEN_KEY = 'ns_admin_token';
const EMAIL_KEY = 'ns_admin_email';
const OFFLINE_FLAG_KEY = 'ns_offline_mode';

function generateMockToken() {
  return `offline-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const auth = {
  async login(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Invalid credentials');
      }
      const data = await res.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(EMAIL_KEY, cleanEmail);
      localStorage.removeItem(OFFLINE_FLAG_KEY);
      if (import.meta.env.DEV) console.log('[Auth] Logged in via LIVE Java backend');
      return data;
    } catch (err) {
      const isNetworkError = err instanceof TypeError && err.message.includes('fetch');
      if (isNetworkError && cleanEmail === 'nexasphere@glbajajgroup.org' && cleanPassword === 'Admin@123') {
        const mockToken = generateMockToken();
        localStorage.setItem(TOKEN_KEY, mockToken);
        localStorage.setItem(EMAIL_KEY, cleanEmail);
        localStorage.setItem(OFFLINE_FLAG_KEY, 'true');
        return { token: mockToken, email: cleanEmail, offline: true };
      }
      throw err;
    }
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(OFFLINE_FLAG_KEY);
    sessionStorage.clear();
  },

  getToken() { return localStorage.getItem(TOKEN_KEY); },
  getEmail() { return localStorage.getItem(EMAIL_KEY); },
  isAuthenticated() { return !!this.getToken(); },
  isOfflineMode() { return localStorage.getItem(OFFLINE_FLAG_KEY) === 'true'; },
};
