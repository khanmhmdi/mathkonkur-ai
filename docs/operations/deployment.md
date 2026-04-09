# Deployment

Deployment procedures for MathKonkur AI.

## Deployment Options

### Option 1: Local Development

```bash
# Clone repository
git clone <repo-url>
cd mathkonkur-ai

# Install dependencies
npm install
cd backend && npm install

# Setup environment
cp .env.example .env
cp backend/.env.example backend/.env
# Edit .env files

# Start development
npm run dev:full
```

### Option 2: Docker Deployment

**Dockerfile (frontend)**:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Dockerfile (backend)**:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY backend/ ./backend/
WORKDIR /app/backend
RUN npm run build
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

**docker-compose.yml**:

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://backend:4000/api
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://db:5432/mathkonkur
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=mathkonkur
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  postgres_data:
```

### Option 3: Cloud Deployment

#### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**vercel.json**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

#### Railway (Backend)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway up
```

**railway.json**:
```json
{
  "buildCommand": "cd backend && npm install && npm run build",
  "startCommand": "cd backend && npm run start"
}
```

#### Render (Backend + Database)

```yaml
# render.yaml
services:
  - type: web
    name: backend
    env: node
    buildCommand: cd backend && npm install && npm run build
    startCommand: cd backend && npm run start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: mathkonkur-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_REFRESH_SECRET
        generateValue: true
      - key: GAPGPT_API_KEY
        fromService: gapgpt-api

databases:
  - name: mathkonkur-db
    databaseName: mathkonkur
    plan: starter
```

## Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Build succeeds (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] Static assets optimized
- [ ] API keys set

### Post-Deployment

- [ ] Health check endpoint returns 200
- [ ] Database connection successful
- [ ] API endpoints responding
- [ ] AI service integration working
- [ ] Logging configured
- [ ] Monitoring active

## Environment-Specific Deployments

### Development

- URL: http://localhost:3000
- Branch: develop
- Auto-deploy: On push to develop

### Staging

- URL: https://staging.mathkonkur.ai
- Branch: staging
- Auto-deploy: On push to staging
- Database: Separate staging database

### Production

- URL: https://mathkonkur.ai
- Branch: main
- Auto-deploy: On tag release
- Database: Production database

## Database Migration in Production

```bash
# Apply migrations
cd backend
npm run db:migrate deploy

# Or with custom migration
npx prisma migrate deploy --name "migration_name"
```

## Rollback Procedure

### Backend Rollback

```bash
# Revert to previous version
git checkout v1.0.0
cd backend
npm run build
npm run start
```

### Database Rollback

```bash
# Prisma does not support automatic rollback
# Manual steps:
# 1. Restore from backup
pg_restore -h db-host -U user -d mathkonkur backup.dump
```

## CI/CD Pipeline

**GitHub Actions Example**:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm install && cd backend && npm install
      - name: Run tests
        run: npm test && cd backend && npm test
      - name: Run E2E tests
        run: npm run test:e2e

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: npm run build
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Build
        run: cd backend && npm install && npm run build
      - name: Deploy to Railway
        run: railway up --token=${{ secrets.RAILWAY_TOKEN }}
```

## Monitoring After Deployment

```bash
# Check health
curl https://api.mathkonkur.ai/health

# Check logs
kubectl logs -f backend-xxx

# Check metrics
curl https://api.mathkonkur.ai/metrics
```
