// src/services/gamification/gamificationService.js

// XP Values for different actions
export const XP_VALUES = {
  EVENT_ATTENDANCE: 50,
  EVENT_REGISTRATION: 10,
  CONTENT_CREATION: 30,
  COMMENT_POSTED: 5,
  REFERRAL: 100,
  DAILY_STREAK: 20,
  ACHIEVEMENT_UNLOCK: 0,
  SHARE_EVENT: 15,
  FEEDBACK_GIVEN: 10
};

// Achievement tiers and requirements
export const ACHIEVEMENTS = {
  // Event based achievements
  FIRST_EVENT: {
    id: 'first_event',
    title: 'First Step',
    description: 'Attend your first event',
    icon: '🎯',
    tier: 'bronze',
    xpReward: 50,
    requirement: { type: 'events_attended', count: 1 }
  },
  EVENT_MASTER: {
    id: 'event_master',
    title: 'Event Master',
    description: 'Attend 10 events',
    icon: '🏆',
    tier: 'gold',
    xpReward: 500,
    requirement: { type: 'events_attended', count: 10 }
  },
  EVENT_ADDICT: {
    id: 'event_addict',
    title: 'Event Addict',
    description: 'Attend 25 events',
    icon: '🌟',
    tier: 'platinum',
    xpReward: 1500,
    requirement: { type: 'events_attended', count: 25 }
  },

  // Streak achievements
  STREAK_3: {
    id: 'streak_3',
    title: 'On Fire',
    description: '3 day login streak',
    icon: '🔥',
    tier: 'bronze',
    xpReward: 30,
    requirement: { type: 'streak', count: 3 }
  },
  STREAK_7: {
    id: 'streak_7',
    title: 'Unstoppable',
    description: '7 day login streak',
    icon: '⚡',
    tier: 'silver',
    xpReward: 100,
    requirement: { type: 'streak', count: 7 }
  },
  STREAK_30: {
    id: 'streak_30',
    title: 'Legendary',
    description: '30 day login streak',
    icon: '👑',
    tier: 'platinum',
    xpReward: 500,
    requirement: { type: 'streak', count: 30 }
  },

  // Contribution achievements
  FIRST_COMMENT: {
    id: 'first_comment',
    title: 'Voice Your Thoughts',
    description: 'Post your first comment',
    icon: '💬',
    tier: 'bronze',
    xpReward: 25,
    requirement: { type: 'comments', count: 1 }
  },
  COMMUNITY_BUILDER: {
    id: 'community_builder',
    title: 'Community Builder',
    description: 'Post 50 comments',
    icon: '🗣️',
    tier: 'gold',
    xpReward: 300,
    requirement: { type: 'comments', count: 50 }
  },

  // Referral achievements
  FIRST_REFERRAL: {
    id: 'first_referral',
    title: 'Spread the Word',
    description: 'Refer your first friend',
    icon: '🤝',
    tier: 'silver',
    xpReward: 100,
    requirement: { type: 'referrals', count: 1 }
  },
  REFERRAL_LEGEND: {
    id: 'referral_legend',
    title: 'Referral Legend',
    description: 'Refer 10 friends',
    icon: '🌟',
    tier: 'platinum',
    xpReward: 1000,
    requirement: { type: 'referrals', count: 10 }
  },

  // Content creation
  FIRST_CONTENT: {
    id: 'first_content',
    title: 'Creator',
    description: 'Create your first content',
    icon: '✍️',
    tier: 'silver',
    xpReward: 50,
    requirement: { type: 'content_created', count: 1 }
  },

  // Feedback
  FIRST_FEEDBACK: {
    id: 'first_feedback',
    title: 'Helpful Voice',
    description: 'Provide feedback',
    icon: '📝',
    tier: 'bronze',
    xpReward: 20,
    requirement: { type: 'feedback', count: 1 }
  }
};

// Level thresholds
export const LEVEL_THRESHOLDS = [
  { level: 1, xpRequired: 0, title: 'Newcomer' },
  { level: 2, xpRequired: 100, title: 'Learner' },
  { level: 3, xpRequired: 300, title: 'Explorer' },
  { level: 4, xpRequired: 600, title: 'Achiever' },
  { level: 5, xpRequired: 1000, title: 'Expert' },
  { level: 6, xpRequired: 1500, title: 'Master' },
  { level: 7, xpRequired: 2200, title: 'Grandmaster' },
  { level: 8, xpRequired: 3000, title: 'Legend' },
  { level: 9, xpRequired: 4000, title: 'Hero' },
  { level: 10, xpRequired: 5500, title: 'Champion' }
];

class GamificationService {
  constructor() {
    this.userData = this.loadUserData();
  }

