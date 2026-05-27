// src/services/recommendation/userInterestTracker.js

const STORAGE_KEYS = {
  USER_INTERESTS: 'user_interests',
  USER_HISTORY: 'user_history',
  USER_PREFERENCES: 'user_preferences'
};

class UserInterestTracker {
  constructor() {
    this.interests = this.loadInterests();
    this.history = this.loadHistory();
    this.preferences = this.loadPreferences();
  }

  loadInterests() {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_INTERESTS);
    return stored ? JSON.parse(stored) : {
      categories: {},
      tags: {},
      events: {}
    };
  }

  loadHistory() {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_HISTORY);
    return stored ? JSON.parse(stored) : [];
  }

  loadPreferences() {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return stored ? JSON.parse(stored) : {
      preferredCategories: [],
      preferredTags: [],
      preferredTimeSlots: [],
      preferredLocations: []
    };
  }

  trackEventInteraction(eventId, action, metadata = {}) {
    const interaction = {
      eventId,
      action, // 'view', 'register', 'attend', 'like', 'share'
      timestamp: new Date().toISOString(),
      metadata
    };
    
    this.history.push(interaction);
    this.updateInterests(interaction);
    this.save();
    
    return interaction;
  }

  updateInterests(interaction) {
    // Update category interest
    if (interaction.metadata.category) {
      const cat = interaction.metadata.category;
      this.interests.categories[cat] = (this.interests.categories[cat] || 0) + 1;
    }
    
    // Update tag interests
    if (interaction.metadata.tags && Array.isArray(interaction.metadata.tags)) {
      interaction.metadata.tags.forEach(tag => {
        this.interests.tags[tag] = (this.interests.tags[tag] || 0) + 1;
      });
    }
    
    // Update event interest
    this.interests.events[interaction.eventId] = (this.interests.events[interaction.eventId] || 0) + 1;
  }

  setUserPreferences(categories, tags) {
    this.preferences.preferredCategories = categories;
    this.preferences.preferredTags = tags;
    this.save();
  }

  getUserInterests() {
    // Get top 5 categories by interest score
    const topCategories = Object.entries(this.interests.categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);
    
    // Get top 10 tags
    const topTags = Object.entries(this.interests.tags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);
    
    return {
      topCategories,
      topTags,
      totalInteractions: this.history.length,
      preferences: this.preferences
    };
  }

  getEventHistory() {
    return this.history;
  }

  save() {
    localStorage.setItem(STORAGE_KEYS.USER_INTERESTS, JSON.stringify(this.interests));
    localStorage.setItem(STORAGE_KEYS.USER_HISTORY, JSON.stringify(this.history));
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(this.preferences));
  }

  clearHistory() {
    this.interests = { categories: {}, tags: {}, events: {} };
    this.history = [];
    this.preferences = { preferredCategories: [], preferredTags: [], preferredTimeSlots: [], preferredLocations: [] };
    this.save();
  }
}

export const userInterestTracker = new UserInterestTracker();