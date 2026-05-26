import React, { useState, useEffect } from 'react';
import DashboardStats from '../../components/admin/analytics/DashboardStats';
import UserGrowthChart from '../../components/admin/analytics/UserGrowthChart';
import EventAttendanceChart from '../../components/admin/analytics/EventAttendanceChart';
import '../../components/admin/analytics/analytics.css';
import socketClient from '../../utils/socketClient';

export default function AdminPage({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ns_admin_token'));
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [data, setData] = useState({
    stats: null,
    growth: [],
    events: []
  });

  const fetchAnalytics = async (authToken) => {
    try {
      setLoading(true);
      const base = (import.meta?.env?.VITE_API_BASE || '').replace(/\/+$/, '');
      const headers = { 'Authorization': `Bearer ${authToken}` };
      
      const [statsRes, growthRes, eventsRes] = await Promise.all([
        fetch(`${base}/api/admin/analytics/stats`, { headers }),
        fetch(`${base}/api/admin/analytics/growth`, { headers }),
        fetch(`${base}/api/admin/analytics/events`, { headers })
      ]);

      if (statsRes.status === 401) {
        setToken(null);
        localStorage.removeItem('ns_admin_token');
        throw new Error('Session expired. Please login again.');
      }

      if (!statsRes.ok || !growthRes.ok || !eventsRes.ok) {
        throw new Error('Failed to fetch analytics data.');
      }

      const [stats, growth, events] = await Promise.all([
        statsRes.json(),
        growthRes.json(),
        eventsRes.json()
      ]);

      setData({ stats, growth, events });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics(token);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const base = (import.meta?.env?.VITE_API_BASE || '').replace(/\/+$/, '');
    const url = `${base}/api/admin/metrics/stream`;

    const listeners = {};
    let closed = false;
    let reconnectTimeout;

    async function connect() {
      if (closed) return;
      try {
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setToken(null);
            localStorage.removeItem('ns_admin_token');
            return;
          }
          throw new Error(`SSE connection failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let currentEvent = '';
        let currentData = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              currentData = line.slice(6);
            } else if (line === '' && currentEvent && currentData) {
              const event = { data: currentData };
              (listeners[currentEvent] || []).forEach(fn => fn(event));
              currentEvent = '';
              currentData = '';
            }
          }
        }
      } catch (err) {
        console.warn('Admin SSE metrics stream connection interrupted or reconnecting...', err);
      }

      if (!closed) {
        reconnectTimeout = setTimeout(connect, 3000);
      }
    }

    const sseClient = {
      addEventListener(event, fn) {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(fn);
      },
      close() {
        closed = true;
        clearTimeout(reconnectTimeout);
      },
    };

    sseClient.addEventListener('registration', (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const payload = parsed.data;

        setData(prev => {
          const currentStats = prev.stats || { totalUsers: null, activeRegistrations: null, upcomingEvents: null, conversionRate: null };
          const nextStats = {
            ...currentStats,
            totalUsers: currentStats.totalUsers !== null ? currentStats.totalUsers + 1 : 1,
            activeRegistrations: currentStats.activeRegistrations !== null ? currentStats.activeRegistrations + 1 : 1
          };

          const todayStr = new Date().toISOString().split('T')[0];
          const updatedGrowth = [...(prev.growth || [])];
          const todayIdx = updatedGrowth.findIndex(g => g.date === todayStr);
          if (todayIdx >= 0) {
            updatedGrowth[todayIdx] = {
              ...updatedGrowth[todayIdx],
              registrations: (updatedGrowth[todayIdx].registrations || 0) + 1
            };
          } else {
            updatedGrowth.push({ date: todayStr, registrations: 1 });
          }

          return {
            ...prev,
            stats: nextStats,
            growth: updatedGrowth
          };
        });
      } catch (err) {
        console.error('Failed to parse registration SSE message:', err);
      }
    });

    sseClient.addEventListener('login', (event) => {
      try {
        JSON.parse(event.data);
      } catch (err) {
        console.error('Failed to parse login SSE message:', err);
      }
    });

    connect();

    return () => {
      sseClient.close();
    };
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const base = (import.meta?.env?.VITE_API_BASE || '').replace(/\/+$/, '');
      const res = await fetch(`${base}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Login failed');

      localStorage.setItem('ns_admin_token', result.token);
      setToken(result.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ns_admin_token');
    setToken(null);
    setData({ stats: null, growth: [], events: [] });
    socketClient.destroySocket();
  };

  if (!token) {
    return (
      <div className="analytics-dashboard" style={{ maxWidth: 400, marginTop: '10vh' }}>
        <button onClick={onBack} className="btn-back">← Back</button>
        <div className="chart-container" style={{ padding: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Admin Login</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Username" 
              className="input-field" 
              value={loginData.username}
              onChange={e => setLoginData({...loginData, username: e.target.value})}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="input-field" 
              value={loginData.password}
              onChange={e => setLoginData({...loginData, password: e.target.value})}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Authenticating...' : 'Login to Dashboard'}
            </button>
          </form>
          {error && <p style={{ color: '#f87171', fontSize: '0.9rem', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button onClick={onBack} className="btn-back">← Back to Home</button>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', marginTop: '0.5rem' }}>Admin Analytics</h1>
          <p style={{ opacity: 0.7 }}>Visualizing platform growth and event performance.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => fetchAnalytics(token)} disabled={loading}>Refresh</button>
          <button className="btn btn-outline" onClick={handleLogout} style={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444' }}>Logout</button>
        </div>
      </header>

      {loading && <div className="loader-overlay">Loading...</div>}

      <DashboardStats stats={data.stats} />

      <div className="charts-grid">
        <UserGrowthChart data={data.growth} />
        <EventAttendanceChart data={data.events} />
      </div>
    </div>
  );
}
