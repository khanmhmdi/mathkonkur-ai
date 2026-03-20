import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { chatController } from './chat.controller';
import { chatService } from '../services/chat.service';

// Mock chatService
jest.mock('../services/chat.service', () => ({
  chatService: {
    createConversation: jest.fn(),
    processMessage: jest.fn(),
    getConversationHistory: jest.fn(),
    getUserConversations: jest.fn(),
    deleteConversation: jest.fn(),
  }
}));

describe('Chat Controller', () => {
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

  it('createConversation should return 201', async () => {
    (chatService.createConversation as any).mockResolvedValue({
      conversation: { id: 'conv-111', title: 'حل مسئله', subject: 'جبر و توابع', level: 'ریاضی فیزیک', createdAt: new Date() },
      message: { id: 'msg-222', role: 'model', content: 'حل:', createdAt: new Date() }
    });

    mockReq.body = { initialMessage: 'حل کن: x^2 = 4', subject: 'جبر و توابع', level: 'ریاضی فیزیک' };
    
    await chatController.createConversation(mockReq, mockRes, next);
    
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes._body.success).toBe(true);
    expect(mockRes._body.data.conversation.id).toBe('conv-111');
  });

  it('sendMessage should return 200 with message', async () => {
    (chatService.processMessage as any).mockResolvedValue({
      id: 'msg-223', role: 'model', content: 'پاسخ', createdAt: new Date()
    });

    mockReq.body = { content: 'سوال بعدی' };
    mockReq.params = { conversationId: 'conv-111' };
    
    await chatController.sendMessage(mockReq, mockRes, next);
    
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes._body.success).toBe(true);
    expect(mockRes._body.data.message.content).toBe('پاسخ');
  });

  it('getHistory should return 200', async () => {
    (chatService.getConversationHistory as any).mockResolvedValue({
      messages: [], pagination: { total: 0, page: 1, limit: 50, hasMore: false }
    });

    mockReq.params = { conversationId: 'conv-111' };
    mockReq.query = { page: '1', limit: '50' };
    
    await chatController.getHistory(mockReq, mockRes, next);
    
    expect(mockRes._body.success).toBe(true);
  });

  it('getConversations should return 200', async () => {
    (chatService.getUserConversations as any).mockResolvedValue({
      conversations: [], pagination: { total: 0, page: 1, limit: 20, hasMore: false }
    });
    
    await chatController.getConversations(mockReq, mockRes, next);
    
    expect(mockRes._body.success).toBe(true);
  });

  it('deleteConversation should return 204', async () => {
    (chatService.deleteConversation as any).mockResolvedValue(undefined);
    mockReq.params = { conversationId: 'conv-111' };
    
    await chatController.deleteConversation(mockReq, mockRes, next);
    
    expect(mockRes.status).toHaveBeenCalledWith(204);
  });

  it('oversized image should return 413 immediately', async () => {
    const oversizedData = 'A'.repeat(8 * 1024 * 1024); // ~8MB base64 (since we don't handle streaming, this is large enough to trigger our manual check)
    // Wait, the original test has a check for 5MB limit in the controller
    mockReq.body = { content: 'تصویر', image: { data: oversizedData, mimeType: 'image/jpeg' } };
    mockReq.params = { conversationId: 'conv-111' };
    
    await chatController.sendMessage(mockReq, mockRes, next);
    
    expect(mockRes.status).toHaveBeenCalledWith(413);
    expect(mockRes._body.error.code).toBe('IMAGE_TOO_LARGE');
  });
});
