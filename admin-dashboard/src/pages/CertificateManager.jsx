/**
 * CertificateManager — Admin Dashboard page
 *
 * Allows admins to generate bulk certificates for completed events.
 * Isolated new page — does not modify EventsManager or other managers.
 *
 * Features:
 * - Input event details (ID, name, date)
 * - Bulk student list (CSV-style: one "ID,Name" per line)
 * - Template style selector
 * - Progress and result feedback
 * - Links to generated verification URLs
 * - Copy-to-clipboard for individual verify links
 */

import { useState } from 'react';

const API_BASE = import.meta?.env?.VITE_PYTHON_API_BASE?.replace(/\/+$/, '') || 'http://localhost:8000';
const ADMIN_SECRET = import.meta?.env?.VITE_ADMIN_SECRET || 'nexasphere-admin-secret';

function parseStudents(rawText) {
  return rawText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, idx) => {
      const parts = line.split(',').map(p => p.trim());
      return {
        student_id: parts[0] || `student-${idx + 1}`,
        student_name: parts.slice(1).join(' ').trim() || parts[0] || `Student ${idx + 1}`,
      };
    });
}

function CertRow({ cert }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(cert.verification_url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr auto',
      gap: '12px',
      alignItems: 'center',
      padding: '10px 14px',
      background: 'rgba(34,197,94,0.04)',
      borderRadius: '8px',
      border: '1px solid rgba(34,197,94,0.12)',
      marginBottom: '6px',
      fontSize: '0.85rem',
    }}>
      <div>
        <div style={{ fontWeight: 600, color: '#fff' }}>{cert.student_name}</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontFamily: 'monospace' }}>
          {cert.certificate_id}
        </div>
      </div>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', wordBreak: 'break-all' }}>
        {cert.verification_url}
      </div>
      <button
        onClick={copyLink}
        title="Copy verify link"
        style={{
          background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)',
          border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.12)'}`,
          color: copied ? '#22c55e' : 'rgba(255,255,255,0.6)',
          borderRadius: '6px',
          padding: '6px 10px',
          cursor: 'pointer',
          fontSize: '0.75rem',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s',
        }}
      >
        {copied ? '✓ Copied' : 'Copy Link'}
      </button>
    </div>
  );
}

export function CertificateManager() {
  const [eventId, setEventId] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [studentsRaw, setStudentsRaw] = useState('');
  const [templateStyle, setTemplateStyle] = useState('default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    setError('');
    setResult(null);

    if (!eventId.trim() || !eventName.trim() || !eventDate.trim()) {
      setError('Please fill in all event fields.');
      return;
    }

    const students = parseStudents(studentsRaw);
    if (students.length === 0) {
      setError('Please enter at least one student.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/certificates/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': ADMIN_SECRET,
        },
        body: JSON.stringify({
          event_id: eventId.trim(),
          event_name: eventName.trim(),
          event_date: eventDate.trim(),
          students,
          template_style: templateStyle,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error: ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message || 'Failed to generate certificates. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Certificate Generator</h2>
      </div>

      <div style={{ maxWidth: '760px' }}>
        {/* Event Details */}
        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.6 }}>
            Event Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label htmlFor="cert-event-id" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px', opacity: 0.7 }}>
                Event ID *
              </label>
              <input
                id="cert-event-id"
                type="text"
                placeholder="e.g. kss-153"
                value={eventId}
                onChange={e => setEventId(e.target.value)}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label htmlFor="cert-event-date" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px', opacity: 0.7 }}>
                Event Date *
              </label>
              <input
                id="cert-event-date"
                type="text"
                placeholder="e.g. March 15, 2025"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="cert-event-name" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px', opacity: 0.7 }}>
              Event Name *
            </label>
            <input
              id="cert-event-name"
              type="text"
              placeholder="e.g. Knowledge Sharing Session #153"
              value={eventName}
              onChange={e => setEventName(e.target.value)}
              className="form-input"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label htmlFor="cert-template-style" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '5px', opacity: 0.7 }}>
              Certificate Style
            </label>
            <select
              id="cert-template-style"
              value={templateStyle}
              onChange={e => setTemplateStyle(e.target.value)}
              className="form-input"
              style={{ width: '200px' }}
            >
              <option value="default">Default (Red)</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
            </select>
          </div>
        </section>

        {/* Students */}
        <section style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.6 }}>
            Students
          </h3>
          <p style={{ fontSize: '0.78rem', opacity: 0.5, marginBottom: '10px' }}>
            One per line: <code>STUDENT_ID, Full Name</code> — e.g. <code>STU001, Anshika Rai</code>
          </p>
          <textarea
            id="cert-students"
            aria-label="Student list"
            rows={8}
            placeholder={"STU001, Anshika Rai\nSTU002, Ayush Sharma\nSTU003, Riya Singh"}
            value={studentsRaw}
            onChange={e => setStudentsRaw(e.target.value)}
            className="form-input"
            style={{ width: '100%', fontFamily: 'monospace', resize: 'vertical' }}
          />
          <div style={{ fontSize: '0.75rem', opacity: 0.4, marginTop: '5px' }}>
            {parseStudents(studentsRaw).length} student(s) ready
          </div>
        </section>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {/* Generate button */}
        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={loading}
          aria-busy={loading}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Generating…' : '🎓 Generate Certificates'}
        </button>

        {/* Results */}
        {result && (
          <div style={{ marginTop: '28px' }}>
            <div style={{
              background: 'rgba(34,197,94,0.07)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '16px',
              display: 'flex',
              gap: '24px',
              fontSize: '0.88rem',
            }}>
              <span style={{ color: '#22c55e', fontWeight: 700 }}>✓ Generated: {result.generated}</span>
              {result.skipped > 0 && (
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>⟳ Skipped (already issued): {result.skipped}</span>
              )}
            </div>
            <h4 style={{ fontSize: '0.82rem', opacity: 0.5, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Generated Certificates
            </h4>
            <div>
              {result.certificates.map(cert => (
                <CertRow key={cert.certificate_id} cert={cert} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
