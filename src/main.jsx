import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import GlobalErrorBoundary from './components/GlobalErrorBoundary.jsx';
import { registerSW } from 'virtual:pwa-register';
import { SocketProvider } from './context/SocketContext';

// Apply saved theme before React renders — prevents flash of wrong theme
const savedTheme = localStorage.getItem('ns-theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

// Register service worker
registerSW({ immediate: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <SocketProvider>
        <App />
      </SocketProvider>
    </GlobalErrorBoundary>
  </StrictMode>
);

