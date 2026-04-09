<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/acd4f837-d284-4bc6-be73-bac983efd44e

## Project Roadmap

### [Phase 0 (Completed)](DOCS_PHASE0.md)

Project infrastructure setup.

### [Phase 3: Auth System (COMPLETED)](DOCS_PHASE3.md)

✅ **Backend Authentication**: JWT tokens, password hashing, session management  
✅ **Frontend UI**: Modern login/signup pages, responsive design  
✅ **Integration**: Complete frontend-backend auth flow  
✅ **Security**: HttpOnly cookies, CORS protection, input validation  
✅ **Documentation**: Comprehensive guides and API references

### [Phase 4: Error Handling & Server](DOCS_PHASE4.md)

### [Phase 5: AI & Chat](DOCS_PHASE5.md)

### [Phase 6: Question Bank & SRS](DOCS_PHASE6.md)

### [Phase 7: Frontend-Backend Integration](DOCS_PHASE7.md)

### Phase 1: Database & Core Infrastructure

- [x] **Step 1.1**: Create Prisma Database Schema

- [x] **Step 1.2**: Execute Prisma Migration and Generate Client

### Phase 2: Error Handling & Utilities

- [x] **Step 2.1**: Custom Error Handling System

- [x] **Step 2.2**: API Response Formatter

- [x] **Step 2.3**: Logger Configuration

## Structure

- **[backend/](backend/README.md)**: Node.js/TypeScript backend API with authentication, database, and AI services.

- **frontend/ (src/)**: Vite-based React frontend app with authentication UI, chat interface, and question bank.

### Key Components

**Authentication System**:
- `src/components/AuthPage.tsx` - Login/signup UI with modern design
- `src/contexts/AuthContext.tsx` - Authentication state management
- `backend/src/controllers/auth.controller.ts` - Auth API endpoints
- `backend/src/services/auth.service.ts` - Business logic and security

**Core Features**:
- `src/components/ChatInterface.tsx` - AI tutoring chat
- `src/components/QuestionBank.tsx` - Math question browser
- `backend/src/services/ai.service.ts` - GapGPT AI integration

## Run Locally

**Prerequisites:** Node.js, PostgreSQL

1. **Install dependencies:**
   ```bash
   npm install
   cd backend && npm install
   ```

2. **Set environment variables:**
   - Copy `.env.example` to `.env`
   - Set `GAPGPT_API_KEY` to your GapGPT API key (get it from https://api.gapgpt.app)
   - Configure database connection in `backend/.env`

3. **Setup database:**
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

4. **Run the application:**
   ```bash
   # Option 1: Run both frontend and backend
   npm run dev:full
   
   # Option 2: Run separately
   npm run dev              # Frontend on http://localhost:3000
   cd backend && npm run dev # Backend on http://localhost:4000
   ```

5. **Test authentication:**
   - Visit `http://localhost:3000`
   - Click "ورود / ثبت‌نام" in the navbar
   - Test signup and login flows

### Authentication Features

- 🔐 **Secure Login/Signup**: JWT tokens with refresh rotation
- 🎨 **Modern UI**: Responsive design with Persian localization
- 🛡️ **Security**: Password hashing, HttpOnly cookies, CORS protection
- 📱 **Mobile Ready**: Optimized for all device sizes
- ⚡ **Auto-Refresh**: Seamless token renewal without user intervention

## Deployment

### Quick Deploy

The project is configured for CI/CD deployment with GitHub Actions:

| Platform | Purpose | Cost |
|----------|---------|------|
| **Vercel** | Frontend hosting | Free |
| **Railway** | Backend + Database | ~$5/month |
| **Render** | Alternative all-in-one | Free - $7/month |

### Deployment Steps

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Setup Secrets** (in GitHub Settings → Secrets):
   - `VERCEL_TOKEN` - From [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - `RAILWAY_TOKEN` - From [railway.app/account/tokens](https://railway.app/account/tokens)
   - `GAPGPT_API_KEY` - From [api.gapgpt.app](https://api.gapgpt.app)

3. **Deploy:**
   - Push to `main` branch → Auto-deploys to production
   - Push to `develop` branch → Auto-deploys to staging

### Manual Deployment

```bash
# Using Docker
docker-compose up -d

# Using Vercel CLI
vercel --prod

# Using Railway CLI
cd backend && railway up
```

**📖 Full Deployment Guide:** See [`docs/operations/github-deployment-guide.md`](docs/operations/github-deployment-guide.md)
