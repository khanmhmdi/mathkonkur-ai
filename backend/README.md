# MathKonkur Backend

This is the backend for the MathKonkur-AI project.

## Tech Stack

- **Runtime**: Node.js (ES2022)

- **Language**: TypeScript

- **Framework**: Express

- **Database ORM**: Prisma (PostgreSQL)

- **Validation**: Zod

- **Logging**: Pino & Pino-pretty

- **Security**: Helmet, bcrypt, jsonwebtoken

- **Utility**: dotenv

## Project Structure

- `src/config/env.ts`: Environment variable validation and configuration.

## Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in the required values.

   ```bash
   cp .env.example .env
   ```

3. **Database Setup**:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Run in development**:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev`: Start development server with nodemon.

- `npm run build`: Compile TypeScript to JavaScript.

- `npm run start`: Run the compiled project.

- `npm run db:migrate`: Run Prisma migrations.

- `npm run db:generate`: Generate Prisma client.

- `npm run db:seed`: Seed the database.
