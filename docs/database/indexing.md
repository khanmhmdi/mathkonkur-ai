# Database Indexing

Query optimization through database indexes.

## Index Overview

Indexes are defined in Prisma schema using `@@index` and `@@unique` attributes.

## Index Location

**File**: `backend/prisma/schema.prisma`

## Index Definitions

### User Table

```prisma
model User {
  // ... fields
  
  @@index([email])
  @@map("users")
}
```

**Index**: `users_email_idx`

**Purpose**: Fast lookups by email (login, uniqueness check)

**Query Pattern**:
```sql
SELECT * FROM users WHERE email = 'user@example.com';
```

### Session Table

```prisma
model Session {
  // ... fields
  
  @@index([userId])
  @@map("sessions")
}
```

**Index**: `sessions_user_id_idx`

**Purpose**: Fast lookup of user's sessions

**Query Pattern**:
```sql
SELECT * FROM sessions WHERE user_id = 'uuid';
```

### ChatConversation Table

```prisma
model ChatConversation {
  // ... fields
  
  @@index([userId, updatedAt])
  @@map("chat_conversations")
}
```

**Index**: `chat_conversations_user_id_updated_at_idx`

**Purpose**: Fast retrieval of user's conversations ordered by recent activity

**Query Pattern**:
```sql
SELECT * FROM chat_conversations 
WHERE user_id = 'uuid' 
ORDER BY updated_at DESC;
```

### ChatMessage Table

```prisma
model ChatMessage {
  // ... fields
  
  @@index([conversationId, createdAt])
  @@map("chat_messages")
}
```

**Index**: `chat_messages_conversation_id_created_at_idx`

**Purpose**: Fast retrieval of conversation history in order

**Query Pattern**:
```sql
SELECT * FROM chat_messages 
WHERE conversation_id = 'uuid' 
ORDER BY created_at ASC;
```

### Question Table

```prisma
model Question {
  // ... fields
  
  @@index([subject, level])
  @@index([examYear])
  @@index([topic])
  @@map("questions")
}
```

**Indexes**:
- `questions_subject_level_idx` - Filter by subject and level
- `questions_exam_year_idx` - Filter by exam year
- `questions_topic_idx` - Filter by topic

**Query Patterns**:
```sql
-- Filter by subject and level
SELECT * FROM questions WHERE subject = 'جبر و توابع' AND level = 'متوسط';

-- Filter by exam year
SELECT * FROM questions WHERE exam_year = 1402;

-- Filter by topic
SELECT * FROM questions WHERE topic = 'معادلات';
```

### UserFavorite Table

```prisma
model UserFavorite {
  // ... fields
  
  @@unique([userId, questionId])
  @@index([userId, createdAt])
  @@map("user_favorites")
}
```

**Indexes**:
- `user_favorites_user_id_question_id_key` - Unique constraint
- `user_favorites_user_id_created_at_idx` - List user's favorites

**Query Patterns**:
```sql
-- Check if favorite exists
SELECT * FROM user_favorites 
WHERE user_id = 'uuid' AND question_id = 'uuid';

-- List user's favorites
SELECT * FROM user_favorites 
WHERE user_id = 'uuid' 
ORDER BY created_at DESC;
```

### UserProgress Table

```prisma
model UserProgress {
  // ... fields
  
  @@unique([userId, questionId])
  @@index([userId, nextReviewAt])
  @@index([userId, masteryLevel])
  @@map("user_progress")
}
```

**Indexes**:
- `user_progress_user_id_question_id_key` - Unique constraint
- `user_progress_user_id_next_review_at_idx` - SRS review queue
- `user_progress_user_id_mastery_level_idx` - Mastery sorting

**Query Patterns**:
```sql
-- Get user's progress for a question
SELECT * FROM user_progress 
WHERE user_id = 'uuid' AND question_id = 'uuid';

-- Get questions due for review
SELECT * FROM user_progress 
WHERE user_id = 'uuid' AND next_review_at <= NOW()
ORDER BY next_review_at ASC;

-- Get questions by mastery level
SELECT * FROM user_progress 
WHERE user_id = 'uuid' 
ORDER BY mastery_level DESC;
```

## Full-Text Search

**Feature**: `fullTextSearchPostgres` preview feature

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearchPostgres"]
}
```

**Usage**:
```typescript
prisma.question.findMany({
  where: {
    OR: [
      { text: { search: 'search terms' } },
      { explanation: { search: 'search terms' } }
    ]
  }
});
```

## Index Performance

### Covered Queries

| Table | Index | Query Type |
|-------|-------|------------|
| users | email_idx | Point lookup |
| sessions | userId_idx | List user's sessions |
| chat_conversations | userId_updatedAt_idx | List + sort |
| chat_messages | conversationId_createdAt_idx | List + sort |
| questions | subject_level_idx | Filter |
| questions | examYear_idx | Filter |
| questions | topic_idx | Filter |
| user_favorites | userId_createdAt_idx | List |
| user_progress | userId_nextReviewAt_idx | SRS queue |
| user_progress | userId_masteryLevel_idx | Sort |

### Composite Indexes

| Index | Columns | Use Case |
|-------|---------|----------|
| `userId_updatedAt` | user_id, updated_at | List conversations sorted by recent |
| `userId_createdAt` | user_id, created_at | List favorites sorted by recent |
| `userId_nextReviewAt` | user_id, next_review_at | Get SRS review queue |
| `userId_masteryLevel` | user_id, mastery_level | Sort by mastery |

## Query Optimization Tips

### Use Select for Required Fields

```typescript
// Instead of
const questions = await prisma.question.findMany();

// Use
const questions = await prisma.question.findMany({
  select: { id, text, subject, level }
});
```

### Use Pagination

```typescript
const questions = await prisma.question.findMany({
  take: 20,    // Limit
  skip: 40,    // Offset for page
  orderBy: { createdAt: 'desc' }
});
```

### Use Where Clauses for Filtering

```typescript
// Instead of filtering in JS
const filtered = questions.filter(q => q.level === 'متوسط');

// Use database filtering
const questions = await prisma.question.findMany({
  where: { level: 'متوسط' }
});
```
