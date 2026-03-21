/**
 * Database seed script for MathKonkur AI.
 * Migrates the 31 static KONKUR_QUESTIONS into the Postgres question bank.
 *
 * Idempotent: skips seeding if questions already exist.
 * Run via: `npx prisma db seed`  OR  `npm run db:seed`
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
// Static ESM-compatible import from the local backend data folder.
import { KONKUR_QUESTIONS } from '../src/data/questions';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────
// Helper: Parse explanation text into structured step objects
// ─────────────────────────────────────────────────────────────
export function parseSteps(explanation: string): Array<{ step: number; text: string }> {
  const sentences = explanation.split(/[.!?؟]+/).filter((s: string) => s.trim().length > 10);
  return sentences.slice(0, 5).map((text: string, idx: number) => ({
    step: idx + 1,
    text: text.trim(),
  }));
}

// ─────────────────────────────────────────────────────────────
// Helper: Transform a static question record → Prisma input
// ─────────────────────────────────────────────────────────────
export function transformQuestion(q: typeof KONKUR_QUESTIONS[0]) {
  return {
    questionNumber: q.id,
    text: q.text,
    textTeX: q.text,
    options: q.options as string[],
    correctAnswer: q.correctAnswer ?? 0,
    subject: q.subject,
    topic: q.subject,
    level: q.level,
    examYear: null as number | null,
    imageUrl: q.image ?? null,
    explanation: q.explanation ?? 'تشریحی در دست تهیه است.',
    explanationTeX: q.explanation ?? null,
    solutionSteps: q.explanation ? parseSteps(q.explanation) : [],
    isVerified: true,
    attemptCount: 0,
    correctCount: 0,
    correctRate: null as number | null,
  };
}

// ─────────────────────────────────────────────────────────────
// Helper: Seed test users for development/testing
// ─────────────────────────────────────────────────────────────
async function seedTestUsers() {
  const testUsers = [
    { email: 'test@test.com', password: '123456', name: 'Test User', level: 'intermediate' },
    { email: 'admin@test.com', password: 'admin123', name: 'Admin User', level: 'advanced' },
  ];

  console.log('🔐 Seeding test users...');

  for (const testUser of testUsers) {
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email: testUser.email } });
    if (existing) {
      console.log(`   ⏭️  ${testUser.email} already exists, skipping...`);
      continue;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(testUser.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: testUser.email,
        passwordHash,
        name: testUser.name,
        level: testUser.level,
      },
    });

    // Create a session for the user
    const sessionId = uuidv4();
    const refreshToken = Buffer.from(JSON.stringify({ userId: user.id, sessionId })).toString('base64');
    
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    console.log(`   ✅ ${testUser.email} (${testUser.name})`);
  }
}

// ─────────────────────────────────────────────────────────────
// Main seed function
// ─────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Always seed test users
    await seedTestUsers();

    // Idempotency guard — skip questions if data already present
    const existing = await prisma.question.count();
    if (existing > 0) {
      console.log(`⚠️  Question seed skipped: ${existing} questions already exist in the database.`);
      console.log('   To re-seed, run: npx prisma migrate reset');
      await prisma.$disconnect();
      return;
    }

    console.log('🗑  Clearing dependent tables (progress, favorites)...');
    await prisma.userProgress.deleteMany();
    await prisma.userFavorite.deleteMany();
    await prisma.question.deleteMany();

    console.log(`📥 Seeding ${KONKUR_QUESTIONS.length} questions...`);

    for (const q of KONKUR_QUESTIONS) {
      await prisma.question.create({ data: transformQuestion(q) });
      console.log(`   ✅ Q${String(q.id).padStart(2, '0')}: ${q.subject} (${q.level})`);
    }

    const count = await prisma.question.count();
    console.log(`\n🎉 Seed complete! ${count} questions now in database.`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
