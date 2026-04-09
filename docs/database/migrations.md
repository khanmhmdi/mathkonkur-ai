# Database Migrations

Prisma migration management and procedures.

## Migration Commands

### Generate Prisma Client

```bash
cd backend
npm run db:generate
```

**Purpose**: Generate TypeScript types from schema

**Output**: `node_modules/.prisma/client/index.ts`

### Run Migrations

```bash
cd backend
npm run db:migrate
```

**Purpose**: Apply schema changes to database

**Behavior**:
1. Compare current schema with database
2. Generate migration files if needed
3. Apply pending migrations
4. Update `_prisma_migrations` table

### Create New Migration

```bash
cd backend
npx prisma migrate dev --name migration_name
```

**Purpose**: Create new migration file

**Output**: `prisma/migrations/<timestamp>_migration_name/`

### Seed Database

```bash
cd backend
npm run db:seed
```

**Purpose**: Populate database with initial data

**Source**: `prisma/seed.ts`

### Reset Database

```bash
cd backend
npx prisma migrate reset
```

**Purpose**: Drop all tables and re-run migrations

**Warning**: Destroys all data

## Migration Files Structure

```
backend/prisma/
├── schema.prisma              # Database schema
├── migrations/                # Migration history
│   └── 20240101000000_init/
│       └── migration.sql
└── seed.ts                    # Database seeder
```

### Migration File Example

```sql
-- Create users table
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "level" TEXT NOT NULL DEFAULT 'ریاضی فیزیک',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create index
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
```

## Migration Workflow

### Development

```
1. Modify schema.prisma
2. Run npm run db:migrate
3. Review generated SQL
4. Test application
```

### Production

```
1. Create migration file (npm run db:migrate -- --create-only)
2. Review migration SQL
3. Deploy migration
4. Run migration on production database
```

## Seed Data

**File**: `backend/prisma/seed.ts`

**Purpose**: Initial data population

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample questions
  const question = await prisma.question.create({
    data: {
      questionNumber: 1,
      text: 'سوال نمونه...',
      options: ['گزینه 1', 'گزینه 2', 'گزینه 3', 'گزینه 4'],
      correctAnswer: 0,
      subject: 'جبر و توابع',
      level: 'متوسط',
      explanation: 'توضیح پاسخ...'
    }
  });

  console.log({ question });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

## Migration Best Practices

### Before Modifying Schema

1. **Backup database** if in production
2. **Test migrations** in development
3. **Review generated SQL** before running
4. **Down migrations** should be reversible

### Common Changes

#### Adding a Table

```prisma
model NewTable {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
}
```

#### Adding a Column

```prisma
model User {
  // ... existing fields
  phone     String?  // New optional column
}
```

#### Adding an Index

```prisma
model Question {
  // ... existing fields
  
  @@index([subject, level])
}
```

## Troubleshooting

### Migration Failed

```bash
# Check migration status
npx prisma migrate status

# View failed migration logs
npx prisma migrate deploy --dry-run
```

### Database Out of Sync

```bash
# Reset and re-migrate (development only)
npx prisma migrate reset
```

### Schema Drift

```bash
# Detect drift
npx prisma migrate diff

# Resolve by creating new migration
npx prisma migrate dev
```

## Related Commands

| Command | Purpose |
|---------|---------|
| `npx prisma studio` | Visual database editor |
| `npx prisma validate` | Validate schema syntax |
| `npx prisma format` | Format schema file |
