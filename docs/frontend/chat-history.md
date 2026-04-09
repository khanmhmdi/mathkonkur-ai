# Chat History Feature

This document describes the chat history feature implementation for MathKonkur AI.

## Overview

The chat history feature allows users to:
- View a list of previous conversations in a sidebar
- Select and load previous conversations
- Start new conversations
- Delete conversations

## Frontend Changes

### New Files

#### `src/services/chatHistoryService.ts`

API service for fetching and managing chat history.

```typescript
interface ChatConversation {
  id: string;
  userId: string;
  title: string | null;
  subject: string;
  level: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'model';
  content: string;
  createdAt: string;
}

// API Methods
getConversations(page?: number, limit?: number): Promise<ConversationsResponse>
getConversationHistory(conversationId: string, page?: number, limit?: number): Promise<MessagesResponse>
deleteConversation(conversationId: string): Promise<void>
```

### Modified Files

#### `src/components/ChatInterface.tsx`

Added chat history sidebar with the following features:

**New State Variables:**
```typescript
const [conversations, setConversations] = useState<ChatConversation[]>([]);
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const [isLoadingConversations, setIsLoadingConversations] = useState(false);
```

**New Functions:**
- `loadConversations()` - Fetches user conversations from API
- `startNewChat()` - Resets to new conversation
- `selectConversation(convId)` - Loads selected conversation history
- `handleDeleteConversation(e, convId)` - Deletes conversation

**UI Components Added:**
- Sidebar with conversation list (right side)
- "New Chat" button (button with Plus icon)
- Conversation items with title and date
- Delete button (appears on hover)
- Mobile menu button to toggle sidebar

**Sidebar Features:**
- Desktop: Always visible on right side
- Mobile: Toggle via menu button
- Shows "No conversations yet" empty state
- Displays last updated date in Persian format

## API Endpoints

The feature uses existing backend endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat` | List user conversations |
| GET | `/api/chat/:conversationId` | Get conversation messages |
| DELETE | `/api/chat/:conversationId` | Delete conversation |

### API Response Formats

**GET /api/chat Response:**
```typescript
{
  success: true,
  data: {
    conversations: ChatConversation[],
    pagination: {
      total: number,
      page: number,
      limit: number,
      hasMore: boolean
    }
  }
}
```

**GET /api/chat/:conversationId Response:**
```typescript
{
  success: true,
  data: {
    messages: ChatMessage[],
    pagination: {
      total: number,
      page: number,
      limit: number,
      hasMore: boolean
    }
  }
}
```

## Database Schema

No new tables required. Uses existing models:

### ChatConversation Model
```prisma
model ChatConversation {
  id        String        @id @default(uuid())
  userId    String        @map("user_id")
  title     String?
  subject   String
  level     String
  createdAt DateTime      @default(now()) @map("created_at")
  updatedAt DateTime      @updatedAt @map("updated_at")
  user      User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages  ChatMessage[]

  @@index([userId, updatedAt])
  @@map("chat_conversations")
}
```

### ChatMessage Model
```prisma
model ChatMessage {
  id             String           @id @default(uuid())
  conversationId String           @map("conversation_id")
  role           String
  content        String
  imageUrl       String?          @map("image_url")
  createdAt      DateTime         @default(now()) @map("created_at")
  conversation   ChatConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId, createdAt])
  @@map("chat_messages")
}
```

## User Flow

1. **Initial Load**: When user opens chat, conversations are fetched (if authenticated)
2. **Create Conversation**: New conversation created via send message
3. **View History**: Click conversation in sidebar to load its messages
4. **Delete Conversation**: Hover over conversation, click delete icon, confirm

## Testing

### Unit Tests
- `src/services/__tests__/chatHistoryService.test.ts` - 8 tests

### Integration Tests
- `backend/src/__tests__/chat.api.test.ts` - API endpoint tests
- `backend/src/__tests__/chat.repository.test.ts` - Database tests

### Running Tests
```bash
# Frontend
npm test -- --testPathPatterns="chatHistoryService"

# Backend
cd backend && npm test
```

## Security Considerations

- Conversations are user-scoped (users can only access their own)
- Ownership verification in backend before any operation
- JWT authentication required for history endpoints

## Future Enhancements

- Search within conversations
- Export conversation as PDF
- Rename conversation title
- Message reactions
