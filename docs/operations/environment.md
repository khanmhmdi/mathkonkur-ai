# Environment Configuration

Environment setup and configuration for MathKonkur AI.

## Environment Files

### Root Level (.env.example)

**Location**: `.env.example`

```bash
# VITE_GAPGPT_API_KEY: Required for GapGPT AI API calls.
# AI Studio automatically injects this at runtime from user secrets.
# Users configure this via the Secrets panel in the AI Studio UI.
VITE_GAPGPT_API_KEY="MY_GAPGPT_API_KEY"

# APP_URL: The URL where this applet is hosted.
# AI Studio automatically injects this at runtime with the Cloud Run service URL.
# Used for self-referential links, OAuth callbacks, and API endpoints.
APP_URL="MY_APP_URL"
```

### Backend Level (backend/.env.example)

**Location**: `backend/.env.example`

```bash
NODE_ENV=development
PORT=4000

DATABASE_URL="postgresql://user:password@localhost:5432/mathkonkur?schema=public"
REDIS_URL="redis://localhost:6379"

JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-different-from-above"

GAPGPT_API_KEY="sk-dV9Hoq2cpZopCgaWpJkCIY2CxgFV6UWSyOJbZEJyjwEs38z8"

FRONTEND_URL="http://localhost:5173"
```

## Environment Variables Reference

### Frontend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GAPGPT_API_KEY` | Yes | GapGPT API key for AI responses |
| `VITE_API_URL` | No | Backend API URL (default: http://localhost:4000/api) |
| `APP_URL` | Yes | Application deployment URL |

### Backend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | development, production, or test |
| `PORT` | Yes | Server port (default: 4000) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | No | Redis connection string (optional) |
| `JWT_SECRET` | Yes | JWT access token secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | JWT refresh token secret (min 32 chars) |
| `GAPGPT_API_KEY` | Yes | GapGPT API key |
| `FRONTEND_URL` | Yes | CORS origin for frontend |

## Development Setup

### Prerequisites

- Node.js (ES2022 compatible)
- PostgreSQL 14+
- npm or yarn

### Step 1: Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### Step 2: Configure Environment

```bash
# Frontend
cp .env.example .env
# Edit .env with VITE_GAPGPT_API_KEY

# Backend
cd backend
cp .env.example .env
# Edit .env with DATABASE_URL, JWT secrets, GAPGPT_API_KEY
```

### Step 3: Database Setup

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

### Step 4: Start Development Servers

```bash
# Option 1: Frontend only
npm run dev

# Option 2: Backend only
cd backend && npm run dev

# Option 3: Both
npm run dev:full
```

## Production Environment

### Environment Variables

```bash
# Production .env
NODE_ENV=production
PORT=4000

DATABASE_URL="postgresql://user:password@db-host:5432/mathkonkur?schema=public"
REDIS_URL="redis://redis-host:6379"

JWT_SECRET="<strong-random-32-char-secret>"
JWT_REFRESH_SECRET="<strong-random-32-char-secret>"

GAPGPT_API_KEY="sk-prod-..."

FRONTEND_URL="https://your-domain.com"
```

### Build Process

```bash
# Frontend build
npm run build

# Backend build
cd backend
npm run build
```

### Production Start

```bash
# Frontend preview
npm run preview

# Backend production
cd backend
npm run start
```

## Test Environment

### Test Configuration

```bash
# backend/.env.test
NODE_ENV=test
PORT=4000

DATABASE_URL="postgresql://user:password@localhost:5432/mathkonkur_test?schema=public"
REDIS_URL="redis://localhost:6379"

JWT_SECRET="test-jwt-secret-min-32-chars-for-testing"
JWT_REFRESH_SECRET="test-refresh-secret-min-32-chars-for-testing"

GAPGPT_API_KEY="sk-test-key"

FRONTEND_URL="http://localhost:3000"
```

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd backend
npm test
```

## Environment-Specific Behavior

### Development (NODE_ENV=development)

- Detailed logging enabled
- Prisma query logging enabled
- CORS allows localhost
- Debug error messages

### Production (NODE_ENV=production)

- Minimal logging
- No Prisma query logging
- CORS restricted to FRONTEND_URL
- Generic error messages
- Secure cookies (https only)

### Test (NODE_ENV=test)

- In-memory or test database
- Fast logging
- Test-specific configurations

## Configuration Validation

**File**: `backend/src/config/env.ts`

```typescript
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  DATABASE_URL: z.string().startsWith('postgresql://', { message: "DATABASE_URL must start with 'postgresql://'" }),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, { message: 'JWT_SECRET must be at least 32 characters long' }),
  JWT_REFRESH_SECRET: z.string().min(32, { message: 'JWT_REFRESH_SECRET must be at least 32 characters long' }),
  GAPGPT_API_KEY: z.string().min(1, { message: 'GAPGPT_API_KEY must not be empty' }),
  FRONTEND_URL: z.string().url(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(_env.error.format(), null, 2));
  process.exit(1);
}

export const env = _env.data;
```

## Secrets Management

### Never Commit Secrets

- `.env` files are gitignored
- Use `.env.example` as template
- Rotate secrets regularly

### Recommended Secrets

| Secret | Length | Generator |
|--------|--------|-----------|
| JWT_SECRET | 32+ chars | `openssl rand -hex 32` |
| JWT_REFRESH_SECRET | 32+ chars | `openssl rand -hex 32` |
| DATABASE_URL | - | PostgreSQL connection string |

### Environment-Specific API Keys

| Environment | API Key Source |
|-------------|----------------|
| Development | Personal GapGPT account |
| Staging | Team shared account |
| Production | Organization production account |
