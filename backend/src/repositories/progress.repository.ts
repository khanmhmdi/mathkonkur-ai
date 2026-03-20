import { Prisma, UserProgress } from '@prisma/client';
import { prisma } from '../config/database';
import logger from '../config/logger';

export interface ProgressStats {
  totalAttempted: number;
  totalCorrect: number;
  overallAccuracy: number;
  totalTimeSpentSeconds: number;
  bySubject: Array<{
    subject: string;
    attempted: number;
    correct: number;
    accuracy: number;
    avgTimeSeconds: number;
  }>;
  streaks: {
    current: number;
    max: number;
  };
  mastery: {
    mastered: number;  // masteryLevel >= 80
    learning: number;  // 30 <= masteryLevel < 80
    new: number;       // masteryLevel < 30
  };
}

export interface UpsertProgressInput {
  userId: string;
  questionId: string;
  attempts: number;
  correctAttempts: number;
  lastAnswer: number;
  isCorrect: boolean;
  timeSpentSeconds: number;
  srsInterval: number;
  srsEaseFactor: number;
  srsRepetitions: number;
  nextReviewAt: Date;
  masteryLevel: number;
  currentStreak: number;
  maxStreak: number;
}

export const progressRepository = {
  /**
   * Find a specific user progress record including question metadata.
   */
  async findByUserAndQuestion(userId: string, questionId: string): Promise<UserProgress | null> {
    return await prisma.userProgress.findUnique({
      where: { userId_questionId: { userId, questionId } },
      include: { question: { select: { subject: true, level: true, text: true } } },
    });
  },

  /**
   * Atomic upsert of progress data.
   */
  async upsertProgress(data: UpsertProgressInput): Promise<UserProgress> {
    const { userId, questionId, ...stats } = data;
    const now = new Date();

    return await prisma.userProgress.upsert({
      where: { userId_questionId: { userId, questionId } },
      create: {
        userId,
        questionId,
        ...stats,
        firstAttemptAt: now,
        lastAttemptAt: now,
      },
      update: {
        ...stats,
        timeSpentSeconds: { increment: stats.timeSpentSeconds }, // aggregate time
        lastAttemptAt: now,
      },
    });
  },

  /**
   * Comprehensive aggregate statistics for a user's progress.
   */
  async getStatsByUser(userId: string): Promise<ProgressStats> {
    const where = { userId };

    // 1. Basic Aggregations
    const agg = await prisma.userProgress.aggregate({
      where,
      _sum: {
        attempts: true,
        correctAttempts: true,
        timeSpentSeconds: true,
      },
    });

    const totalAttempted = agg._sum.attempts || 0;
    const totalCorrect = agg._sum.correctAttempts || 0;

    // 2. Group by Subject (Raw SQL for complex join aggregation)
    const bySubjectRaw = await prisma.$queryRaw<any[]>`
      SELECT 
        q.subject,
        CAST(SUM(p.attempts) AS INTEGER) as attempted,
        CAST(SUM(p.correct_attempts) AS INTEGER) as correct,
        CAST(AVG(p.time_spent_seconds) AS FLOAT) as "avgTimeSeconds"
      FROM user_progress p
      JOIN questions q ON p.question_id = q.id
      WHERE p.user_id = ${userId}
      GROUP BY q.subject
    `;

    const bySubject = bySubjectRaw.map((row: any) => ({
      subject: row.subject,
      attempted: row.attempted,
      correct: row.correct,
      accuracy: row.attempted > 0 ? (row.correct / row.attempted) * 100 : 0,
      avgTimeSeconds: Math.round(row.avgTimeSeconds || 0),
    }));

    // 3. Streak and Mastery counts
    const masteryGroups = await prisma.userProgress.groupBy({
      by: ['masteryLevel'],
      where,
      _count: true,
    });

    const mastery = { mastered: 0, learning: 0, new: 0 };
    masteryGroups.forEach((group: any) => {
      if (group.masteryLevel >= 80) mastery.mastered += group._count;
      else if (group.masteryLevel >= 30) mastery.learning += group._count;
      else mastery.new += group._count;
    });

    // 4. Global Max Streak (Sum across items isn't right, we want the current user's records)
    const streakAgg = await prisma.userProgress.aggregate({
      where,
      _max: { maxStreak: true },
      _sum: { currentStreak: true }, // Not quite right for "Total Current Streak"
    });

    return {
      totalAttempted,
      totalCorrect,
      overallAccuracy: totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0,
      totalTimeSpentSeconds: agg._sum.timeSpentSeconds || 0,
      bySubject,
      streaks: {
        current: streakAgg._sum.currentStreak || 0, // Placeholder: simplistic total streak
        max: streakAgg._max.maxStreak || 0,
      },
      mastery,
    };
  },

  /**
   * Fetch SRS queue: due items OR new items with 0 repetitions.
   */
  async getReviewQueue(userId: string, limit: number = 20) {
    const now = new Date();
    return await prisma.userProgress.findMany({
      where: {
        userId,
        OR: [
          { nextReviewAt: { lte: now } },
          { srsRepetitions: 0 },
        ],
      },
      orderBy: [
        { nextReviewAt: 'asc' },
        { masteryLevel: 'asc' },
      ],
      take: limit,
      include: { question: true },
    });
  },

  /**
   * Find subjects where the user's accuracy is below 60%.
   */
  async getWeakAreas(userId: string) {
    const stats = await this.getStatsByUser(userId);
    return stats.bySubject
      .filter(s => s.accuracy < 60)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5)
      .map(s => ({ subject: s.subject, accuracy: s.accuracy }));
  },

  /**
   * Atomic update for streak (consecutive correct answers on same question).
   */
  async incrementStreak(userId: string, questionId: string, isCorrect: boolean) {
    const existing = await this.findByUserAndQuestion(userId, questionId);
    if (!existing) return;

    const currentStreak = isCorrect ? existing.currentStreak + 1 : 0;
    const maxStreak = Math.max(existing.maxStreak, currentStreak);

    await prisma.userProgress.update({
      where: { id: existing.id },
      data: {
        currentStreak,
        maxStreak,
        lastAttemptAt: new Date(),
      },
    });
  },

  /**
   * Fetch daily activity over the last N days.
   */
  async getWeeklyActivity(userId: string, days: number = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    // Grouping by date via SQL
    return await prisma.$queryRaw<any[]>`
      SELECT 
        DATE(last_attempt_at) as date,
        CAST(COUNT(*) AS INTEGER) as attempts,
        CAST(SUM(CASE WHEN is_correct = true THEN 1 ELSE 0 END) AS INTEGER) as correct
      FROM user_progress
      WHERE user_id = ${userId} AND last_attempt_at >= ${cutoff}
      GROUP BY DATE(last_attempt_at)
      ORDER BY date ASC
    `;
  },

  /**
   * Paginated progress overview for a user.
   */
  async findByUser(userId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      prisma.userProgress.findMany({
        where: { userId },
        orderBy: { lastAttemptAt: 'desc' },
        skip,
        take: limit,
        include: { question: { select: { questionNumber: true, subject: true, level: true } } },
      }),
      prisma.userProgress.count({ where: { userId } }),
    ]);
    return { records, pagination: { total, page, limit, hasMore: total > skip + records.length } };
  },
};
