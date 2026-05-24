import { useNavigate } from 'react-router-dom';
import { useEffect, useCallback } from 'react';
import { auth } from '../services/auth';
import { useEventListener } from './useEventListener';
import { eventEmitter, EVENTS } from '../services/eventEmitter';

export function useAuth() {
  const navigate = useNavigate();

  const handleExpiry = useCallback(() => {
    auth.logout();
    eventEmitter.emit(EVENTS.NOTIFY, { type: 'error', message: 'Your session has expired. Please log in again to continue.' });
    navigate('/login', { replace: true });
  }, [navigate]);

  useEventListener(EVENTS.AUTH_TOKEN_EXPIRED, handleExpiry);

  return {
    isAuthenticated: auth.isAuthenticated(),
    email: auth.getEmail(),
    logout: () => { auth.logout(); navigate('/login'); },
  };
}
