import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { favoriteController } from './favorite.controller';
import { favoriteRepository } from '../repositories/favorite.repository';

// Mock favoriteRepository
jest.mock('../repositories/favorite.repository', () => ({
  favoriteRepository: {
    findByUser: jest.fn(),
    toggle: jest.fn(),
    updateNote: jest.fn(),
  }
}));

describe('Favorite Controller', () => {
  let mockRes: any;
  let mockReq: any;
  const next = jest.fn();

  beforeEach(() => {
    mockRes = {
      _status: 200,
      _body: null,
      status: (jest.fn() as any).mockImplementation((code: number) => {
        mockRes._status = code;
        return mockRes;
      }),
      json: (jest.fn() as any).mockImplementation((data: any) => {
        mockRes._body = data;
        return mockRes;
      }),
      send: (jest.fn() as any).mockImplementation(() => {
        return mockRes;
      })
    };
    mockReq = {
      user: { userId: 'user-abc', email: 'test@test.com', level: 'ریاضی فیزیک', type: 'access' },
      body: {},
      params: {},
      query: {},
    };
    next.mockClear();
    jest.clearAllMocks();
  });

  describe('getFavorites', () => {
    it('should return 200 with paginated favorites', async () => {
      (favoriteRepository.findByUser as any).mockResolvedValue({
        favorites: [
          { id: 'fav-1', questionId: 'q-1', userId: 'user-abc', notes: null, createdAt: new Date() },
          { id: 'fav-2', questionId: 'q-2', userId: 'user-abc', notes: 'Important', createdAt: new Date() },
        ],
        pagination: { total: 2, page: 1, limit: 20, hasMore: false }
      });

      await favoriteController.getFavorites(mockReq, mockRes, next);

      expect(favoriteRepository.findByUser).toHaveBeenCalledWith('user-abc', 1, 20);
      expect(mockRes._body.success).toBe(true);
      expect(mockRes._body.data.favorites).toHaveLength(2);
    });

    it('should apply pagination params from query', async () => {
      (favoriteRepository.findByUser as any).mockResolvedValue({
        favorites: [],
        pagination: { total: 0, page: 2, limit: 10, hasMore: false }
      });

      mockReq.query = { page: '2', limit: '10' };

      await favoriteController.getFavorites(mockReq, mockRes, next);

      expect(favoriteRepository.findByUser).toHaveBeenCalledWith('user-abc', 2, 10);
    });

    it('should clamp limit to max 100', async () => {
      (favoriteRepository.findByUser as any).mockResolvedValue({
        favorites: [],
        pagination: { total: 0, page: 1, limit: 100, hasMore: false }
      });

      mockReq.query = { limit: '200' };

      await favoriteController.getFavorites(mockReq, mockRes, next);

      expect(favoriteRepository.findByUser).toHaveBeenCalledWith('user-abc', 1, 100);
    });

    it('should call next with error on repository failure', async () => {
      const error = new Error('Database error');
      (favoriteRepository.findByUser as any).mockRejectedValue(error);

      await favoriteController.getFavorites(mockReq, mockRes, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('addFavorite', () => {
    it('should return 201 when adding new favorite', async () => {
      (favoriteRepository.toggle as any).mockResolvedValue({ added: true });

      mockReq.body = { questionId: 'q-1', notes: 'Study this' };

      await favoriteController.addFavorite(mockReq, mockRes, next);

      expect(favoriteRepository.toggle).toHaveBeenCalledWith('user-abc', 'q-1', 'Study this');
      expect(mockRes._status).toBe(201);
      expect(mockRes._body.success).toBe(true);
      expect(mockRes._body.data.favorite.questionId).toBe('q-1');
    });

    it('should return 200 when favorite already exists', async () => {
      (favoriteRepository.toggle as any).mockResolvedValue({ added: false });

      mockReq.body = { questionId: 'q-1' };

      await favoriteController.addFavorite(mockReq, mockRes, next);

      expect(mockRes._status).toBe(200);
      expect(mockRes._body.success).toBe(true);
      expect(mockRes._body.data.message).toBe('Already in favorites');
    });

    it('should handle undefined notes', async () => {
      (favoriteRepository.toggle as any).mockResolvedValue({ added: true });

      mockReq.body = { questionId: 'q-2' };

      await favoriteController.addFavorite(mockReq, mockRes, next);

      expect(favoriteRepository.toggle).toHaveBeenCalledWith('user-abc', 'q-2', undefined);
    });

    it('should call next with error on toggle failure', async () => {
      const error = new Error('Conflict error');
      (favoriteRepository.toggle as any).mockRejectedValue(error);

      mockReq.body = { questionId: 'invalid-id' };

      await favoriteController.addFavorite(mockReq, mockRes, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('removeFavorite', () => {
    it('should return 204 on successful removal', async () => {
      (favoriteRepository.toggle as any).mockResolvedValue({ added: false });

      mockReq.params = { questionId: 'q-1' };

      await favoriteController.removeFavorite(mockReq, mockRes, next);

      expect(favoriteRepository.toggle).toHaveBeenCalledWith('user-abc', 'q-1');
      expect(mockRes._status).toBe(204);
    });

    it('should handle string array params by converting to string', async () => {
      (favoriteRepository.toggle as any).mockResolvedValue({ added: false });

      // Testing that String() conversion works even with array
      mockReq.params = { questionId: ['q-1'] };

      await favoriteController.removeFavorite(mockReq, mockRes, next);

      expect(favoriteRepository.toggle).toHaveBeenCalledWith('user-abc', 'q-1');
    });

    it('should call next with error on removal failure', async () => {
      const error = new Error('Database error');
      (favoriteRepository.toggle as any).mockRejectedValue(error);

      mockReq.params = { questionId: 'q-1' };

      await favoriteController.removeFavorite(mockReq, mockRes, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateNote', () => {
    it('should return 200 with updated favorite', async () => {
      (favoriteRepository.updateNote as any).mockResolvedValue({
        id: 'fav-1',
        userId: 'user-abc',
        questionId: 'q-1',
        notes: 'Updated note',
        createdAt: new Date()
      });

      mockReq.params = { questionId: 'q-1' };
      mockReq.body = { notes: 'Updated note' };

      await favoriteController.updateNote(mockReq, mockRes, next);

      expect(favoriteRepository.updateNote).toHaveBeenCalledWith('user-abc', 'q-1', 'Updated note');
      expect(mockRes._body.success).toBe(true);
      expect(mockRes._body.data.favorite.notes).toBe('Updated note');
    });

    it('should call next with error when favorite not found', async () => {
      const notFoundError = new Error('Favorite not found');
      (favoriteRepository.updateNote as any).mockRejectedValue(notFoundError);

      mockReq.params = { questionId: 'non-existent' };
      mockReq.body = { notes: 'Test note' };

      await favoriteController.updateNote(mockReq, mockRes, next);

      expect(next).toHaveBeenCalledWith(notFoundError);
    });
  });
});
