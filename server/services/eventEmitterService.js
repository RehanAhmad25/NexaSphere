/**
 * Event Emitter Service
 * Manages real-time events for registration, waitlist, reminders, attendance
 */

import EventEmitter from 'events';
import logger from '../utils/logger.js';
import { emitToRoom, getRoom } from '../config/socket.js';
import notificationsService from './notificationsService.js';
import {
  sendRegistrationConfirmationEmail,
  sendWaitlistPromotionEmail,
  sendEventReminderEmail,
  sendAttendanceConfirmationEmail,
} from './emailService.js';
import { sendPushNotification, sendToTopic } from './pushNotificationService.js';

class RealTimeEventManager extends EventEmitter {
  constructor() {
    super();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Registration confirmed event
    this.on('registration-confirmed', this.handleRegistrationConfirmed.bind(this));

    // Waitlist promotion event
    this.on('waitlist-promotion', this.handleWaitlistPromotion.bind(this));

    // Event reminder event
    this.on('event-reminder', this.handleEventReminder.bind(this));

    // Attendance marked event
    this.on('attendance-marked', this.handleAttendanceMarked.bind(this));
  }

  /**
   * Handle registration confirmed event
   */
  async handleRegistrationConfirmed(data) {
    try {
      logger.info('Event: Registration confirmed', { userId: data.userId, eventId: data.eventId });

      // Send email
      await sendRegistrationConfirmationEmail(data.userEmail, {
        name: data.userName,
        eventName: data.eventName,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        eventLocation: data.eventLocation,
      });

      // Send push notification
      if (data.pushToken) {
        await sendPushNotification(data.pushToken, {
          title: 'Registration Confirmed',
          body: `You're registered for ${data.eventName}`,
          data: {
            eventId: data.eventId,
            type: 'registration',
          },
          link: `/events/${data.eventId}`,
        });
      }

      // Broadcast to notifications room
      emitToRoom(getRoom('notifications'), 'registration-confirmed', {
        userId: data.userId,
        eventId: data.eventId,
        eventName: data.eventName,
        timestamp: new Date(),
      });

      // Persist notification (store per-user if userId provided)
      try {
        notificationsService.addNotification(data.userId || 'global', {
          type: 'connection',
          title: 'Registration Confirmed',
          message: `You're registered for ${data.eventName}`,
          link: `/events/${data.eventId}`,
        });
      } catch (err) { logger.warn('Failed to persist notification', { err: err.message }); }

      // Notify admin
      emitToRoom(getRoom('admin'), 'admin:new-registration', {
        userId: data.userId,
        userName: data.userName,
        eventName: data.eventName,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error handling registration event', { error: error.message });
    }
  }

  /**
   * Handle waitlist promotion event
   */
  async handleWaitlistPromotion(data) {
    try {
      logger.info('Event: Waitlist promotion', { userId: data.userId, eventId: data.eventId });

      // Send email
      await sendWaitlistPromotionEmail(data.userEmail, {
        name: data.userName,
        eventName: data.eventName,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        confirmationId: data.confirmationId,
        eventLink: `/events/${data.eventId}`,
      });

      // Send push notification
      if (data.pushToken) {
        await sendPushNotification(data.pushToken, {
          title: '🎉 Waitlist Promotion',
          body: `You've been promoted for ${data.eventName}!`,
          data: {
            eventId: data.eventId,
            type: 'promotion',
          },
          link: `/events/${data.eventId}`,
          tag: 'promotion',
        });
      }

      // Broadcast event
      emitToRoom(getRoom('notifications'), 'waitlist-promotion', {
        userId: data.userId,
        eventId: data.eventId,
        timestamp: new Date(),
      });

      // Persist notification
      try {
        notificationsService.addNotification(data.userId || 'global', {
          type: 'mention',
          title: 'Waitlist Promotion',
          message: `You've been promoted for ${data.eventName}`,
          link: `/events/${data.eventId}`,
        });
      } catch (err) { logger.warn('Failed to persist notification', { err: err.message }); }

      // Notify admin
      emitToRoom(getRoom('admin'), 'admin:waitlist-promotion', {
        userId: data.userId,
        userName: data.userName,
        eventName: data.eventName,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error handling waitlist promotion', { error: error.message });
    }
  }

  /**
   * Handle event reminder event
   */
  async handleEventReminder(data) {
    try {
      logger.info('Event: Reminder sent', { userId: data.userId, eventId: data.eventId });

      // Send email
      await sendEventReminderEmail(data.userEmail, {
        name: data.userName,
        eventName: data.eventName,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        eventLocation: data.eventLocation,
        timeUntilEvent: data.timeUntilEvent || 'soon',
        eventLink: `/events/${data.eventId}`,
      });

      // Send push notification
      if (data.pushToken) {
        await sendPushNotification(data.pushToken, {
          title: `⏰ ${data.eventName} is coming up!`,
          body: `Don't forget: ${data.eventName} on ${data.eventDate}`,
          data: {
            eventId: data.eventId,
            type: 'reminder',
          },
          link: `/events/${data.eventId}`,
          tag: 'reminder',
        });
      }

      // Notify user via WebSocket
      emitToRoom(getRoom('notifications'), 'event-reminder', {
        userId: data.userId,
        eventId: data.eventId,
        eventName: data.eventName,
        timestamp: new Date(),
      });

      // Persist notification
      try {
        notificationsService.addNotification(data.userId || 'global', {
          type: 'system',
          title: `Reminder: ${data.eventName}`,
          message: `${data.eventName} is starting soon`,
          link: `/events/${data.eventId}`,
        });
      } catch (err) { logger.warn('Failed to persist notification', { err: err.message }); }
    } catch (error) {
      logger.error('Error handling event reminder', { error: error.message });
    }
  }

  /**
   * Handle attendance marked event
   */
  async handleAttendanceMarked(data) {
    try {
      logger.info('Event: Attendance marked', { userId: data.userId, eventId: data.eventId });

      // Send email
      await sendAttendanceConfirmationEmail(data.userEmail, {
        name: data.userName,
        eventName: data.eventName,
        eventDate: data.eventDate,
        points: data.points,
      });

      // Send push notification
      if (data.pushToken) {
        await sendPushNotification(data.pushToken, {
          title: 'Attendance Marked',
          body: `Your attendance for ${data.eventName} has been recorded`,
          data: {
            eventId: data.eventId,
            points: data.points,
            type: 'attendance',
          },
        });
      }

      // Broadcast event
      emitToRoom(getRoom('notifications'), 'attendance-marked', {
        userId: data.userId,
        eventId: data.eventId,
        points: data.points,
        timestamp: new Date(),
      });

      // Persist notification
      try {
        notificationsService.addNotification(data.userId || 'global', {
          type: 'system',
          title: 'Attendance Marked',
          message: `Attendance for ${data.eventName} recorded. You earned ${data.points || 0} points.`,
          link: `/events/${data.eventId}`,
        });
      } catch (err) { logger.warn('Failed to persist notification', { err: err.message }); }

      // Notify admin
      emitToRoom(getRoom('admin'), 'admin:attendance-marked', {
        userId: data.userId,
        userName: data.userName,
        eventName: data.eventName,
        points: data.points,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error handling attendance event', { error: error.message });
    }
  }

  /**
   * Emit custom event
   */
  emitEvent(eventName, data) {
    this.emit(eventName, data);
    logger.debug('Custom event emitted', { event: eventName });
  }
}

// Create singleton instance
const eventManager = new RealTimeEventManager();

export default eventManager;
