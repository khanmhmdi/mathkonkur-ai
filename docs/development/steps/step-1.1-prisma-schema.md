# Step 1.1: Prisma Database Schema

This document details the Prisma schema created for the MathKonkur AI project.

## Complete Schema Code

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearchPostgres"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String             @id @default(uuid())
  email         String             @unique
  passwordHash  String             @map("password_hash")
  name          String?
  level         String             @default("ریاضی فیزیک")
  createdAt     DateTime           @default(now()) @map("created_at")
  updatedAt     DateTime           @updatedAt @map("updated_at")
  sessions      Session[]
  conversations ChatConversation[]

  @@index([email])
  @@map("users")
}

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

model ChatMessage {
  id             String           @id @default(uuid())
  conversationId String           @map("conversation_id")
  role           String
  content        String
  createdAt      DateTime         @default(now()) @map("created_at")
  conversation   ChatConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId, createdAt])
  @@map("chat_messages")
}

```

## Design Decisions

### Cascade Deletes

All foreign key relations (`Session.userId`, `ChatConversation.userId`, `ChatMessage.conversationId`) are configured with `onDelete: Cascade`.
This ensures that when a parent record is deleted (e.g., a `User`), all associated child records (their `Sessions` and `ChatConversations`, and consequently all `ChatMessages`) are automatically deleted by the database. This prevents orphaned records and maintains referential integrity without requiring complex application-level cleanup logic.

### Indexes

- **`@@index([email])` on `User`**: (Auto-created by `@unique`, explicit definition added for clarity if needed, though `@unique` suffices in Prisma. Kept explicit for documentation purposes based on requirements). Faster lookups during authentication.

- **`@@index([userId])` on `Session`**: Optimizes querying all active sessions for a specific user.

- **`@@index([userId, updatedAt])` on `ChatConversation`**: Optimizes loading a user's conversation history, sorted by the most recently updated conversations.

- **`@@index([conversationId, createdAt])` on `ChatMessage`**: Optimizes fetching messages for a specific conversation, ordered chronologically.
