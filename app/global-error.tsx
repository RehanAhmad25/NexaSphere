'use client';

import React, { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Captured by global Error Boundary:', error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>System Failure</title>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Rajdhani:wght@600&family=Space+Mono&display=swap" rel="stylesheet" />
      </head>
      <body style={bodyStyle}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            <div style={iconContainerStyle}>
              <span style={iconStyle}>🚨</span>
            </div>
            <h1 style={titleStyle}>CRITICAL SYSTEM FAILURE</h1>
            <p style={subtitleStyle}>
              A critical error occurred in the core framework of the NexaSphere ecosystem.
            </p>

            {error && error.message && (
              <div style={errorDetailsStyle}>
                <code style={codeStyle}>{error.message}</code>
              </div>
            )}

            <button onClick={() => reset()} style={primaryButtonStyle}>
              Restart Segment
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

// Styles
const bodyStyle: React.CSSProperties = {
  margin: 0,
  padding: 0,
  backgroundColor: '#050507',
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  fontFamily: "'Rajdhani', sans-serif",
  color: '#ffffff',
  padding: '20px',
  boxSizing: 'border-box',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(15, 15, 20, 0.8)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(230, 57, 70, 0.4)',
  borderRadius: '16px',
  padding: '40px',
  maxWidth: '500px',
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 0 40px rgba(230, 57, 70, 0.25)',
};

const iconContainerStyle: React.CSSProperties = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: 'rgba(230, 57, 70, 0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 24px',
  border: '1px solid rgba(230, 57, 70, 0.5)',
};

const iconStyle: React.CSSProperties = {
  fontSize: '40px',
};

const titleStyle: React.CSSProperties = {
  fontFamily: "'Orbitron', monospace",
  fontSize: '1.8rem',
  fontWeight: '700',
  letterSpacing: '2px',
  color: '#E63946',
  margin: '0 0 12px 0',
  textShadow: '0 0 10px rgba(230, 57, 70, 0.3)',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  color: '#a0a0b0',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
};

const errorDetailsStyle: React.CSSProperties = {
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(230, 57, 70, 0.2)',
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

const primaryButtonStyle: React.CSSProperties = {
  padding: '14px 28px',
  borderRadius: '8px',
  backgroundColor: '#E63946',
  color: '#ffffff',
  fontSize: '1.05rem',
  fontWeight: '600',
  fontFamily: "'Rajdhani', sans-serif",
  textTransform: 'uppercase',
  letterSpacing: '1px',
  cursor: 'pointer',
  border: 'none',
  transition: 'all 0.3s ease',
  boxShadow: '0 0 20px rgba(230, 57, 70, 0.5)',
};
