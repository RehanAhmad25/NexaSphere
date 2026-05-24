import React from 'react';
import './GlobalErrorBoundary.css';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log errors using console.error as required
    console.error('GlobalErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="global-error-boundary">
          <div className="global-error-content">
            <h1>Something went wrong</h1>
            <p>Please refresh the page and try again.</p>
            <button onClick={() => window.location.reload()}>Refresh</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
