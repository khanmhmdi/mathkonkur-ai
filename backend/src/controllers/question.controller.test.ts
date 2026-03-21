import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { questionController } from './question.controller';
import { questionService } from '../services/question.service';

// Mock questionService
jest.mock('../services/question.service', () => ({
  questionService: {
    getQuestions: jest.fn(),
    getQuestionById: jest.fn(),
    submitAnswer: jest.fn(),
    searchQuestions: jest.fn(),
  }
}));

describe('Question Controller', () => {
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

  describe('getQuestions', () => {
    it('should return 200 with paginated questions', async () => {
      (questionService.getQuestions as any).mockResolvedValue({
        questions: [
          { id: 'q-1', text: 'Question 1', subject: 'حسابان', level: 'متوسط' },
          { id: 'q-2', text: 'Question 2', subject: 'هندسه', level: 'سخت' },
        ],
        pagination: { total: 2, page: 1, limit: 20, totalPages: 1 }
      });

      await questionController.getQuestions(mockReq, mockRes, next);

      expect(questionService.getQuestions).toHaveBeenCalledWith(
        {},
        { page: 1, limit: 20 }
      );
      expect(mockRes._body.success).toBe(true);
      expect(mockRes._body.data.questions).toHaveLength(2);
      expect(mockRes._body.data.pagination.total).toBe(2);
    });

    it('should apply filters from query params', async () => {
      (questionService.getQuestions as any).mockResolvedValue({
        questions: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 }
      });

      mockReq.query = {
        subject: 'حسابان',
        level: 'سخت',
        page: '2',
        limit: '10'
      };

      await questionController.getQuestions(mockReq, mockRes, next);

      expect(questionService.getQuestions).toHaveBeenCalledWith(
        { subject: 'حسابان', level: 'سخت' },
        { page: 2, limit: 10 }
      );
    });

    it('should clamp pagination values within valid range', async () => {
      (questionService.getQuestions as any).mockResolvedValue({
        questions: [],
        pagination: { total: 0, page: 1, limit: 50, totalPages: 0 }
      });

      mockReq.query = { page: '0', limit: '200' };

      await questionController.getQuestions(mockReq, mockRes, next);

      expect(questionService.getQuestions).toHaveBeenCalledWith(
        {},
        { page: 1, limit: 100 }
      );
    });

    it('should call next with error on service failure', async () => {
      const error = new Error('Database error');
      (questionService.getQuestions as any).mockRejectedValue(error);

      await questionController.getQuestions(mockReq, mockRes, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getQuestionById', () => {
    it('should return 200 with single question', async () => {
      (questionService.getQuestionById as any).mockResolvedValue({
        id: 'q-1',
        text: 'What is 2+2?',
        subject: 'حسابان',
        level: 'آسان',
        options: ['1', '2', '3', '4'],
        isFavorite: false,
        userProgress: null
      });

      mockReq.params = { id: 'q-1' };

      await questionController.getQuestionById(mockReq, mockRes, next);

      expect(questionService.getQuestionById).toHaveBeenCalledWith('q-1', 'user-abc');
      expect(mockRes._body.success).toBe(true);
      expect(mockRes._body.data.question.id).toBe('q-1');
    });

    it('should call next with error when question not found', async () => {
      const notFoundError = new Error('Question not found');
      (questionService.getQuestionById as any).mockRejectedValue(notFoundError);

      mockReq.params = { id: 'invalid-id' };

      await questionController.getQuestionById(mockReq, mockRes, next);

      expect(next).toHaveBeenCalledWith(notFoundError);
    });
  });

  describe('submitAnswer', () => {
    it('should return 200 with submission result', async () => {
      (questionService.submitAnswer as any).mockResolvedValue({
        isCorrect: true,
        correctAnswer: 3,
        explanation: 'The correct answer is 4',
        progress: { attempts: 1, correctAttempts: 1 }
      });

      mockReq.params = { id: 'q-1' };
      mockReq.body = { answerIndex: 3, timeSpentSeconds: 45 };

      await questionController.submitAnswer(mockReq, mockRes, next);

      expect(questionService.submitAnswer).toHaveBeenCalledWith('user-abc', 'q-1', 3, 45);
      expect(mockRes._body.success).toBe(true);
      expect(mockRes._body.data.isCorrect).toBe(true);
    });

    it('should default timeSpentSeconds to 0 when not provided', async () => {
      (questionService.submitAnswer as any).mockResolvedValue({
        isCorrect: false,
        correctAnswer: 2,
        explanation: 'Wrong answer',
        progress: { attempts: 1, correctAttempts: 0 }
      });

      mockReq.params = { id: 'q-1' };
      mockReq.body = { answerIndex: 1 };

      await questionController.submitAnswer(mockReq, mockRes, next);

      expect(questionService.submitAnswer).toHaveBeenCalledWith('user-abc', 'q-1', 1, 0);
    });

    it('should call next with error on submission failure', async () => {
      const error = new Error('Invalid answer index');
      (questionService.submitAnswer as any).mockRejectedValue(error);

      mockReq.params = { id: 'q-1' };
      mockReq.body = { answerIndex: 10 };

      await questionController.submitAnswer(mockReq, mockRes, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('searchQuestions', () => {
    it('should return 200 with search results', async () => {
      (questionService.searchQuestions as any).mockResolvedValue({
        questions: [
          { id: 'q-1', text: 'Integration problem', subject: 'حسابان' }
        ],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 }
      });

      mockReq.query = { q: 'integration' };

      await questionController.searchQuestions(mockReq, mockRes, next);

      expect(questionService.searchQuestions).toHaveBeenCalledWith(
        'integration',
        {},
        { page: 1, limit: 20 }
      );
      expect(mockRes._body.success).toBe(true);
      expect(mockRes._body.data.questions).toHaveLength(1);
    });

    it('should handle empty search query', async () => {
      (questionService.searchQuestions as any).mockResolvedValue({
        questions: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 }
      });

      await questionController.searchQuestions(mockReq, mockRes, next);

      expect(questionService.searchQuestions).toHaveBeenCalledWith(
        '',
        {},
        { page: 1, limit: 20 }
      );
    });

    it('should call next with error on search failure', async () => {
      const error = new Error('Search service error');
      (questionService.searchQuestions as any).mockRejectedValue(error);

      mockReq.query = { q: 'test' };

      await questionController.searchQuestions(mockReq, mockRes, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
