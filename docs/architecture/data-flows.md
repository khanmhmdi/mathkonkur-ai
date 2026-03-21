# Data Flows

This document describes key runtime data flows through the system.

## Authentication Flow

### User Registration

```
1. User fills registration form
   ↓
2. Frontend: AuthPage.tsx validates input
   ↓
3. Frontend: api.post('/api/auth/register', { email, password, name, level })
   ↓
4. Backend: auth.routes.ts POST /register
   ↓
5. Backend: validate.middleware.ts checks registerSchema (Zod)
   ↓
6. Backend: auth.controller.ts register()
   ↓
7. Backend: auth.service.ts register()
   ├─ bcrypt.hash(password) → passwordHash
   ├─ prisma.user.create() → newUser
   └─ prisma.session.create() → refreshToken
   ↓
8. Backend: Generate JWT access token
   ↓
9. Backend: Set HttpOnly cookie with refresh token
   ↓
10. Backend: Response { success: true, data: { user, accessToken } }
   ↓
11. Frontend: AuthContext.tsx stores accessToken in localStorage
   ↓
12. Frontend: Redirect to authenticated view
```

### User Login

```
1. User submits credentials
   ↓
2. Frontend: api.post('/api/auth/login', { email, password })
   ↓
3. Backend: auth.routes.ts POST /login
   ↓
4. Backend: validate.middleware.ts checks loginSchema (Zod)
   ↓
5. Backend: auth.controller.ts login()
   ↓
6. Backend: auth.service.ts login()
   ├─ prisma.user.findUnique() → user
   ├─ bcrypt.compare(password, user.passwordHash)
   ├─ prisma.session.create() → refreshToken
   └─ jwt.sign() → accessToken
   ↓
7. Backend: Set HttpOnly cookie with refreshToken
   ↓
8. Backend: Response { success: true, data: { user, accessToken } }
   ↓
9. Frontend: Store accessToken in localStorage
   ↓
10. Frontend: Update auth state in AuthContext
```

### Token Refresh

```
1. Frontend detects expired accessToken (401 response)
   ↓
2. Frontend: api.post('/api/auth/refresh') (with cookies)
   ↓
3. Backend: auth.routes.ts POST /refresh
   ↓
4. Backend: auth.controller.ts refresh()
   ↓
5. Backend: auth.service.ts refresh()
   ├─ Read refresh token from HttpOnly cookie
   ├─ prisma.session.findUnique() → session
   ├─ jwt.verify(session.token) → payload
   └─ jwt.sign() → new accessToken
   ↓
6. Backend: Response { success: true, data: { accessToken } }
   ↓
7. Frontend: Retry original request with new token
```

## Chat Flow

### Create Conversation

```
1. User enters initial message and selects subject/level
   ↓
2. Frontend: ChatInterface.tsx validates input
   ↓
3. Frontend: api.post('/api/chat', { initialMessage, subject, level, image? })
   ↓
4. Backend: chat.routes.ts POST /
   ↓
5. Backend: validate.middleware.ts checks createConversationSchema
   ↓
6. Backend: chat.controller.ts createConversation()
   ↓
7. Backend: chat.service.ts createConversation()
   ├─ prisma.chat_conversation.create()
   └─ prisma.chat_message.create() → user message
   ↓
8. Backend: ai.service.ts generateResponse()
   ├─ Build messages array
   ├─ Get system prompt from prompts/tutor.system.ts
   └─ Call GapGPT API with messages
   ↓
9. Backend: ai.service.ts parseMathContent()
   ├─ Extract LaTeX formulas ($...$, $$...$$)
   └─ Return cleanContent + extractedFormulas
   ↓
10. Backend: prisma.chat_message.create() → AI response
    ↓
11. Backend: Response { success: true, data: conversation }
    ↓
12. Frontend: Display conversation in ChatInterface
```

### Send Message

```
1. User types message
   ↓
2. Frontend: api.post('/api/chat/:conversationId/message', { content, image? })
   ↓
3. Backend: chat.routes.ts POST /:conversationId/message
   ↓
4. Backend: chat.controller.ts sendMessage()
   ↓
5. Backend: chat.service.ts sendMessage()
   ├─ prisma.chat_conversation.findUnique() → conversation
   ├─ prisma.chat_message.findMany() → history
   ├─ Build messages array from history
   └─ ai.service.ts generateResponse()
   ↓
6. Backend: ai.service.ts generateResponse()
   ├─ Append user message to messages
   ├─ Call GapGPT API
   └─ Return AI response
   ↓
7. Backend: prisma.chat_message.create() for user + AI messages
   ↓
8. Backend: prisma.chat_conversation.update() → updatedAt
   ↓
9. Backend: Response { success: true, data: { message, response } }
   ↓
10. Frontend: Display messages in chat UI
```

## Question Flow

### List Questions

```
1. User visits question bank page
   ↓
2. Frontend: api.get('/api/questions', { params })
   ↓
3. Backend: question.routes.ts GET /
   ↓
4. Backend: question.controller.ts getQuestions()
   ↓
5. Backend: question.service.ts getQuestions()
   ├─ Build Prisma where clause from filters
   ├─ prisma.question.findMany() with pagination
   └─ Calculate meta (page, limit, total)
   ↓
6. Backend: Response { success: true, data: questions, meta }
   ↓
7. Frontend: QuestionBank.tsx renders question cards
```

### Submit Answer

```
1. User selects answer option
   ↓
2. Frontend: api.post('/api/questions/:id/submit', { answerIndex, timeSpent })
   ↓
3. Backend: question.routes.ts POST /:id/submit
   ↓
4. Backend: question.controller.ts submitAnswer()
   ↓
5. Backend: question.service.ts submitAnswer()
   ├─ prisma.question.findUnique() → question
   ├─ Check answerIndex === question.correctAnswer
   ├─ prisma.user_progress.upsert()
   │  └─ Update masteryLevel using SM-2 algorithm
   └─ prisma.question.update() → increment attemptCount/correctCount
   ↓
6. Backend: Response { success: true, data: { correct, explanation } }
   ↓
7. Frontend: Show result (correct/incorrect) + explanation
```

## Favorites Flow

### Add Favorite

```
1. User clicks "Add to favorites"
   ↓
2. Frontend: api.post('/api/favorites', { questionId, notes? })
   ↓
3. Backend: favorite.routes.ts POST /
   ↓
4. Backend: favorite.controller.ts addFavorite()
   ↓
5. Backend: favorite.service.ts addFavorite()
   └─ prisma.user_favorite.create()
   ↓
6. Backend: Response { success: true, data: favorite }
   ↓
7. Frontend: Update favorites list
```

## Error Flow

```
1. Error occurs in backend
   ↓
2. Error caught by error.middleware.ts
   ↓
3. error.middleware.ts formats error
   ├─ Map to appropriate HTTP status code
   └─ Add error code and message
   ↓
4. Backend: Response { success: false, error: { code, message, details } }
   ↓
5. Frontend: api.ts getErrorMessage()
   ├─ Check error.response.data.error.code
   └─ Map to Persian error message
   ↓
6. Frontend: Display error to user
```

## Data Transformation Points

| Flow | Transformations |
|------|-----------------|
| Auth | Password → bcrypt hash, Plain tokens → JWT |
| Chat | User text → messages array, AI response → parsed LaTeX |
| Questions | DB model → API response, Answer → SM-2 calculation |
| Validation | Raw input → Zod schema → typed object |
| Error | Exception → Error class → standardized response |
