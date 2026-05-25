/**
 * Certificate Verification Page
 * Public page at /verify/:id — verifies a NexaSphere event certificate via QR or direct URL.
 *
 * Features:
 * - Fetches verification data from the FastAPI /certificates/verify/:id endpoint
 * - Displays verified/invalid state with premium glassmorphic styling
 * - Shows student name, event name, issue date
 * - Certificate download button for valid certs
 * - Handles loading, error, and edge states
 * - Fully accessible and mobile-responsive
 */

import { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getApiBase() {
  const base = (import.meta?.env?.VITE_PYTHON_API_BASE || '').replace(/\/+$/, '');
  return base || 'http://localhost:8000';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return dateStr;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function VerifiedBadge() {
  return (
    <div
      role="img"
      aria-label="Verified certificate"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.1))',
        border: '1.5px solid rgba(34,197,94,0.5)',
        borderRadius: '32px',
        padding: '8px 20px',
        color: '#22c55e',
        fontWeight: 700,
        fontSize: '0.88rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        boxShadow: '0 0 24px rgba(34,197,94,0.2)',
        fontFamily: "'Rajdhani', sans-serif",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      Certificate Verified
    </div>
  );
}

function InvalidBadge() {
  return (
    <div
      role="img"
      aria-label="Invalid certificate"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'linear-gradient(135deg, rgba(204,17,17,0.15), rgba(136,0,0,0.1))',
        border: '1.5px solid rgba(204,17,17,0.5)',
        borderRadius: '32px',
        padding: '8px 20px',
        color: '#ef4444',
        fontWeight: 700,
        fontSize: '0.88rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        boxShadow: '0 0 24px rgba(204,17,17,0.2)',
        fontFamily: "'Rajdhani', sans-serif",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      Not Verified
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '16px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <span style={{ color: '#CC1111', flexShrink: 0, marginTop: '2px' }} aria-hidden="true">{icon}</span>
      <div>
        <div style={{
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '3px',
          fontFamily: "'Rajdhani', sans-serif",
        }}>{label}</div>
        <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      padding: '60px 20px',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '3px solid rgba(204,17,17,0.2)',
        borderTop: '3px solid #CC1111',
        borderRadius: '50%',
        animation: 'ns-spin 0.8s linear infinite',
      }} role="status" aria-label="Loading" />
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', margin: 0 }}>
        Verifying certificate…
      </p>
      <style>{`@keyframes ns-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

/**
 * CertificateVerifyPage
 *
 * @param {Object} props
 * @param {string} props.certificateId — the :id from the URL (e.g. "NS-CERT-ABCD1234")
 * @param {Function} props.onGoHome    — callback to navigate home
 */
export default function CertificateVerifyPage({ certificateId, onGoHome }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'valid' | 'invalid' | 'error'
  const [data, setData] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!certificateId) {
      setStatus('invalid');
      setMessage('No certificate ID provided.');
      return;
    }

    const controller = new AbortController();

    async function fetchVerification() {
      try {
        const apiBase = getApiBase();
        const res = await fetch(`${apiBase}/certificates/verify/${encodeURIComponent(certificateId)}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setMessage(errData.detail || 'Server error during verification.');
          setStatus('error');
          return;
        }

        const json = await res.json();
        setData(json);
        setMessage(json.message);
        setStatus(json.valid ? 'valid' : 'invalid');
      } catch (err) {
        if (err.name === 'AbortError') return;
        setMessage('Unable to reach the verification server. Please try again later.');
        setStatus('error');
      }
    }

    fetchVerification();
    return () => controller.abort();
  }, [certificateId]);

  const cert = data?.certificate;
  const downloadUrl = cert
    ? `${getApiBase()}/certificates/${encodeURIComponent(cert.certificate_id)}/download`
    : null;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0d0d0d 0%, #0a0a0f 50%, #0d0d0d 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        fontFamily: "'Inter', 'Rajdhani', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
        width: '700px', height: '700px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(204,17,17,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Back button */}
      <button
        onClick={onGoHome}
        aria-label="Go back to homepage"
        style={{
          position: 'absolute', top: '24px', left: '24px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '20px',
          color: 'rgba(255,255,255,0.7)',
          padding: '8px 18px',
          fontSize: '0.85rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s',
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 600,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back
      </button>

      {/* NexaSphere logo wordmark */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #CC1111, #EE4444)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '0.12em',
          marginBottom: '4px',
        }}>
          NexaSphere
        </div>
        <div style={{
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          fontFamily: "'Rajdhani', sans-serif",
        }}>
          Certificate Verification Portal
        </div>
      </div>

      {/* Card */}
      <div
        role="main"
        aria-label="Certificate verification result"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Card header */}
        <div style={{
          padding: '28px 28px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            marginBottom: '16px',
          }}>
            Certificate ID: {certificateId || '—'}
          </div>

          {status === 'loading' && <LoadingSpinner />}
          {status === 'valid' && <VerifiedBadge />}
          {(status === 'invalid' || status === 'error') && <InvalidBadge />}
        </div>

        {/* Info rows */}
        {status === 'valid' && cert && (
          <div>
            <InfoRow
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              }
              label="Student Name"
              value={cert.student_name}
            />
            <InfoRow
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              }
              label="Event"
              value={cert.event_name}
            />
            <InfoRow
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              }
              label="Issued On"
              value={formatDate(cert.issue_date)}
            />
            <InfoRow
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              }
              label="Status"
              value="Valid — Issued by NexaSphere"
            />
          </div>
        )}

        {/* Message area */}
        {status !== 'loading' && (
          <div style={{
            padding: '20px 28px',
            textAlign: 'center',
            color: status === 'valid' ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            borderTop: cert ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            {message}
          </div>
        )}

        {/* Download button */}
        {status === 'valid' && cert && downloadUrl && (
          <div style={{ padding: '0 28px 28px', textAlign: 'center' }}>
            <a
              href={downloadUrl}
              download
              aria-label={`Download certificate for ${cert.student_name}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #CC1111, #880000)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 28px',
                fontSize: '0.9rem',
                fontWeight: 700,
                textDecoration: 'none',
                cursor: 'pointer',
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(204,17,17,0.4)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(204,17,17,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(204,17,17,0.4)'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download Certificate
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <p style={{
        marginTop: '32px',
        color: 'rgba(255,255,255,0.2)',
        fontSize: '0.75rem',
        textAlign: 'center',
        lineHeight: 1.6,
      }}>
        Issued by NexaSphere — GL Bajaj Group of Institutions<br />
        <span style={{ fontSize: '0.7rem' }}>
          Certificates are tamper-proof and cryptographically linked to our records.
        </span>
      </p>
    </div>
  );
}
