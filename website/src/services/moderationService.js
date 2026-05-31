// src/services/moderationService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

// Content categories for moderation
export const MODERATION_CATEGORIES = {
  SPAM: 'spam',
  HATE_SPEECH: 'hate_speech',
  HARASSMENT: 'harassment',
  TOXIC: 'toxic',
  VIOLENCE: 'violence',
  SELF_HARM: 'self_harm',
  SEXUAL: 'sexual',
  MISINFORMATION: 'misinformation'
};

// Severity levels
export const SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// User reputation levels
export const REPUTATION = {
  TRUSTED: 'trusted',
  NORMAL: 'normal',
  WATCHED: 'watched',
  RESTRICTED: 'restricted',
  BANNED: 'banned'
};

class ModerationService {
  constructor() {
    this.userReputations = new Map(); // Store user reputation scores
    this.flaggedContent = []; // Store flagged content for admin review
    this.spamPatterns = [
      /(http|https):\/\/[^\s]+/g, // URLs
      /[^\w\s]{3,}/g, // Excessive special characters
      /(.)\1{4,}/g, // Repeated characters
      /\b(?:free|win|prize|lottery|click|subscribe|follow)\b/gi // Spam keywords
    ];
  }

  // Main moderation function
  async moderateContent(content, userId, contentType = 'comment') {
    const result = {
      isAppropriate: true,
      flags: [],
      severity: null,
      action: 'allow',
      confidence: 0
    };

    // Run spam detection
    const spamResult = this.detectSpam(content);
    if (spamResult.isSpam) {
      result.isAppropriate = false;
      result.flags.push({ type: MODERATION_CATEGORIES.SPAM, confidence: spamResult.confidence });
      result.severity = SEVERITY.MEDIUM;
    }

    // Run NLP detection using Gemini
    if (import.meta.env.VITE_GEMINI_API_KEY) {
      const aiResult = await this.detectWithAI(content);
      if (aiResult.flags.length > 0) {
        result.isAppropriate = false;
        result.flags.push(...aiResult.flags);
        result.severity = this.getHighestSeverity(aiResult.flags);
      }
      result.confidence = aiResult.confidence;
    } else {
      console.warn('Gemini API key not configured. Using basic detection only.');
    }

    // Determine action based on user reputation
    const userRep = this.getUserReputation(userId);
    result.action = this.determineAction(result, userRep);

    // Log for admin review if high severity
    if (result.severity === SEVERITY.HIGH || result.severity === SEVERITY.CRITICAL) {
      this.flagForReview(content, userId, result);
    }

    // Update user reputation
    this.updateUserReputation(userId, result);

    return result;
  }

  // Spam detection using regex patterns
  detectSpam(content) {
    let spamScore = 0;
    const matchedPatterns = [];

    for (const pattern of this.spamPatterns) {
      if (pattern.test(content)) {
        spamScore += 0.25;
        matchedPatterns.push(pattern.toString());
      }
    }

    // Check for repeated words
    const words = content.toLowerCase().split(/\s+/);
    const wordFrequency = {};
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    
    const repeatedWords = Object.values(wordFrequency).filter(count => count > 3).length;
    if (repeatedWords > 0) {
      spamScore += repeatedWords * 0.1;
    }

    // Check for excessive emojis or special characters
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;
    if (emojiCount > 5) {
      spamScore += 0.15;
    }

    return {
      isSpam: spamScore > 0.4,
      confidence: Math.min(spamScore, 1)
    };
  }

