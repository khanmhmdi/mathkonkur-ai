# Database Schema

Complete database schema documentation for MathKonkur AI.

## Schema Location

**File**: `backend/prisma/schema.prisma`

## Model Overview

| Model | Purpose | Records |
|-------|---------|---------|
| `User` | User accounts | One per registered user |
| `Session` | Refresh token sessions | One per login session |
| `ChatConversation` | Chat threads | One per conversation |
| `ChatMessage` | Individual messages | Many per conversation |
| `Question` | Question bank entries | One per question |
| `UserFavorite` | User bookmarks | Many per user |
| `UserProgress` | SRS tracking | One per user-question |

## User Model

```prisma
model User {
  id            String             @id @default(uuid())
  email         String             @unique
  passwordHash  String             @map("password_hash")
  name          String?
  level         String             @default("ریاضی فیزیک")
  promptCount   Int                @default(0) @map("prompt_count")
  createdAt     DateTime           @default(now()) @map("created_at")
  updatedAt     DateTime           @updatedAt @map("updated_at")
  lastLoginAt   DateTime?          @map("last_login_at")
  sessions      Session[]
  conversations ChatConversation[]
  favorites     UserFavorite[]
  progress      UserProgress[]

  @@index([email])
  @@map("users")
}
```

### Fields

| Field | Type | Constraint | Description |
|-------|------|------------|-------------|
| `id` | UUID | @id @default(uuid()) | Primary key |
| `email` | String | @unique | Unique email address |
| `passwordHash` | String | @map("password_hash") | bcrypt hash |
| `name` | String? | optional | Display name |
| `level` | String | default "ریاضی فیزیک" | Education track |
| `promptCount` | Int | @default(0) | Visitor chat prompt count (for limiting non-authenticated users) |
| `createdAt` | DateTime | @default(now()) | Registration date |
| `updatedAt` | DateTime | @updatedAt | Last update |
| `lastLoginAt` | DateTime? | optional | Last login time |

### Relationships

- `sessions` - One-to-many with Session
- `conversations` - One-to-many with ChatConversation
- `favorites` - One-to-many with UserFavorite
- `progress` - One-to-many with UserProgress

## Session Model

```prisma
model Session {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("sessions")
}
```

### Fields

| Field | Type | Constraint | Description |
|-------|------|------------|-------------|
| `id` | UUID | @id @default(uuid()) | Primary key |
| `userId` | UUID | @map("user_id") | Foreign key to User |
| `token` | String | @unique | JWT refresh token |
| `expiresAt` | DateTime | - | Token expiration |
| `createdAt` | DateTime | @default(now()) | Session creation |

### Relationships

- `user` - Many-to-one with User (onDelete: Cascade)

## ChatConversation Model

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

### Fields

| Field | Type | Constraint | Description |
|-------|------|------------|-------------|
| `id` | UUID | @id @default(uuid()) | Primary key |
| `userId` | UUID | @map("user_id") | Foreign key to User |
| `title` | String? | optional | Conversation title |
| `subject` | String | - | Math subject |
| `level` | String | - | Education level |
| `createdAt` | DateTime | @default(now()) | Creation time |
| `updatedAt` | DateTime | @updatedAt | Last activity |

### Relationships

- `user` - Many-to-one with User (onDelete: Cascade)
- `messages` - One-to-many with ChatMessage

## ChatMessage Model

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

### Fields

| Field | Type | Constraint | Description |
|-------|------|------------|-------------|
| `id` | UUID | @id @default(uuid()) | Primary key |
| `conversationId` | UUID | @map("conversation_id") | Foreign key to ChatConversation |
| `role` | String | - | 'user' or 'assistant' |
| `content` | String | - | Message text |
| `imageUrl` | String? | @map("image_url") | Optional image URL for messages |
| `createdAt` | DateTime | @default(now()) | Message time |

### Relationships

- `conversation` - Many-to-one with ChatConversation (onDelete: Cascade)

### Chat History Feature

The ChatMessage model is used by the chat history feature to store conversation messages. The `imageUrl` field was added to support image attachments in messages. See [Frontend Chat History Documentation](../frontend/chat-history.md) for more details.

## Question Model

```prisma
model Question {
  id             String   @id @default(uuid())
  questionNumber Int      @unique @map("question_number")

  // Content
  text           String   @db.Text
  textTeX        String?  @map("text_tex")
  options        Json
  correctAnswer  Int      @map("correct_answer")

  // Classification
  subject        String
  topic          String   @default("عمومی")
  level          String
  examYear       Int?     @map("exam_year")

  // Media
  imageUrl       String?  @map("image_url")
  diagramData    Json?    @map("diagram_data")

  // Solution
  explanation    String   @db.Text
  explanationTeX String?  @map("explanation_tex")
  solutionSteps  Json?    @map("solution_steps")

  // AI-enhanced metadata
  aiHints        String[] @default([]) @map("ai_hints")
  commonMistakes String[] @default([]) @map("common_mistakes")
  keyConcepts    String[] @default([]) @map("key_concepts")

  // Stats
  attemptCount   Int      @default(0) @map("attempt_count")
  correctCount   Int      @default(0) @map("correct_count")
  correctRate    Float?   @map("correct_rate")

  // Metadata
  isVerified     Boolean  @default(true) @map("is_verified")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  // Relations
  favorites      UserFavorite[]
  progress       UserProgress[]

  @@index([subject, level])
  @@index([examYear])
  @@index([topic])
  @@map("questions")
}
```

