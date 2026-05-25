import { useState, useEffect, useCallback } from 'react';
import socketClient from '../utils/socketClient';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Initialize socket and listen to real-time events
  useEffect(() => {
    // Fetch persisted notifications from server (if available)
    (async () => {
      try {
        const base = import.meta?.env?.VITE_API_BASE || '';
        const res = await fetch(base + '/api/notifications');
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.notifications)) setNotifications(json.notifications);
        }
      } catch (err) {
        // ignore fetch errors — fallback to empty list
        console.warn('Failed to fetch notifications', err.message);
      }
    })();

    const base = (import.meta?.env?.VITE_API_BASE || window.location.origin).replace(/\/+$/, '');
    const socket = socketClient.initializeSocket(base);

    // Identify user if logged in (for personalized notifications)
    const storedUser = localStorage.getItem('ns_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.id || user.userId) {
          socketClient.identifyUser(user.id || user.userId, user.email);
          // Join authenticated user-specific channel
          socketClient.joinRoom(`user-${user.id || user.userId}`);
        }
      } catch (e) {
        console.error('Error parsing stored user info', e);
      }
    }

    // Join general notification and announcement channels
    socketClient.joinRoom('notifications-room');
    socketClient.joinRoom('global-announcements');

    // Setup real-time event handlers mapping to the notification feed
    const handleRegistration = (data) => {
      const newNotification = {
        id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'connection',
        title: 'Registration Confirmed! 🎉',
        message: data.eventName ? `You are registered for "${data.eventName}"` : 'Your registration has been successfully confirmed.',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications(prev => [newNotification, ...prev]);
    };

    const handleWaitlist = (data) => {
      const newNotification = {
        id: `waitlist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'mention',
        title: 'Waitlist Promotion! 🚀',
        message: data.eventName ? `Great news! You have been promoted for "${data.eventName}"` : 'You have been promoted from the waitlist.',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications(prev => [newNotification, ...prev]);
    };

    const handleReminder = (data) => {
      const newNotification = {
        id: `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'system',
        title: 'Upcoming Event Reminder ⏰',
        message: data.eventName ? `"${data.eventName}" is starting soon! Don't miss it.` : 'An event is starting shortly.',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications(prev => [newNotification, ...prev]);
    };

    const handleAttendance = (data) => {
      const newNotification = {
        id: `attendance-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'system',
        title: 'Attendance Confirmed! Check-in ✅',
        message: `Your check-in is complete! You earned ${data.points || 50} points.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications(prev => [newNotification, ...prev]);
    };

    // Register active listeners
    socketClient.on('registrationConfirmed', handleRegistration);
    socketClient.on('waitlistPromotion', handleWaitlist);
    socketClient.on('eventReminder', handleReminder);
    socketClient.on('attendanceMarked', handleAttendance);

    return () => {
      // Cleanup listeners and leave channels
      socketClient.off('registrationConfirmed');
      socketClient.off('waitlistPromotion');
      socketClient.off('eventReminder');
      socketClient.off('attendanceMarked');
      
      const storedUser = localStorage.getItem('ns_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.id || user.userId) {
            socketClient.leaveRoom(`user-${user.id || user.userId}`);
          }
        } catch (e) {}
      }
      
      socketClient.leaveRoom('notifications-room');
      socketClient.leaveRoom('global-announcements');
      socketClient.disconnect();
    };
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    // Persist
    (async () => {
      try {
        const base = import.meta?.env?.VITE_API_BASE || '';
        await fetch(base + '/api/notifications/mark-read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      } catch (e) {}
    })();
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    (async () => {
      try {
        const base = import.meta?.env?.VITE_API_BASE || '';
        await fetch(base + '/api/notifications/mark-all-read', { method: 'POST' });
      } catch (e) {}
    })();
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    (async () => {
      try {
        const base = import.meta?.env?.VITE_API_BASE || '';
        await fetch(base + '/api/notifications', { method: 'DELETE' });
      } catch (e) {}
    })();
  }, []);

  const togglePanel = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    notifications,
    unreadCount,
    isOpen,
    togglePanel,
    closePanel,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
