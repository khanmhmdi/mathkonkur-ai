import { progressRepository } from '../repositories/progress.repository';
import { questionRepository } from '../repositories/question.repository';
import { calculateSRS, mapAnswerToQuality } from '../utils/srs';
import { NotFoundError } from '../utils/errors';
import logger from '../config/logger';

export interface AttemptInput {
  userId: string;
  questionId: string;
  answerIndex: number; 
  timeSpentSeconds: number;
}

export const progressService = {
  /**
   * Core logic for recording an answer attempt.
   * Updates global stats, user SRS data, and streaks.
   */
  async recordAttempt(input: AttemptInput) {
    const { userId, questionId, answerIndex, timeSpentSeconds } = input;

    // 1. Verify question and correctness
    const question = await questionRepository.findById(questionId);
    if (!question) throw new NotFoundError('Question not found');

    const isCorrect = question.correctAnswer === answerIndex;

    // 2. Fetch existing progress or defaults
    const existing = await progressRepository.findByUserAndQuestion(userId, questionId);
    const srsData = {
      interval: existing?.srsInterval ?? 0,
      easeFactor: existing?.srsEaseFactor ?? 2.5,
      repetitions: existing?.srsRepetitions ?? 0,
    };

    // 3. Run SRS Algorithm
    const quality = mapAnswerToQuality(isCorrect, timeSpentSeconds);
    const srs = calculateSRS(srsData, quality, isCorrect);

    // 4. Update stats and streaks
    const attempts = (existing?.attempts ?? 0) + 1;
    const correctAttempts = (existing?.correctAttempts ?? 0) + (isCorrect ? 1 : 0);
    const currentStreak = isCorrect ? (existing?.currentStreak ?? 0) + 1 : 0;
    const maxStreak = Math.max(existing?.maxStreak ?? 0, currentStreak);

    // 5. Atomic Persist
    const progress = await progressRepository.upsertProgress({
      userId,
      questionId,
      attempts,
      correctAttempts,
      lastAnswer: answerIndex,
      isCorrect,
      timeSpentSeconds,
      srsInterval: srs.newInterval,
      srsEaseFactor: srs.newEaseFactor,
      srsRepetitions: srs.newRepetitions,
      nextReviewAt: srs.nextReviewAt,
      masteryLevel: srs.masteryLevel,
      currentStreak,
      maxStreak,
    });

    // 6. Update global question popularity/difficulty stats
    await questionRepository.incrementStats(questionId, isCorrect);

    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      solutionSteps: question.solutionSteps,
      progress: {
        attempts: progress.attempts,
        correctAttempts: progress.correctAttempts,
        accuracy: (progress.correctAttempts / progress.attempts) * 100,
        masteryLevel: progress.masteryLevel,
        nextReviewAt: progress.nextReviewAt,
        isNewRecord: existing?.correctAttempts === 0 && isCorrect,
      },
    };
  },

  /**
   * Get analytics dashboard for a user.
   */
  async getUserStats(userId: string) {
    const stats = await progressRepository.getStatsByUser(userId);
    const activityRaw = await progressRepository.getWeeklyActivity(userId, 7);

    // Fill zeroes for weekly activity
    const activity = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const found = activityRaw.find((a: any) => a.date.toISOString().split('T')[0] === dateStr);
      return {
        date: dateStr,
        attempts: found?.attempts || 0,
        correct: found?.correct || 0,
      };
    });

    return {
      overview: {
        attempted: stats.totalAttempted,
        mastered: stats.mastery.mastered,
        accuracy: stats.overallAccuracy,
        totalTimeMinutes: Math.round(stats.totalTimeSpentSeconds / 60),
        currentStreak: stats.streaks.current,
        maxStreak: stats.streaks.max,
      },
      bySubject: stats.bySubject,
      weeklyActivity: activity,
      weakAreas: stats.bySubject.filter(s => s.accuracy < 60).map(s => s.subject),
    };
  },

  /**
   * Intelligent Review Queue.
   * Prioritizes due items, fills with random if queue is empty.
   */
  async getReviewQueue(userId: string, limit: number = 10) {
    const dueItems = await progressRepository.getReviewQueue(userId, limit);
    
    // Map to normalized UI format
    const queue = dueItems.map((item: any) => ({
      progressId: item.id,
      questionId: item.questionId,
      subject: (item as any).question.subject,
      level: (item as any).question.level,
      text: (item as any).question.text,
      options: (item as any).question.options,
      dueDate: item.nextReviewAt,
      daysOverdue: Math.max(0, Math.floor((new Date().getTime() - item.nextReviewAt!.getTime()) / (1000 * 60 * 60 * 24))),
    }));

    if (queue.length < limit) {
      // Suggest filling with random "new" questions from service? 
      // For now, just return due ones.
    }

    return queue;
  },
};
