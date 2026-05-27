// src/services/recommendation/recommendationEngine.js

class RecommendationEngine {
  constructor() {
    this.weights = {
      categoryMatch: 0.35,
      tagMatch: 0.25,
      userHistory: 0.20,
      popularity: 0.10,
      recency: 0.10
    };
  }

  // Calculate recommendation score for an event
  calculateScore(event, userInterests, userHistory) {
    let score = 0;
    const breakdown = {};

    // 1. Category match (35%)
    const categoryScore = this.calculateCategoryMatch(event, userInterests);
    score += categoryScore * this.weights.categoryMatch;
    breakdown.category = categoryScore;

    // 2. Tag match (25%)
    const tagScore = this.calculateTagMatch(event, userInterests);
    score += tagScore * this.weights.tagMatch;
    breakdown.tag = tagScore;

    // 3. User history similarity (20%)
    const historyScore = this.calculateHistorySimilarity(event, userHistory);
    score += historyScore * this.weights.userHistory;
    breakdown.history = historyScore;

    // 4. Popularity boost (10%)
    const popularityScore = this.calculatePopularity(event);
    score += popularityScore * this.weights.popularity;
    breakdown.popularity = popularityScore;

    // 5. Recency boost (10%)
    const recencyScore = this.calculateRecency(event);
    score += recencyScore * this.weights.recency;
    breakdown.recency = recencyScore;

    return { score: Math.round(score * 100), breakdown };
  }

  calculateCategoryMatch(event, userInterests) {
    if (!event.category) return 0;
    
    const userCategories = userInterests.topCategories;
    if (userCategories.includes(event.category)) return 1.0;
    
    // Partial match for related categories
    const relatedCategories = this.getRelatedCategories(event.category);
    const matchCount = userCategories.filter(c => relatedCategories.includes(c)).length;
    return matchCount > 0 ? 0.5 : 0;
  }

  calculateTagMatch(event, userInterests) {
    if (!event.tags || event.tags.length === 0) return 0;
    
    const userTags = userInterests.topTags;
    const matchCount = event.tags.filter(tag => userTags.includes(tag)).length;
    
    if (matchCount === 0) return 0;
    return Math.min(1.0, matchCount / 3);
  }

  calculateHistorySimilarity(event, userHistory) {
    if (userHistory.length === 0) return 0;
    
    // Check if user has interacted with similar events
    const similarEvents = userHistory.filter(h => {
      const histEvent = h.metadata;
      return histEvent?.category === event.category ||
             histEvent?.tags?.some(tag => event.tags?.includes(tag));
    });
    
    if (similarEvents.length === 0) return 0;
    return Math.min(1.0, similarEvents.length / 5);
  }

  calculatePopularity(event) {
    // Based on registration count or views
    const popularity = event.popularity || event.registeredCount || 0;
    return Math.min(1.0, popularity / 100);
  }

  calculateRecency(event) {
    if (!event.date) return 0.5;
    
    const eventDate = new Date(event.date);
    const now = new Date();
    const daysDiff = (eventDate - now) / (1000 * 60 * 60 * 24);
    
    if (daysDiff < 0) return 0; // Past event
    if (daysDiff < 7) return 1.0; // Within a week
    if (daysDiff < 30) return 0.7; // Within a month
    return 0.3;
  }

  getRelatedCategories(category) {
    const relations = {
      'workshop': ['tech', 'workshop'],
      'hackathon': ['tech', 'coding', 'hackathon'],
      'debate': ['non-tech', 'debate'],
      'opensource': ['tech', 'opensource'],
      'tech': ['workshop', 'hackathon'],
      'non-tech': ['debate']
    };
    return relations[category] || [category];
  }

  // Get personalized recommendations
  getRecommendations(events, userInterests, userHistory, limit = 10) {
    const scoredEvents = events.map(event => ({
      ...event,
      recommendationScore: this.calculateScore(event, userInterests, userHistory)
    }));
    
    return scoredEvents
      .sort((a, b) => b.recommendationScore.score - a.recommendationScore.score)
      .slice(0, limit);
  }

  // Get "Because you attended X" suggestions
  getSimilarEvents(event, allEvents, limit = 3) {
    const scored = allEvents
      .filter(e => e.id !== event.id)
      .map(e => ({
        ...e,
        similarityScore: this.calculateSimilarity(event, e)
      }))
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
    
    return scored;
  }

  calculateSimilarity(eventA, eventB) {
    let score = 0;
    
    // Category similarity
    if (eventA.category === eventB.category) score += 0.4;
    
    // Tag similarity
    if (eventA.tags && eventB.tags) {
      const commonTags = eventA.tags.filter(tag => eventB.tags.includes(tag)).length;
      score += (commonTags / Math.max(eventA.tags.length, eventB.tags.length)) * 0.4;
    }
    
    return score;
  }

  // Update weights (for A/B testing)
  updateWeights(newWeights) {
    this.weights = { ...this.weights, ...newWeights };
  }
}

export const recommendationEngine = new RecommendationEngine();