import { api, ApiResponse } from './api';

export interface ChatConversation {
  id: string;
  userId: string;
  title: string | null;
  subject: string;
  level: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'model';
  content: string;
  createdAt: string;
}

export interface ConversationsResponse {
  conversations: ChatConversation[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface MessagesResponse {
  messages: ChatMessage[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

const chatHistoryService = {
  async getConversations(page: number = 1, limit: number = 20): Promise<ConversationsResponse> {
    const response = await api.get<ConversationsResponse>(`/chat?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  async getConversationHistory(conversationId: string, page: number = 1, limit: number = 50): Promise<MessagesResponse> {
    const response = await api.get<MessagesResponse>(`/chat/${conversationId}?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  async deleteConversation(conversationId: string): Promise<void> {
    await api.delete(`/chat/${conversationId}`);
  },
};

export default chatHistoryService;
