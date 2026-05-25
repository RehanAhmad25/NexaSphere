import React from 'react';
import { DynamicIcon } from '../../shared/Icons';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '400px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          padding: '40px 24px', background: 'var(--bg)', borderRadius: '12px',
          border: '1px solid rgba(255,68,68,0.2)', margin: '20px'
        }}>
          <div style={{ color: '#ff4444', marginBottom: '16px' }}>
            <DynamicIcon name="AlertTriangle" size={48} />
          </div>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '1.5rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '12px' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--t2)', fontSize: '0.95rem', maxWidth: '420px', lineHeight: 1.6, marginBottom: '24px' }}>
            We encountered an unexpected issue while loading this content. Please try reloading the page.
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()} 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <DynamicIcon name="RefreshCw" size={16} /> Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
