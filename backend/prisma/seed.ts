/**
 * Database seed script for MathKonkur AI.
 * Migrates the 31 static KONKUR_QUESTIONS into the Postgres question bank.
 *
 * Idempotent: skips seeding if questions already exist.
 * Run via: `npx prisma db seed`  OR  `npm run db:seed`
 */

import { PrismaClient } from '@prisma/client';
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
// Main seed function
// ─────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Starting database seed...');

  // Idempotency guard — skip if data already present
  const existing = await prisma.question.count();
  if (existing > 0) {
    console.log(`⚠️  Seed skipped: ${existing} questions already exist in the database.`);
    console.log('   To re-seed, run: npx prisma migrate reset');
    return;
  }

  try {
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
