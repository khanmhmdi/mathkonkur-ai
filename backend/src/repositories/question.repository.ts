import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export interface CreateQuestionInput {
  questionNumber: number;
  text: string;
  textTeX?: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  topic?: string;
  level: string;
  examYear?: number;
  imageUrl?: string;
  explanation: string;
  explanationTeX?: string;
  solutionSteps?: Array<{ step: number; text: string; formula?: string }>;
  aiHints?: string[];
  commonMistakes?: string[];
  keyConcepts?: string[];
}

export interface QuestionFilter {
  subject?: string;
  level?: string;
  topic?: string;
  examYear?: number;
  isVerified?: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export const questionRepository = {
  /**
   * Standard CRUD
   */
  async create(data: CreateQuestionInput) {
    return await prisma.question.create({ data });
  },

  async update(id: string, data: Partial<CreateQuestionInput>) {
    return await prisma.question.update({ where: { id }, data });
  },

  async delete(id: string) {
    return await prisma.question.delete({ where: { id } });
  },

  /**
   * Find a question by its UUID.
   * If userId is provided, includes favorite status and specific progress.
   */
  async findById(id: string, userId?: string) {
    return await prisma.question.findUnique({
      where: { id },
      include: userId ? {
        favorites: { where: { userId } },
        progress: { where: { userId } },
      } : undefined,
    });
  },

  async findByNumber(questionNumber: number) {
    return await prisma.question.findUnique({ where: { questionNumber } });
  },

  /**
   * Comprehensive find with filtering and pagination.
   */
  async findAll(filter: QuestionFilter = {}, pagination: PaginationOptions = {}) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.QuestionWhereInput = {
      subject: filter.subject,
      level: filter.level,
      topic: filter.topic,
      examYear: filter.examYear,
      isVerified: filter.isVerified,
    };

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy: { questionNumber: 'asc' },
        skip,
        take: limit,
      }),
      prisma.question.count({ where }),
    ]);

    return { 
      questions, 
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } 
    };
  },

  /**
   * Full-text search using Prisma's case-insensitive contains.
   */
  async search(query: string, filter: QuestionFilter = {}, pagination: PaginationOptions = {}) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.QuestionWhereInput = {
      AND: [
        {
          OR: [
            { text: { contains: query, mode: 'insensitive' } },
            { subject: { contains: query, mode: 'insensitive' } },
            { topic: { contains: query, mode: 'insensitive' } },
          ],
        },
        { subject: filter.subject },
        { level: filter.level },
        { examYear: filter.examYear },
      ],
    };

    const [questions, total] = await Promise.all([
      prisma.question.findMany({ where, skip, take: limit, orderBy: { questionNumber: 'asc' } }),
      prisma.question.count({ where }),
    ]);

    return { 
      questions, 
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } 
    };
  },

  /**
   * Returns a list of random questions for a subject/level, excluding specific IDs.
   * Uses Postgres RANDOM() for efficient selection.
   */
  async getRandomBySubject(subject: string, level: string, excludeIds: string[], limit: number = 1) {
    // Note: We use raw query for true randomness in Postgres.
    const excludeList = excludeIds.length > 0 ? Prisma.join(excludeIds) : Prisma.empty;
    const excludeFilter = excludeIds.length > 0 
      ? Prisma.sql`AND id NOT IN (${excludeList})` 
      : Prisma.empty;

    return await prisma.$queryRaw<any[]>`
      SELECT * FROM questions 
      WHERE subject = ${subject} 
      AND level = ${level}
      ${excludeFilter}
      ORDER BY RANDOM()
      LIMIT ${limit}
    `;
  },

  /**
   * Find questions with same subject and similar level.
   */
  async getRelated(questionId: string, limit: number = 5) {
    const current = await this.findById(questionId);
    if (!current) return [];

    return await prisma.question.findMany({
      where: {
        subject: current.subject,
        id: { not: questionId },
      },
      orderBy: [
        { level: 'asc' }, // Same level first if enum was ordered, otherwise just sorting
        { correctRate: 'desc' }, // Easiest ones first or random
      ],
      take: limit,
    });
  },

  /**
   * Atomically increments attempt stats.
   */
  async incrementStats(id: string, isCorrect: boolean) {
    // We update counts first, then correctRate in a second step to keep logic clean.
    const question = await prisma.question.update({
      where: { id },
      data: {
        attemptCount: { increment: 1 },
        correctCount: isCorrect ? { increment: 1 } : undefined,
      },
    });

    const rate = question.attemptCount > 0 ? question.correctCount / question.attemptCount : null;
    return await prisma.question.update({
      where: { id },
      data: { correctRate: rate },
    });
  },
};
