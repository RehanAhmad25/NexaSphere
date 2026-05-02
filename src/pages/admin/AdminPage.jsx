import { useMemo, useState } from 'react';

const API_BASE = (import.meta.env?.VITE_API_BASE || '').replace(/\/+$/, '');
const api = (path) => API_BASE ? `${API_BASE}${path}` : path;

const initialForm = {
  id: '',
  name: '',
  shortName: '',
  date: '',
  description: '',
  status: 'upcoming',
  icon: '📌',
  tags: '',
};

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem('ns_admin_token') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [events, setEvents] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  async function login() {
    setErr(''); setMsg(''); setBusy(true);
    try {
      const res = await fetch(api('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Login failed');
      setToken(data.token);
      localStorage.setItem('ns_admin_token', data.token);
      setMsg('Logged in successfully.');
      await loadEvents(data.token);
    } catch (e) {
      setErr(e?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  async function loadEvents(forceToken = token) {
    setErr('');
    const res = await fetch(api('/api/admin/events'), {
      headers: {
        Authorization: `Bearer ${forceToken}`,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to load events');
    setEvents(data.events || []);
  }

  async function saveEvent() {
    setBusy(true); setErr(''); setMsg('');
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      const isEdit = !!editingId;
      const res = await fetch(api(isEdit ? `/api/admin/events/${editingId}` : '/api/admin/events'), {
        method: isEdit ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Save failed');
      setMsg(isEdit ? 'Event updated.' : 'Event created.');
      setForm(initialForm);
      setEditingId('');
      await loadEvents();
    } catch (e) {
      setErr(e?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  async function removeEvent(id) {
    if (!window.confirm('Delete this event?')) return;
    setBusy(true); setErr(''); setMsg('');
    try {
      const res = await fetch(api(`/api/admin/events/${id}`), {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Delete failed');
      setMsg('Event deleted.');
      await loadEvents();
    } catch (e) {
      setErr(e?.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  }

  function startEdit(ev) {
    setEditingId(ev.id);
    setForm({
      ...initialForm,
      ...ev,
      tags: Array.isArray(ev.tags) ? ev.tags.join(', ') : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function logout() {
    localStorage.removeItem('ns_admin_token');
    setToken('');
    setEvents([]);
    setMsg('Logged out.');
  }

  return (
    <div className="container" style={{ paddingTop: 120, paddingBottom: 80 }}>
      <h1 className="section-title">Admin Dashboard</h1>
      <p className="section-subtitle" style={{ marginBottom: 24 }}>
        Manage events without editing code. Updates are saved in backend storage and shown on the website.
      </p>

      {!token ? (
        <div style={{ maxWidth: 420, margin: '0 auto', display: 'grid', gap: 12 }}>
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="admin-input" />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="admin-input" />
          <button className="btn btn-primary" onClick={login} disabled={busy}>{busy ? 'Signing in...' : 'Login'}</button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={() => loadEvents()} disabled={busy}>Refresh Events</button>
            <button className="btn btn-outline" onClick={logout}>Logout</button>
          </div>

          <div style={{ maxWidth: 760, margin: '0 auto 28px', display: 'grid', gap: 10 }}>
            <input className="admin-input" placeholder="Event ID (optional)" value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} />
            <input className="admin-input" placeholder="Event Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input className="admin-input" placeholder="Short Name" value={form.shortName} onChange={e => setForm(f => ({ ...f, shortName: e.target.value }))} />
            <input className="admin-input" placeholder="Date (e.g. May 12, 2026)" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <textarea className="admin-input" placeholder="Description" rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <select className="admin-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
              <input className="admin-input" placeholder="Icon" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
              <input className="admin-input" placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={saveEvent} disabled={busy}>{editingId ? 'Update Event' : 'Create Event'}</button>
              {editingId ? <button className="btn btn-outline" onClick={() => { setEditingId(''); setForm(initialForm); }}>Cancel Edit</button> : null}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12, maxWidth: 900, margin: '0 auto' }}>
            {events.map(ev => (
              <div key={ev.id} style={{ border: '1px solid var(--bdr)', borderRadius: 14, padding: 14, background: 'var(--card)' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <strong>{ev.icon} {ev.name}</strong>
                  <span style={{ fontSize: 12, opacity: .8 }}>({ev.date})</span>
                </div>
                <p style={{ marginTop: 8 }}>{ev.description}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => startEdit(ev)}>Edit</button>
                  <button className="btn btn-outline btn-sm" onClick={() => removeEvent(ev.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {err ? <p style={{ color: '#ff5f7a', textAlign: 'center', marginTop: 14 }}>{err}</p> : null}
      {msg ? <p style={{ color: 'var(--c5)', textAlign: 'center', marginTop: 14 }}>{msg}</p> : null}

      <style>{`
        .admin-input {
          width: 100%;
          padding: 11px 12px;
          border-radius: 10px;
          border: 1px solid var(--bdr2);
          background: var(--card2);
          color: var(--t1);
          font-family: Rajdhani, sans-serif;
          font-size: .95rem;
        }
      `}</style>
    </div>
  );
}