  loadUserData() {
    const stored = localStorage.getItem('gamification_user_data');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      userId: null,
      xp: 0,
      level: 1,
      title: 'Newcomer',
      achievements: [],
      stats: {
        events_attended: 0,
        events_registered: 0,
        comments: 0,
        referrals: 0,
        content_created: 0,
        feedback: 0,
        shares: 0,
        current_streak: 0,
        longest_streak: 0,
        last_active: null
      },
      badges: [],
      notifications: []
    };
  }

  saveUserData() {
    localStorage.setItem('gamification_user_data', JSON.stringify(this.userData));
  }

  // Update user ID
  setUserId(userId) {
    this.userData.userId = userId;
    this.saveUserData();
  }

  // Track user action and award XP
  trackAction(action, metadata = {}) {
    const xpEarned = XP_VALUES[action] || 0;
    
    // Update stats based on action
    this.updateStats(action, metadata);
    
    // Add XP
    this.addXP(xpEarned);
    
    // Check and unlock achievements
    const newAchievements = this.checkAchievements();
    
    // Update streak
    this.updateStreak();
    
    // Save data
    this.saveUserData();
    
    return {
      xpEarned,
      newAchievements,
      totalXP: this.userData.xp,
      level: this.userData.level
    };
  }

  updateStats(action, metadata) {
    const stats = this.userData.stats;
    
    switch(action) {
      case 'EVENT_ATTENDANCE':
        stats.events_attended++;
        break;
      case 'EVENT_REGISTRATION':
        stats.events_registered++;
        break;
      case 'COMMENT_POSTED':
        stats.comments++;
        break;
      case 'REFERRAL':
        stats.referrals++;
        break;
      case 'CONTENT_CREATION':
        stats.content_created++;
        break;
      case 'FEEDBACK_GIVEN':
        stats.feedback++;
        break;
      case 'SHARE_EVENT':
        stats.shares++;
        break;
    }
  }

  addXP(amount) {
    this.userData.xp += amount;
    this.updateLevel();
  }

  updateLevel() {
    let newLevel = 1;
    let newTitle = 'Newcomer';
    
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (this.userData.xp >= LEVEL_THRESHOLDS[i].xpRequired) {
        newLevel = LEVEL_THRESHOLDS[i].level;
        newTitle = LEVEL_THRESHOLDS[i].title;
        break;
      }
    }
    
    if (newLevel > this.userData.level) {
      this.userData.notifications.push({
        type: 'level_up',
        message: `Congratulations! You reached Level ${newLevel} - ${newTitle}!`,
        timestamp: new Date().toISOString()
      });
    }
    
    this.userData.level = newLevel;
    this.userData.title = newTitle;
  }

  updateStreak() {
    const today = new Date().toDateString();
    const lastActive = this.userData.stats.last_active;
    
    if (lastActive === today) {
      return; // Already updated today
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    if (lastActive === yesterdayStr) {
      this.userData.stats.current_streak++;
      if (this.userData.stats.current_streak > this.userData.stats.longest_streak) {
        this.userData.stats.longest_streak = this.userData.stats.current_streak;
      }
      // Award streak XP
      this.addXP(XP_VALUES.DAILY_STREAK);
      this.userData.notifications.push({
        type: 'streak',
        message: `🔥 ${this.userData.stats.current_streak} day streak! +${XP_VALUES.DAILY_STREAK} XP`,
        timestamp: new Date().toISOString()
      });
    } else if (lastActive !== today) {
      this.userData.stats.current_streak = 1;
    }
    
    this.userData.stats.last_active = today;
  }

  checkAchievements() {
    const unlockedAchievements = [];
    const stats = this.userData.stats;
    const existingIds = new Set(this.userData.achievements.map(a => a.id));
    
    for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
      if (existingIds.has(achievement.id)) continue;
      
      let progress = 0;
      switch(achievement.requirement.type) {
        case 'events_attended':
          progress = stats.events_attended;
          break;
        case 'streak':
          progress = stats.current_streak;
          break;
        case 'comments':
          progress = stats.comments;
          break;
        case 'referrals':
          progress = stats.referrals;
          break;
        case 'content_created':
          progress = stats.content_created;
          break;
        case 'feedback':
          progress = stats.feedback;
          break;
      }
      
      if (progress >= achievement.requirement.count) {
        this.userData.achievements.push({
          ...achievement,
          unlockedAt: new Date().toISOString()
        });
        this.userData.badges.push({
          id: achievement.id,
          title: achievement.title,
          icon: achievement.icon,
          tier: achievement.tier,
          unlockedAt: new Date().toISOString()
        });
        this.addXP(achievement.xpReward);
        unlockedAchievements.push(achievement);
        
        this.userData.notifications.push({
          type: 'achievement',
          message: `🏆 Achievement Unlocked: ${achievement.title}! +${achievement.xpReward} XP`,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return unlockedAchievements;
  }

  getUserStats() {
    return {
      xp: this.userData.xp,
      level: this.userData.level,
      title: this.userData.title,
      nextLevelXP: this.getNextLevelXP(),
      achievements: this.userData.achievements,
      badges: this.userData.badges,
      stats: this.userData.stats,
      notifications: this.userData.notifications
    };
  }

  getNextLevelXP() {
    const currentLevel = this.userData.level;
    const nextLevel = LEVEL_THRESHOLDS.find(l => l.level === currentLevel + 1);
    return nextLevel ? nextLevel.xpRequired : this.userData.xp;
  }

  getLeaderboard() {
    // For demo, return mock leaderboard
    // In production, this would fetch from backend
    return [
      { rank: 1, name: 'Alex Johnson', xp: 2850, level: 8, avatar: '👨‍💻' },
      { rank: 2, name: 'Sarah Chen', xp: 2420, level: 7, avatar: '👩‍💻' },
      { rank: 3, name: 'Mike Ross', xp: 2100, level: 7, avatar: '👨‍💼' },
      { rank: 4, name: 'Emma Watson', xp: 1850, level: 6, avatar: '👩‍🎓' },
      { rank: 5, name: 'David Kim', xp: 1520, level: 6, avatar: '👨‍🔬' }
    ];
  }

  getTierColor(tier) {
    switch(tier) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return '#CC1111';
    }
  }

  clearNotifications() {
    this.userData.notifications = [];
    this.saveUserData();
  }
}

export const gamificationService = new GamificationService();