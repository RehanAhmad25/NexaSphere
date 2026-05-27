// src/services/dashboardRepository.js
// Data layer - NO MOCK DATA, only empty structures

// Storage keys
const STORAGE_KEYS = {
  METRICS: 'dashboard_metrics',
  ACTIVITIES: 'dashboard_activities',
  ACHIEVEMENTS: 'dashboard_achievements',
  WEEKLY: 'dashboard_weekly',
  PROFILE: 'dashboard_profile'
};

// Empty data structures (not mock data)
const EMPTY_DATA = {
  metrics: {
    totalPoints: 0,
    eventsAttended: 0,
    currentStreak: 0,
    contributions: 0,
    longestStreak: 0
  },
  activities: [],
  achievements: [],
  weeklyActivity: [
    { day: 'Mon', count: 0 }, { day: 'Tue', count: 0 }, { day: 'Wed', count: 0 },
    { day: 'Thu', count: 0 }, { day: 'Fri', count: 0 }, { day: 'Sat', count: 0 }, { day: 'Sun', count: 0 }
  ],
  profileCompletion: 0
};

export const dashboardRepository = {
  // Get all dashboard data
  async getAll() {
    try {
      // TODO: Replace with real API call when backend is ready
      // const response = await fetch('/api/user/dashboard');
      // return await response.json();

      // Read from localStorage (user-generated data only, no defaults)
      return {
        metrics: this.getMetrics(),
        activities: this.getActivities(),
        achievements: this.getAchievements(),
        weeklyActivity: this.getWeeklyActivity(),
        profileCompletion: this.getProfileCompletion()
      };
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      return EMPTY_DATA;
    }
  },

  getMetrics() {
    const stored = localStorage.getItem(STORAGE_KEYS.METRICS);
    return stored ? JSON.parse(stored) : EMPTY_DATA.metrics;
  },

  getActivities() {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return stored ? JSON.parse(stored) : EMPTY_DATA.activities;
  },

  getAchievements() {
    const stored = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    return stored ? JSON.parse(stored) : EMPTY_DATA.achievements;
  },

  getWeeklyActivity() {
    const stored = localStorage.getItem(STORAGE_KEYS.WEEKLY);
    return stored ? JSON.parse(stored) : EMPTY_DATA.weeklyActivity;
  },

  getProfileCompletion() {
    const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return stored ? JSON.parse(stored) : EMPTY_DATA.profileCompletion;
  },

  // Save user actions (called when user performs activities)
  saveMetrics(data) {
    localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(data));
  },

  addActivity(activity) {
    const current = this.getActivities();
    const updated = [activity, ...current].slice(0, 20);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
  },

  addAchievement(achievement) {
    const current = this.getAchievements();
    if (!current.find(a => a.id === achievement.id)) {
      const updated = [achievement, ...current];
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(updated));
    }
  },

  updateWeeklyActivity(day, count) {
    const current = this.getWeeklyActivity();
    const updated = current.map(d => d.day === day ? { ...d, count: d.count + count } : d);
    localStorage.setItem(STORAGE_KEYS.WEEKLY, JSON.stringify(updated));
  },

  updateProfileCompletion(percentage) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(percentage));
  },

  // Clear all data (for testing)
  clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
};