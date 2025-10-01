/**
 * Spaced Repetition System (SRS) Algorithm
 * Implementation of SuperMemo SM-2 Algorithm
 * 
 * Quality ratings:
 * 0 - Complete blackout
 * 1 - Incorrect response, but remembered after seeing answer
 * 2 - Incorrect response, but seemed easy to recall after seeing answer
 * 3 - Correct response, but required significant effort
 * 4 - Correct response, with some hesitation
 * 5 - Perfect response, immediate recall
 */

export interface SRSData {
  easeFactor: number;      // Ease factor (1.3 minimum)
  interval: number;        // Interval in days
  repetitions: number;     // Number of consecutive correct reviews
  nextReviewDate: Date;    // When to review next
}

export interface ReviewResult extends SRSData {
  wasCorrect: boolean;     // Whether the review was correct (quality >= 3)
}

/**
 * Calculate next review using SM-2 algorithm
 * @param quality - Rating from 0-5
 * @param currentEaseFactor - Current ease factor (default 2.5)
 * @param currentInterval - Current interval in days (default 0)
 * @param currentRepetitions - Current repetition count (default 0)
 * @returns Updated SRS data
 */
export function calculateNextReview(
  quality: number,
  currentEaseFactor: number = 2.5,
  currentInterval: number = 0,
  currentRepetitions: number = 0
): ReviewResult {
  // Validate quality rating
  if (quality < 0 || quality > 5) {
    throw new Error('Quality must be between 0 and 5');
  }

  // If quality < 3, reset the card (failed review)
  if (quality < 3) {
    const newEaseFactor = Math.max(1.3, currentEaseFactor - 0.2);
    
    return {
      easeFactor: newEaseFactor,
      interval: 0,
      repetitions: 0,
      nextReviewDate: new Date(), // Review again immediately
      wasCorrect: false,
    };
  }

  // Calculate new ease factor
  // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const newEaseFactor = Math.max(
    1.3,
    currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // Calculate new interval based on repetitions
  let newInterval: number;
  const newRepetitions = currentRepetitions + 1;

  if (newRepetitions === 1) {
    newInterval = 1; // 1 day
  } else if (newRepetitions === 2) {
    newInterval = 6; // 6 days
  } else {
    // For subsequent reviews: I(n) = I(n-1) * EF
    newInterval = Math.round(currentInterval * newEaseFactor);
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  nextReviewDate.setHours(0, 0, 0, 0); // Set to start of day

  return {
    easeFactor: Number(newEaseFactor.toFixed(2)),
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate,
    wasCorrect: true,
  };
}

/**
 * Get quality rating label
 */
export function getQualityLabel(quality: number): string {
  const labels: Record<number, string> = {
    0: 'Complete Blackout',
    1: 'Wrong',
    2: 'Wrong (Easy)',
    3: 'Correct (Hard)',
    4: 'Correct',
    5: 'Perfect',
  };
  return labels[quality] || 'Unknown';
}

/**
 * Get quality rating button text
 */
export function getQualityButtonText(quality: number): string {
  const texts: Record<number, string> = {
    0: 'Again',
    1: 'Hard',
    2: 'Hard',
    3: 'Good',
    4: 'Good',
    5: 'Easy',
  };
  return texts[quality] || 'Unknown';
}

/**
 * Get next interval preview for quality rating
 */
export function getIntervalPreview(
  quality: number,
  currentEaseFactor: number = 2.5,
  currentInterval: number = 0,
  currentRepetitions: number = 0
): string {
  const result = calculateNextReview(
    quality,
    currentEaseFactor,
    currentInterval,
    currentRepetitions
  );

  if (result.interval === 0) {
    return 'Today';
  } else if (result.interval === 1) {
    return '1 day';
  } else if (result.interval < 30) {
    return `${result.interval} days`;
  } else if (result.interval < 365) {
    const months = Math.round(result.interval / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.round(result.interval / 365);
    return `${years} year${years > 1 ? 's' : ''}`;
  }
}

/**
 * Determine if a flashcard is due for review
 */
export function isDue(nextReviewDate: Date | string): boolean {
  const reviewDate = typeof nextReviewDate === 'string' 
    ? new Date(nextReviewDate) 
    : nextReviewDate;
  
  return reviewDate <= new Date();
}

/**
 * Calculate days until next review
 */
export function daysUntilReview(nextReviewDate: Date | string): number {
  const reviewDate = typeof nextReviewDate === 'string' 
    ? new Date(nextReviewDate) 
    : nextReviewDate;
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  reviewDate.setHours(0, 0, 0, 0);
  
  const diffTime = reviewDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Format next review date for display
 */
export function formatNextReview(nextReviewDate: Date | string): string {
  const days = daysUntilReview(nextReviewDate);
  
  if (days < 0) {
    return `Overdue by ${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''}`;
  } else if (days === 0) {
    return 'Due today';
  } else if (days === 1) {
    return 'Due tomorrow';
  } else if (days < 7) {
    return `Due in ${days} days`;
  } else if (days < 30) {
    const weeks = Math.round(days / 7);
    return `Due in ${weeks} week${weeks > 1 ? 's' : ''}`;
  } else if (days < 365) {
    const months = Math.round(days / 30);
    return `Due in ${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.round(days / 365);
    return `Due in ${years} year${years > 1 ? 's' : ''}`;
  }
}

/**
 * Calculate success rate percentage
 */
export function calculateSuccessRate(
  correctReviews: number,
  totalReviews: number
): number {
  if (totalReviews === 0) return 0;
  return Math.round((correctReviews / totalReviews) * 100);
}

/**
 * Determine if a card is "mastered"
 * (3+ consecutive correct reviews with good ease factor)
 */
export function isMastered(repetitions: number, easeFactor: number): boolean {
  return repetitions >= 3 && easeFactor >= 2.5;
}

/**
 * Get card difficulty level based on ease factor
 */
export function getDifficultyLevel(easeFactor: number): 'Hard' | 'Medium' | 'Easy' {
  if (easeFactor < 2.0) return 'Hard';
  if (easeFactor < 2.5) return 'Medium';
  return 'Easy';
}
