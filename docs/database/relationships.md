# Database Relationships

Entity relationship diagram and connection details.

## ER Diagram

```
┌─────────────┐       ┌─────────────┐
│    User     │       │   Session   │
├─────────────┤       ├─────────────┤
│ id          │◄──────│ userId      │
│ email       │       │ token       │
│ passwordHash│       │ expiresAt   │
│ name        │       └─────────────┘
│ level       │
└──────┬──────┘
       │
       │ 1:N
       ▼
┌───────────────────┐       ┌───────────────────┐
│ ChatConversation  │       │   UserFavorite    │
├───────────────────┤       ├───────────────────┤
│ id                │       │ id                │
│ userId            │◄──────│ userId            │
│ subject           │       │ questionId        │
│ level             │       │ notes             │
│ title             │       └────────┬──────────┘
└─────────┬─────────┘              │
          │ 1:N                    │ 1:1 (per user-question)
          ▼                        ▼
┌───────────────────┐       ┌───────────────────┐
│   ChatMessage     │       │   Question        │
├───────────────────┤       ├───────────────────┤
│ id                │       │ id                │
│ conversationId    │◄──────│ questionNumber    │
│ role              │       │ text              │
│ content           │       │ options           │
│ createdAt         │       │ correctAnswer     │
└───────────────────┘       │ subject           │
                            │ level             │
                            │ examYear          │
                            │ explanation       │
                            └─────────┬─────────┘
                                      │
                                      │ 1:N
                                      ▼
                            ┌───────────────────┐
                            │  UserProgress     │
                            ├───────────────────┤
                            │ id                │
                            │ userId            │◄────┐
                            │ questionId        │◄────┤
                            │ masteryLevel      │     │
                            │ srsInterval       │     │
                            │ srsEaseFactor     │     │
                            │ nextReviewAt      │     │
                            │ attempts          │     │
                            │ correctAttempts   │     │
                            └───────────────────┘     │
                                                    │
                                    (unique per user-question)
```

## Relationship Types

### One-to-Many (1:N)

| Parent | Child | Foreign Key | Cascade Delete |
|--------|-------|-------------|----------------|
| User | Session | userId | Yes |
| User | ChatConversation | userId | Yes |
| User | UserFavorite | userId | Yes |
| User | UserProgress | userId | Yes |
| ChatConversation | ChatMessage | conversationId | Yes |
| Question | UserFavorite | questionId | Yes |
| Question | UserProgress | questionId | Yes |

### One-to-One (1:1)

| Table | Constraint | Description |
|-------|------------|-------------|
| UserFavorite | `@@unique([userId, questionId])` | One favorite per user-question |
| UserProgress | `@@unique([userId, questionId])` | One progress per user-question |

## Relationship Details

### User → Session

```
User (1) ──────► Session (N)

- One user can have multiple sessions (multiple devices)
- Each session contains one refresh token
- Deleting user cascades to delete all sessions
```

### User → ChatConversation

```
User (1) ──────► ChatConversation (N)

- One user can have multiple chat conversations
- Each conversation has one subject and level
- Deleting user cascades to delete all conversations
```

### ChatConversation → ChatMessage

```
ChatConversation (1) ──────► ChatMessage (N)

- One conversation contains many messages
- Messages ordered by createdAt
- Deleting conversation cascades to delete all messages
```

### User → Question (via UserFavorite)

```
User (1) ──────► UserFavorite (1) ◄───── (1) Question
```

- Junction table for many-to-many relationship
- Unique constraint ensures one favorite per pair

### User → Question (via UserProgress)

```
User (1) ──────► UserProgress (1) ◄───── (1) Question
```

- Junction table for many-to-many relationship
- Unique constraint ensures one progress record per pair
- Contains SRS data (masteryLevel, srsInterval, etc.)

## Cardinality Summary

| Relationship | Type | Description |
|--------------|------|-------------|
| User : Session | 1:N | User can have many sessions |
| User : ChatConversation | 1:N | User can have many chats |
| ChatConversation : ChatMessage | 1:N | Chat can have many messages |
| UserFavorite : User | N:1 | Favorite belongs to one user |
| UserFavorite : Question | N:1 | Favorite belongs to one question |
| UserProgress : User | N:1 | Progress belongs to one user |
| UserProgress : Question | N:1 | Progress belongs to one question |

## Foreign Key Constraints

```prisma
// Session -> User
user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

// ChatConversation -> User
user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

// ChatMessage -> ChatConversation
conversation   ChatConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

// UserFavorite -> User & Question
user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

// UserProgress -> User & Question
user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
```

## Cascade Behavior

**Delete Cascade**: All child records are deleted when parent is deleted.

Examples:
- Delete user → Delete all sessions, conversations, favorites, progress
- Delete conversation → Delete all messages
- Delete question → Delete all favorites and progress

**Update Cascade**: Not configured - updating parent ID would fail.

## Junction Tables

### UserFavorite (Junction)

```
┌─────────────────────────────────────┐
│ UserFavorite                        │
├─────────────────────────────────────┤
│ id         UUID (PK)                 │
│ userId     UUID (FK -> User)        │
│ questionId UUID (FK -> Question)    │
│ createdAt  DateTime                 │
│ notes      String?                  │
├─────────────────────────────────────┤
│ @@unique([userId, questionId])      │
└─────────────────────────────────────┘
```

### UserProgress (Junction)

```
┌─────────────────────────────────────┐
│ UserProgress                        │
├─────────────────────────────────────┤
│ id              UUID (PK)          │
│ userId          UUID (FK -> User)  │
│ questionId      UUID (FK -> Question)│
│ masteryLevel    Float              │
│ srsInterval     Int                │
│ srsEaseFactor   Float              │
│ attempts        Int                │
│ correctAttempts Int                │
│ ...                                 │
├─────────────────────────────────────┤
│ @@unique([userId, questionId])      │
└─────────────────────────────────────┘
```
