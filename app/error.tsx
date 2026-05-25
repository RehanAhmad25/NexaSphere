'use client';

import React, { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an analytics or error tracking service
    console.error('Captured by segment Error Boundary:', error);
  }, [error]);

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={iconContainerStyle}>
          <span style={iconStyle}>⚠️</span>
        </div>
        <h1 style={titleStyle}>SYSTEM ERROR</h1>
        <p style={subtitleStyle}>
          Something went wrong. The application encountered an unexpected anomaly.
        </p>
        
        {error && error.message && (
          <div style={errorDetailsStyle}>
            <code style={codeStyle}>{error.message}</code>
          </div>
        )}

        <div style={buttonGroupStyle}>
          <button onClick={() => reset()} style={primaryButtonStyle}>
            Try Again
          </button>
          <a href="/" style={secondaryButtonStyle}>
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}

// Inline styles for high compatibility and stunning visual appeal
const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#0a0a0c',
  fontFamily: "'Rajdhani', 'Inter', sans-serif",
  color: '#ffffff',
  padding: '20px',
  boxSizing: 'border-box',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(20, 20, 25, 0.7)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(230, 57, 70, 0.3)',
  borderRadius: '16px',
  padding: '40px',
  maxWidth: '500px',
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 8px 32px 0 rgba(230, 57, 70, 0.15)',
};

const iconContainerStyle: React.CSSProperties = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: 'rgba(230, 57, 70, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 24px',
  border: '1px solid rgba(230, 57, 70, 0.4)',
};

const iconStyle: React.CSSProperties = {
  fontSize: '40px',
};

const titleStyle: React.CSSProperties = {
  fontFamily: "'Orbitron', monospace",
  fontSize: '2rem',
  fontWeight: '700',
  letterSpacing: '2px',
  color: '#E63946',
  margin: '0 0 12px 0',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  color: '#a0a0b0',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
};

const errorDetailsStyle: React.CSSProperties = {
  background: 'rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  padding: '12px',
  marginBottom: '30px',
  textAlign: 'left',
  maxHeight: '150px',
  overflowY: 'auto',
};

const codeStyle: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '0.85rem',
  color: '#ff6b6b',
  wordBreak: 'break-all',
};

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  justifyContent: 'center',
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '12px 24px',
  borderRadius: '8px',
  backgroundColor: '#E63946',
  color: '#ffffff',
  fontSize: '1rem',
  fontWeight: '600',
  fontFamily: "'Rajdhani', sans-serif",
  textTransform: 'uppercase',
  letterSpacing: '1px',
  cursor: 'pointer',
  border: 'none',
  transition: 'all 0.3s ease',
  boxShadow: '0 0 15px rgba(230, 57, 70, 0.4)',
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '12px 24px',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  backgroundColor: 'transparent',
  color: '#ffffff',
  fontSize: '1rem',
  fontWeight: '600',
  fontFamily: "'Rajdhani', sans-serif",
  textTransform: 'uppercase',
  letterSpacing: '1px',
  textDecoration: 'none',
  display: 'inline-block',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
};
