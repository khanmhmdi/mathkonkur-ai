# Backend Services

Business logic layer implementing core functionality.

## Service Architecture

Services are located in `backend/src/services/` and contain all business logic.

```
backend/src/services/
├── ai.service.ts          # GapGPT API integration
├── auth.service.ts        # Authentication operations
├── chat.service.ts        # Chat conversation logic
├── question.service.ts    # Question bank operations
└── progress.service.ts     # Spaced repetition (SM-2)
```

## AI Service (`ai.service.ts`)

**File**: `backend/src/services/ai.service.ts`

**Purpose**: Integration with GapGPT API for math tutoring responses.

### Key Methods

#### `generateResponse(messages, subject, level, image?)`

Generates AI response for chat messages.

**Parameters**:
```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ImageData {
  data: string;  // base64
  mimeType: string;  // 'image/jpeg' | 'image/png' | 'image/webp'
}

generateResponse(
  messages: Message[],
  subject: string,
  level: string,
  image?: ImageData
): Promise<AIResponse>
```

**Returns**:
```typescript
interface AIResponse {
  content: string;           // AI response text
  tokensUsed: number;         // Token count
  modelVersion: string;       // 'gapgpt-qwen-3.5'
  processingTimeMs: number;   // Processing time
}
```

**Implementation Details**:
- Uses OpenAI client with GapGPT base URL
- System prompt from `prompts/tutor.system.ts`
- Exponential backoff (3 attempts, 1s, 2s delays)
- 30-second timeout via AbortController
- Persian language validation

#### `parseMathContent(rawResponse)`

Extracts LaTeX formulas from AI response.

**Parameters**: `rawResponse: string`

**Returns**:
```typescript
interface ParsedMathContent {
  cleanContent: string;       // Text with formula placeholders
  extractedFormulas: string[]; // Array of LaTeX formulas
}
```

**LaTeX Patterns**:
- Inline: `$...$`
- Display: `$$...$$`

## Auth Service (`auth.service.ts`)

**File**: `backend/src/services/auth.service.ts`

**Purpose**: Authentication and session management.

### Key Methods

#### `register(email, password, name?, level)`

Creates new user account.

**Parameters**:
```typescript
register(
  email: string,
  password: string,
  name?: string,
  level?: string
): Promise<{ user: User; accessToken: string }>
```

**Operations**:
1. Hash password with bcrypt (cost factor 10)
2. Create user in database
3. Create session for refresh token
4. Generate JWT access token
5. Return user + token

#### `login(email, password)`

Authenticates user credentials.

**Parameters**: `email: string, password: string`

**Returns**: `{ user: User; accessToken: string }`

**Operations**:
1. Find user by email
2. Compare password with bcrypt
3. Create session with refresh token
4. Generate JWT access token
5. Return user + token

#### `refresh(refreshToken)`

Refresh access token using refresh token.

**Parameters**: `refreshToken: string`

**Returns**: `{ accessToken: string }`

**Operations**:
1. Lookup session by token
2. Verify session not expired
3. Generate new access token
4. Return new token

#### `logout(refreshToken)`

Invalidates session.

**Operations**:
1. Delete session from database

## Chat Service (`chat.service.ts`)

**File**: `backend/src/services/chat.service.ts`

**Purpose**: Chat conversation management.

### Key Methods

#### `createConversation(userId, initialMessage, subject, level, image?)`

Creates new conversation with initial message.

**Parameters**:
```typescript
createConversation(
  userId: string,
  initialMessage: string,
  subject: string,
  level: string,
  image?: ImageData
): Promise<Conversation>
```

**Operations**:
1. Create chat_conversation record
2. Create initial user message
3. Call ai.service.generateResponse()
4. Create assistant message with AI response
5. Return conversation with messages

#### `sendMessage(conversationId, content, image?)`

Adds message to conversation and gets AI response.

**Operations**:
1. Find conversation
2. Get message history
3. Build messages array
4. Call ai.service.generateResponse()
5. Create user and assistant messages
6. Update conversation timestamp
7. Return new messages

#### `getConversations(userId, page, limit)`

Lists user's conversations.

**Operations**:
1. Query chat_conversations for user
2. Order by updatedAt desc
3. Paginate results
4. Return with metadata

#### `getHistory(conversationId)`

Gets conversation message history.

**Operations**:
1. Find conversation
2. Verify user ownership
3. Get all messages ordered by createdAt
4. Return conversation + messages

#### `deleteConversation(conversationId, userId)`

Deletes conversation and all messages.

**Operations**:
1. Verify user ownership
2. Delete conversation (cascades to messages)
3. Return success

> **Chat History Feature**: The chat service powers the chat history sidebar in the frontend. See [Frontend Chat History Documentation](../frontend/chat-history.md) for UI implementation details.

## Question Service (`question.service.ts`)

**File**: `backend/src/services/question.service.ts`

**Purpose**: Question bank operations.

### Key Methods

#### `getQuestions(filters, pagination)`

Lists questions with filters.

**Parameters**:
```typescript
getQuestions(
  filters: {
    subject?: string;
    level?: string;
    topic?: string;
    examYear?: string;
    isVerified?: boolean;
  },
  pagination: { page: number; limit: number }
): Promise<{ questions: Question[]; meta: Meta }>
```

**Operations**:
1. Build Prisma where clause from filters
2. Execute findMany with pagination
3. Calculate total pages
4. Return results

#### `searchQuestions(query, filters, pagination)`

Full-text search for questions.

**Operations**:
1. Use Prisma full-text search on text/explanation fields
2. Apply additional filters
3. Return matching questions

#### `getQuestionById(id)`

Gets single question by ID.

**Operations**:
1. Find question by UUID
2. Return question data

#### `submitAnswer(questionId, userId, answerIndex, timeSpent)`

Submits answer and calculates result.

**Parameters**:
```typescript
submitAnswer(
  questionId: string,
  userId: string,
  answerIndex: number,
  timeSpentSeconds?: number
): Promise<{
  correct: boolean;
  correctAnswer: number;
  explanation: string;
  progress: UserProgress;
}>
```

**Operations**:
1. Find question
2. Compare answerIndex with correctAnswer
3. Upsert user_progress with SM-2 algorithm
4. Update question attempt/correct counts
5. Return result + explanation

## Progress Service (`progress.service.ts`)

**File**: `backend/src/services/progress.service.ts`

**Purpose**: Spaced Repetition System (SM-2) implementation.

### Key Methods

#### `calculateNextReview(isCorrect, currentProgress)`

Calculates next review date using SM-2 algorithm.

**Parameters**:
```typescript
calculateNextReview(
  isCorrect: boolean,
  currentProgress: {
    masteryLevel: number;
    srsInterval: number;
    srsEaseFactor: number;
    srsRepetitions: number;
  }
): {
  masteryLevel: number;
  srsInterval: number;
  srsEaseFactor: number;
  srsRepetitions: number;
  nextReviewAt: Date;
}
```

**SM-2 Algorithm**:
1. If correct:
   - If first correct: interval = 1 day
   - If repeated: interval = previous_interval * ease_factor
   - Increment repetitions
2. If incorrect:
   - repetitions = 0
   - interval = 1 day
   - Reduce ease_factor (min 1.3)
3. Update masteryLevel based on performance

#### `getReviewQueue(userId, limit)`

Gets questions due for review.

**Operations**:
1. Query user_progress where nextReviewAt <= now
2. Order by nextReviewAt
3. Return limited results

#### `updateProgress(userId, questionId, updates)`

Updates progress record.

**Operations**:
1. Find existing progress or create new
2. Apply updates (attempts, time, etc.)
3. Save and return
