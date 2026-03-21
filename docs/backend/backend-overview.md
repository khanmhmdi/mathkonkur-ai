# Backend Overview

The MathKonkur AI backend is a REST API built with Express and TypeScript, providing authentication, chat, question management, and AI integration.

## Key Directories

```
backend/src/
├── config/          # Configuration (env, database, logger)
├── controllers/     # Request handlers
├── middleware/      # Express middleware (auth, validation, errors)
├── repositories/    # Data access layer
├── routes/          # API route definitions
├── services/        # Business logic
├── utils/           # Utilities (errors, jwt, helpers)
├── prompts/         # AI system prompts
├── app.ts           # Express app configuration
└── server.ts        # Server entry point
```

## Important Files

| File | Purpose |
|------|---------|
| `server.ts` | HTTP server creation, graceful shutdown, database connection |
| `app.ts` | Express middleware setup, route mounting |
| `config/env.ts` | Environment variable validation with Zod |
| `config/database.ts` | Prisma client singleton |
| `config/logger.ts` | Pino logger configuration |

## Internal Architecture

### Request Flow

```
HTTP Request → server.ts (createServer)
            → app.ts (middleware chain)
            → routes/*.routes.ts (route matching)
            → controllers/*.controller.ts (request handling)
            → services/*.service.ts (business logic)
            → repositories/* (database operations)
            → Response
```

### Layer Responsibilities

| Layer | Responsibility |
|-------|----------------|
| **Routes** | URL matching, validation schema selection |
| **Controllers** | Request parsing, response formatting, service orchestration |
| **Services** | Business logic, external service calls |
| **Repositories** | Database query abstraction |
| **Middleware** | Auth, validation, error handling |

## Key Workflows

### API Request Handling

1. Request arrives at `server.ts`
2. `app.ts` middleware processes request (CORS, JSON, cookies)
3. Route matching in `routes/*.routes.ts`
4. Validation via `validate.middleware.ts` (Zod schema)
5. Authentication via `auth.middleware.ts` (JWT)
6. Controller handles request
7. Service executes business logic
8. Repository accesses database
9. Response formatted and sent

### Error Handling Flow

```
Exception thrown
    ↓
Catch in controller/service
    ↓
Create AppError instance
    ↓
Pass to next(err)
    ↓
error.middleware.ts
    ├─ Log error
    ├─ Map to HTTP status code
    └─ Send standardized response
```

## Dependencies

### External Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | 4.21.2 | Web framework |
| `@prisma/client` | 6.4.1 | Database ORM |
| `bcrypt` | 5.1.1 | Password hashing |
| `jsonwebtoken` | 9.0.2 | JWT tokens |
| `zod` | 3.24.2 | Validation |
| `cors` | 2.8.5 | CORS middleware |
| `helmet` | 8.0.0 | Security headers |
| `cookie-parser` | 1.4.7 | Cookie parsing |
| `pino` | 9.6.0 | Logging |
| `openai` | 4.52.0 | AI API client |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | 5.7.3 | TypeScript compiler |
| `nodemon` | 3.1.9 | Development hot reload |
| `prisma` | 6.4.1 | Database migrations |
| `jest` | 29.7.0 | Testing framework |

## Configuration

### Environment Variables

All configuration is loaded via `backend/src/config/env.ts`:

```typescript
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number).default('4000'),
  DATABASE_URL: z.string().startsWith('postgresql://'),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  GAPGPT_API_KEY: z.string().min(1),
  FRONTEND_URL: z.string().url(),
});
```

### Database Connection

Prisma client is initialized as a singleton in `backend/src/config/database.ts`:

```typescript
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? [{ emit: 'event', level: 'query' }] : []
});
```

## Startup Sequence

1. Load environment variables via `dotenv.config()`
2. Validate environment with Zod schema
3. Create Prisma client
4. Connect to database (`prisma.$connect()`)
5. Create HTTP server (`createServer(app)`)
6. Setup graceful shutdown handlers (SIGTERM, SIGINT)
7. Start listening on `env.PORT` (default 4000)

## Development Commands

```bash
# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production
npm run start

# Database operations
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database

# Testing
npm run test
```

## Related Documentation

- API routes: `docs/backend/api.md`
- Services: `docs/backend/services.md`
- Middleware: `docs/backend/middleware.md`
- Authentication: `docs/backend/auth.md`
- AI integration: `docs/backend/ai-integration.md`
