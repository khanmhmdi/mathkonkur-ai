import { prisma } from '../config/database';
import { ConflictError, NotFoundError } from '../utils/errors';

export const favoriteRepository = {
  /**
   * Toggle favourite: add if absent, remove if present.
   * Returns { added: boolean }.
   */
  async toggle(userId: string, questionId: string, notes?: string): Promise<{ added: boolean }> {
    const existing = await prisma.userFavorite.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });

    if (existing) {
      await prisma.userFavorite.delete({ where: { userId_questionId: { userId, questionId } } });
      return { added: false };
    }

    await prisma.userFavorite.create({ data: { userId, questionId, notes } });
    return { added: true };
  },

  /**
   * Update the personal note on a favorite.
   */
  async updateNote(userId: string, questionId: string, notes: string) {
    const existing = await prisma.userFavorite.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });
    if (!existing) throw new NotFoundError('Favorite not found');

    return await prisma.userFavorite.update({
      where: { userId_questionId: { userId, questionId } },
      data: { notes },
    });
  },

  /**
   * Paginated list of favourites for a user, sorted by newest first.
   */
  async findByUser(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [favorites, total] = await Promise.all([
      prisma.userFavorite.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          question: { select: { questionNumber: true, text: true, subject: true, level: true } },
        },
      }),
      prisma.userFavorite.count({ where: { userId } }),
    ]);
    return { favorites, pagination: { total, page, limit, hasMore: total > skip + favorites.length } };
  },

  /**
   * Check if a specific question is favourited by the user.
   */
  async isFavorited(userId: string, questionId: string): Promise<boolean> {
    const record = await prisma.userFavorite.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });
    return record !== null;
  },
};