  // AI-based content detection
  async detectWithAI(content) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `
        Analyze the following content for toxicity, hate speech, harassment, and inappropriate material.
        Content: "${content}"
        
        Return a JSON object with:
        - isAppropriate: boolean
        - categories: array of detected issues (spam, hate_speech, harassment, toxic, violence, self_harm, sexual)
        - severity: low/medium/high/critical
        - confidence: number between 0-1
        - explanation: brief reason
        
        Only return valid JSON, no other text.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      const parsed = JSON.parse(text);
      
      return {
        flags: parsed.categories?.map(cat => ({ type: cat, confidence: parsed.confidence })) || [],
        confidence: parsed.confidence || 0.7,
        explanation: parsed.explanation
      };
    } catch (error) {
      console.error('AI moderation failed:', error);
      return { flags: [], confidence: 0 };
    }
  }

  // Get user reputation
  getUserReputation(userId) {
    const userData = this.userReputations.get(userId);
    if (!userData) {
      return { level: REPUTATION.NORMAL, score: 100, violations: 0 };
    }
    return userData;
  }

  // Update user reputation based on violations
  updateUserReputation(userId, moderationResult) {
    const current = this.getUserReputation(userId);
    let newScore = current.score;
    let violations = current.violations;

    if (!moderationResult.isAppropriate) {
      // Deduct points based on severity
      const penalties = {
        [SEVERITY.LOW]: -5,
        [SEVERITY.MEDIUM]: -15,
        [SEVERITY.HIGH]: -30,
        [SEVERITY.CRITICAL]: -50
      };
      newScore += penalties[moderationResult.severity] || -10;
      violations++;
    } else {
      // Add points for good behavior
      newScore = Math.min(100, newScore + 1);
    }

    // Determine reputation level
    let level = REPUTATION.NORMAL;
    if (newScore >= 80) level = REPUTATION.TRUSTED;
    else if (newScore >= 60) level = REPUTATION.NORMAL;
    else if (newScore >= 40) level = REPUTATION.WATCHED;
    else if (newScore >= 20) level = REPUTATION.RESTRICTED;
    else level = REPUTATION.BANNED;

    this.userReputations.set(userId, {
      level,
      score: newScore,
      violations
    });
  }

  // Determine action based on moderation result and user reputation
  determineAction(result, userRep) {
    if (userRep.level === REPUTATION.BANNED) return 'block';
    if (userRep.level === REPUTATION.RESTRICTED) return 'shadow_ban';
    
    if (!result.isAppropriate) {
      if (result.severity === SEVERITY.CRITICAL) return 'block';
      if (result.severity === SEVERITY.HIGH) return 'flag_review';
      if (userRep.level === REPUTATION.WATCHED) return 'shadow_ban';
      return 'flag_user';
    }
    
    return 'allow';
  }

  // Flag content for admin review
  flagForReview(content, userId, result) {
    const flag = {
      id: Date.now(),
      content,
      userId,
      timestamp: new Date().toISOString(),
      flags: result.flags,
      severity: result.severity,
      status: 'pending'
    };
    this.flaggedContent.unshift(flag);
    
    // Store in localStorage for persistence
    localStorage.setItem('moderation_flagged', JSON.stringify(this.flaggedContent));
  }

  // Get flagged content for admin
  getFlaggedContent(status = 'pending') {
    const stored = localStorage.getItem('moderation_flagged');
    if (stored) {
      this.flaggedContent = JSON.parse(stored);
    }
    return status ? this.flaggedContent.filter(f => f.status === status) : this.flaggedContent;
  }

  // Resolve a flagged item
  resolveFlag(flagId, action) {
    const flag = this.flaggedContent.find(f => f.id === flagId);
    if (flag) {
      flag.status = 'reviewed';
      flag.resolvedAt = new Date().toISOString();
      flag.resolution = action;
      localStorage.setItem('moderation_flagged', JSON.stringify(this.flaggedContent));
    }
  }

  // Get user reputation summary
  getUserReputationSummary() {
    const summary = [];
    for (const [userId, data] of this.userReputations) {
      summary.push({ userId, ...data });
    }
    return summary;
  }

  // Get highest severity from flags
  getHighestSeverity(flags) {
    const severityOrder = [SEVERITY.LOW, SEVERITY.MEDIUM, SEVERITY.HIGH, SEVERITY.CRITICAL];
    let highest = SEVERITY.LOW;
    for (const flag of flags) {
      const currentIndex = severityOrder.indexOf(highest);
      const flagIndex = severityOrder.indexOf(flag.severity || SEVERITY.MEDIUM);
      if (flagIndex > currentIndex) {
        highest = severityOrder[flagIndex];
      }
    }
    return highest;
  }
}

export const moderationService = new ModerationService();