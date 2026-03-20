/**
 * Spaced Repetition System (SM-2 Algorithm)
 * 
 * This utility handles the core logic for calculating review intervals,
 * ease factors, and mastery levels based on student performance.
 */

export interface SRSData {
  interval: number;      // Current interval in days
  easeFactor: number;    // EF in SM-2 (starts at 2.5)
  repetitions: number;   // Number of consecutive successful reviews
}

export interface SRSResult {
  newInterval: number;
  newEaseFactor: number;
  newRepetitions: number;
  nextReviewAt: Date;
  masteryLevel: number; // 0-100 scale
}

// Quality: 0-2 (Again), 3 (Hard), 4 (Good), 5 (Easy)
export type QualityRating = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Calculates new SRS parameters based on the SM-2 algorithm.
 */
export function calculateSRS(current: SRSData, quality: QualityRating, isCorrect: boolean): SRSResult {
  let newRepetitions = current.repetitions;
  let newInterval = current.interval;
  let newEaseFactor = current.easeFactor;

  // 1. Calculate new Ease Factor (EF)
  newEaseFactor = newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  // 2. Calculate new Interval and Repetitions
  if (!isCorrect || quality < 3) {
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions = newRepetitions + 1;
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(newInterval * newEaseFactor);
    }
  }

  // 3. Cap interval at 1 year (365 days)
  if (newInterval > 365) newInterval = 365;

  // 4. Calculate Next Review Date (UTC)
  const nextReviewAt = new Date();
  nextReviewAt.setHours(0, 0, 0, 0); // Normalized to start of day
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

  // 5. Map to Mastery Level (0-100)
  let masteryLevel = 0;
  if (newRepetitions === 0) masteryLevel = 10;
  else if (newRepetitions === 1) masteryLevel = 25;
  else if (newRepetitions === 2) masteryLevel = 50;
  else if (newRepetitions === 3) masteryLevel = 65;
  else if (newRepetitions === 4) masteryLevel = 80;
  else masteryLevel = Math.min(95, 80 + (newRepetitions - 4) * 5);

  return {
    newInterval,
    newEaseFactor,
    newRepetitions,
    nextReviewAt,
    masteryLevel,
  };
}

/**
 * Maps simple correctness and time spent to a 0-5 quality rating.
 */
export function mapAnswerToQuality(isCorrect: boolean, timeSpentSeconds: number): QualityRating {
  if (!isCorrect) {
    // If wrong quickly (<10s), user probably guessed or totally failed (quality 1)
    // If wrong after long time, partial understanding but failed (quality 0)
    return timeSpentSeconds < 10 ? 1 : 0;
  }

  // Correct answers
  if (timeSpentSeconds < 30) return 5; // Easy
  if (timeSpentSeconds < 60) return 4; // Good
  return 3; // Hard
}

/**
 * Checks if a question is due for SRS review.
 */
export function isDueForReview(nextReviewAt: Date | null): boolean {
  if (!nextReviewAt) return true; // New items are always "due"
  const now = new Date();
  return nextReviewAt <= now;
}
