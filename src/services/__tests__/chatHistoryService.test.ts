import chatHistoryService, { ChatConversation, ChatMessage } from '../chatHistoryService';
import { api } from '../api';

jest.mock('../api');

const mockApi = api as jest.Mocked<typeof api>;

describe('chatHistoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConversations', () => {
    const mockConversations: ChatConversation[] = [
      {
        id: 'conv-1',
        userId: 'user-1',
        title: 'Test Conversation 1',
        subject: ' Calculus',
        level: ' Math-Physics',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
      {
        id: 'conv-2',
        userId: 'user-1',
        title: 'Test Conversation 2',
        subject: ' Algebra',
        level: ' Natural Sciences',
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-04T00:00:00Z',
      },
    ];

    it('should fetch conversations with default pagination', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            conversations: mockConversations,
            pagination: {
              total: 2,
              page: 1,
              limit: 20,
              hasMore: false,
            },
          },
        },
      } as any);

      const result = await chatHistoryService.getConversations();

      expect(mockApi.get).toHaveBeenCalledWith('/chat?page=1&limit=20');
      expect(result.conversations).toEqual(mockConversations);
      expect(result.pagination.total).toBe(2);
    });

    it('should fetch conversations with custom pagination', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            conversations: mockConversations,
            pagination: {
              total: 10,
              page: 2,
              limit: 5,
              hasMore: true,
            },
          },
        },
      } as any);

      const result = await chatHistoryService.getConversations(2, 5);

      expect(mockApi.get).toHaveBeenCalledWith('/chat?page=2&limit=5');
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.hasMore).toBe(true);
    });

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(chatHistoryService.getConversations()).rejects.toThrow('Network error');
    });
  });

  describe('getConversationHistory', () => {
    const mockMessages: ChatMessage[] = [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'Hello AI',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        role: 'assistant',
        content: 'Hello! How can I help you?',
        createdAt: '2024-01-01T00:01:00Z',
      },
    ];

    it('should fetch conversation messages with default pagination', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            messages: mockMessages,
            pagination: {
              total: 2,
              page: 1,
              limit: 50,
              hasMore: false,
            },
          },
        },
      } as any);

      const result = await chatHistoryService.getConversationHistory('conv-1');

      expect(mockApi.get).toHaveBeenCalledWith('/chat/conv-1?page=1&limit=50');
      expect(result.messages).toEqual(mockMessages);
      expect(result.pagination.total).toBe(2);
    });

    it('should fetch conversation messages with custom pagination', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            messages: mockMessages,
            pagination: {
              total: 100,
              page: 3,
              limit: 10,
              hasMore: true,
            },
          },
        },
      } as any);

      const result = await chatHistoryService.getConversationHistory('conv-1', 3, 10);

      expect(mockApi.get).toHaveBeenCalledWith('/chat/conv-1?page=3&limit=10');
      expect(result.pagination.page).toBe(3);
      expect(result.pagination.limit).toBe(10);
    });

    it('should handle API errors', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Not found'));

      await expect(chatHistoryService.getConversationHistory('invalid-id')).rejects.toThrow('Not found');
    });
  });

  describe('deleteConversation', () => {
    it('should delete a conversation successfully', async () => {
      mockApi.delete.mockResolvedValueOnce({} as any);

      await expect(chatHistoryService.deleteConversation('conv-1')).resolves.not.toThrow();
      expect(mockApi.delete).toHaveBeenCalledWith('/chat/conv-1');
    });

    it('should handle API errors when deleting', async () => {
      mockApi.delete.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(chatHistoryService.deleteConversation('conv-1')).rejects.toThrow('Unauthorized');
    });
  });
});