### Fields

| Field | Type | Constraint | Description |
|-------|------|------------|-------------|
| `id` | UUID | @id @default(uuid()) | Primary key |
| `questionNumber` | Int | @unique | Unique sequential number |
| `text` | String | @db.Text | Question text |
| `textTeX` | String? | optional | LaTeX version of text |
| `options` | Json | - | Array of 4 options |
| `correctAnswer` | Int | - | Index 0-3 |
| `subject` | String | - | Math subject |
| `topic` | String | default "عمومی" | Specific topic |
| `level` | String | - | Difficulty level |
| `examYear` | Int? | optional | Konkur year |
| `imageUrl` | String? | optional | Question image |
| `diagramData` | Json? | optional | Diagram info |
| `explanation` | String | @db.Text | Full explanation |
| `explanationTeX` | String? | optional | LaTeX explanation |
| `solutionSteps` | Json? | optional | Step-by-step solution |
| `aiHints` | String[] | default [] | AI-generated hints |
| `commonMistakes` | String[] | default [] | Common errors |
| `keyConcepts` | String[] | default [] | Key concepts |
| `attemptCount` | Int | default 0 | Total attempts |
| `correctCount` | Int | default 0 | Correct attempts |
| `correctRate` | Float? | optional | Calculated rate |
| `isVerified` | Boolean | default true | Verified status |

### Relationships

- `favorites` - One-to-many with UserFavorite
- `progress` - One-to-many with UserProgress

## UserFavorite Model

```prisma
model UserFavorite {
  id         String   @id @default(uuid())
  userId     String   @map("user_id")
  questionId String   @map("question_id")
  createdAt  DateTime @default(now()) @map("created_at")
  notes      String?  @db.Text

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([userId, questionId])
  @@index([userId, createdAt])
  @@map("user_favorites")
}
```

### Fields

| Field | Type | Constraint | Description |
|-------|------|------------|-------------|
| `id` | UUID | @id @default(uuid()) | Primary key |
| `userId` | UUID | @map("user_id") | Foreign key to User |
| `questionId` | UUID | @map("question_id") | Foreign key to Question |
| `createdAt` | DateTime | @default(now()) | Created time |
| `notes` | String? | optional @db.Text | User notes |

### Relationships

- `user` - Many-to-one with User (onDelete: Cascade)
- `question` - Many-to-one with Question (onDelete: Cascade)

### Constraints

- `@@unique([userId, questionId])` - One favorite per user-question

## UserProgress Model

```prisma
model UserProgress {
  id              String    @id @default(uuid())
  userId          String    @map("user_id")
  questionId      String    @map("question_id")

  // Attempt tracking
  attempts        Int       @default(0)
  correctAttempts Int       @default(0) @map("correct_attempts")
  lastAnswer      Int?      @map("last_answer")
  isCorrect       Boolean?  @map("is_correct")

  // Time tracking
  timeSpentSeconds  Int       @default(0) @map("time_spent_seconds")
  firstAttemptAt    DateTime? @map("first_attempt_at")
  lastAttemptAt     DateTime? @map("last_attempt_at")

  // Spaced Repetition System (SM-2)
  masteryLevel    Float     @default(0) @map("mastery_level")
  srsInterval     Int       @default(1) @map("srs_interval")
  srsEaseFactor   Float     @default(2.5) @map("srs_ease_factor")
  srsRepetitions  Int       @default(0) @map("srs_repetitions")
  nextReviewAt    DateTime? @map("next_review_at")

  // Streak
  currentStreak   Int       @default(0) @map("current_streak")
  maxStreak       Int       @default(0) @map("max_streak")

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([userId, questionId])
  @@index([userId, nextReviewAt])
  @@index([userId, masteryLevel])
  @@map("user_progress")
}
```

### Fields

| Field | Type | Constraint | Description |
|-------|------|------------|-------------|
| `id` | UUID | @id @default(uuid()) | Primary key |
| `userId` | UUID | @map("user_id") | Foreign key to User |
| `questionId` | UUID | @map("question_id") | Foreign key to Question |
| `attempts` | Int | default 0 | Total attempts |
| `correctAttempts` | Int | default 0 | Correct attempts |
| `lastAnswer` | Int? | optional | Last answer index |
| `isCorrect` | Boolean? | optional | Last answer correct |
| `timeSpentSeconds` | Int | default 0 | Total time spent |
| `firstAttemptAt` | DateTime? | optional | First attempt time |
| `lastAttemptAt` | DateTime? | optional | Last attempt time |
| `masteryLevel` | Float | default 0 | 0.0 - 1.0 |
| `srsInterval` | Int | default 1 | Days until next review |
| `srsEaseFactor` | Float | default 2.5 | SM-2 ease factor |
| `srsRepetitions` | Int | default 0 | Consecutive correct |
| `nextReviewAt` | DateTime? | optional | Next review date |
| `currentStreak` | Int | default 0 | Current streak |
| `maxStreak` | Int | default 0 | Max streak |

### Relationships

- `user` - Many-to-one with User (onDelete: Cascade)
- `question` - Many-to-one with Question (onDelete: Cascade)

### Constraints

- `@@unique([userId, questionId])` - One progress record per user-question
