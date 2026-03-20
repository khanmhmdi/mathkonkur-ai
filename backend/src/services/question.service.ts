import { prisma } from '../config/database';
import { questionRepository, QuestionFilter, PaginationOptions } from '../repositories/question.repository';
import { progressRepository } from '../repositories/progress.repository';
import { progressService } from './progress.service';
import { favoriteRepository } from '../repositories/favorite.repository';
import { AppError, NotFoundError, ValidationError } from '../utils/errors';
import logger from '../config/logger';

export const questionService = {
  /**
   * Get paginated questions with filters.
   */
  async getQuestions(filter: QuestionFilter, pagination: PaginationOptions) {
    // Basic validation
    if (filter.subject && filter.subject.length > 50) {
      throw new ValidationError('Subject name too long');
    }
    return await questionRepository.findAll(filter, pagination);
  },

  /**
   * Get a single question. 
   * If userId provided, includes progress/favorite status.
   * Hides correctAnswer for non-admin requests (security).
   */
  async getQuestionById(id: string, userId?: string) {
    const question = await questionRepository.findById(id, userId);
    if (!question) throw new NotFoundError('Question not found');

    // Attach aggregate flags for frontend
    const isFavorite = userId ? question.favorites.length > 0 : false;
    const userProgress = userId ? question.progress[0] || null : null;

    // Remove internal fields for the public API
    const { correctAnswer, favorites, progress, ...publicData } = question as any;

    return {
      ...publicData,
      isFavorite,
      userProgress,
      // We don't return correctAnswer here to prevent cheating.
    };
  },

  /**
   * Submit an answer for verification and progress tracking.
   */
  async submitAnswer(userId: string, questionId: string, answerIndex: number, timeSpentSeconds: number) {
    // We delegate the actual logic to progressService for SRS/Persistence
    return await progressService.recordAttempt({
      userId,
      questionId,
      answerIndex,
      timeSpentSeconds,
    });
  },

  /**
   * Full-text search with sanitization.
   */
  async searchQuestions(query: string, filter: QuestionFilter, pagination: PaginationOptions) {
    const sanitizedQuery = query.trim().substring(0, 100);
    if (sanitizedQuery.length < 2) return { questions: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };

    return await questionRepository.search(sanitizedQuery, filter, pagination);
  },

  /**
   * Toggle favorite status using the favorite repository.
   */
  async toggleFavorite(userId: string, questionId: string, notes?: string) {
    const questionExists = await questionRepository.findById(questionId);
    if (!questionExists) throw new NotFoundError('Question not found');

    return await favoriteRepository.toggle(userId, questionId, notes);
  },

  /**
   * Practice Set Generation (Recommendation Engine)
   * 30% New, 40% Weak (Mastery < 50%), 30% Review (SRS Due)
   */
  async getPracticeSet(userId: string, subject: string, level: string, count: number = 10) {
    // 1. Get user's existing IDs to exclude from "New" pool
    const userProgress = await progressRepository.findByUser(userId, 1, 1000);
    const completedIds = userProgress.records.map((r: any) => r.questionId);

    // 2. Fetch SRS Due questions (Review pool)
    const reviewPool = await progressRepository.getReviewQueue(userId, Math.ceil(count * 0.3));
    const reviewQuestions = reviewPool.map((r: any) => r.question);

    // 3. Fetch Weak questions (Mastery < 50%)
    const weakPool = await prisma.userProgress.findMany({
      where: { userId, masteryLevel: { lt: 50 }, question: { subject, level } },
      take: Math.ceil(count * 0.4),
      include: { question: true },
    });
    const weakQuestions = weakPool.map((r: any) => r.question);

    // 4. Fetch New questions (Random selection, excluding already encountered)
    const newCount = count - reviewQuestions.length - weakQuestions.length;
    let newQuestions: any[] = [];
    if (newCount > 0) {
      newQuestions = await questionRepository.getRandomBySubject(subject, level, completedIds, newCount);
    }

    // Merge and shuffle (simplified merge)
    const combined = [...reviewQuestions, ...weakQuestions, ...newQuestions];
    return combined.slice(0, count);
  },
};
