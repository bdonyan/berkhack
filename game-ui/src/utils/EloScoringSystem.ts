export class EloScoringSystem {
  private kFactor: number;

  constructor(kFactor: number = 32) {
    this.kFactor = kFactor;
  }

  /**
   * Calculate expected score for player A against player B
   */
  private getExpectedScore(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  }

  /**
   * Update Elo rating based on actual vs expected performance
   */
  updateRating(currentRating: number, actualScore: number, opponentRating: number): number {
    const expectedScore = this.getExpectedScore(currentRating, opponentRating);
    const actualScoreNormalized = actualScore / 100; // Convert 0-100 score to 0-1
    
    const newRating = currentRating + this.kFactor * (actualScoreNormalized - expectedScore);
    return Math.round(newRating);
  }

  /**
   * Calculate rating change without updating
   */
  calculateRatingChange(currentRating: number, actualScore: number, opponentRating: number): number {
    const expectedScore = this.getExpectedScore(currentRating, opponentRating);
    const actualScoreNormalized = actualScore / 100;
    
    return Math.round(this.kFactor * (actualScoreNormalized - expectedScore));
  }

  /**
   * Get rating category based on Elo score
   */
  getRatingCategory(rating: number): string {
    if (rating >= 2000) return 'Grandmaster';
    if (rating >= 1800) return 'Master';
    if (rating >= 1600) return 'Expert';
    if (rating >= 1400) return 'Advanced';
    if (rating >= 1200) return 'Intermediate';
    if (rating >= 1000) return 'Beginner';
    return 'Novice';
  }

  /**
   * Adjust K-factor based on number of games played
   */
  setKFactor(gamesPlayed: number): void {
    if (gamesPlayed < 30) {
      this.kFactor = 40; // Higher K-factor for new players
    } else if (gamesPlayed < 100) {
      this.kFactor = 32; // Standard K-factor
    } else {
      this.kFactor = 24; // Lower K-factor for experienced players
    }
  }

  /**
   * Calculate win probability against an opponent
   */
  getWinProbability(ratingA: number, ratingB: number): number {
    return this.getExpectedScore(ratingA, ratingB);
  }
} 