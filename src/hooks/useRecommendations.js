// src/hooks/useRecommendations.js
import { useState, useEffect, useCallback } from 'react';
import { userInterestTracker } from '../services/recommendation/userInterestTracker';
import { recommendationEngine } from '../services/recommendation/recommendationEngine';

export function useRecommendations(events) {
  const [recommendations, setRecommendations] = useState([]);
  const [userInterests, setUserInterests] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarEvents, setSimilarEvents] = useState({});

  useEffect(() => {
    if (events && events.length > 0) {
      generateRecommendations();
    }
  }, [events]);

  const generateRecommendations = useCallback(() => {
    const interests = userInterestTracker.getUserInterests();
    const history = userInterestTracker.getEventHistory();
    
    setUserInterests(interests);
    
    const recs = recommendationEngine.getRecommendations(events, interests, history, 10);
    setRecommendations(recs);
    setLoading(false);
  }, [events]);

  const trackEvent = useCallback((eventId, action, metadata) => {
    userInterestTracker.trackEventInteraction(eventId, action, metadata);
    generateRecommendations();
  }, [generateRecommendations]);

  const getSimilarEvents = useCallback((event, limit = 3) => {
    if (similarEvents[event.id]) {
      return similarEvents[event.id];
    }
    
    const similar = recommendationEngine.getSimilarEvents(event, events, limit);
    setSimilarEvents(prev => ({ ...prev, [event.id]: similar }));
    return similar;
  }, [events, similarEvents]);

  const setUserPreferences = useCallback((categories, tags) => {
    userInterestTracker.setUserPreferences(categories, tags);
    generateRecommendations();
  }, [generateRecommendations]);

  return {
    recommendations,
    userInterests,
    loading,
    trackEvent,
    getSimilarEvents,
    setUserPreferences
  };
}