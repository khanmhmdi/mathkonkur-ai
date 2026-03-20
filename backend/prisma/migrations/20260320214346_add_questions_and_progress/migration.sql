-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "question_number" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "text_tex" TEXT,
    "options" JSONB NOT NULL,
    "correct_answer" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "topic" TEXT NOT NULL DEFAULT 'عمومی',
    "level" TEXT NOT NULL,
    "exam_year" INTEGER,
    "image_url" TEXT,
    "diagram_data" JSONB,
    "explanation" TEXT NOT NULL,
    "explanation_tex" TEXT,
    "solution_steps" JSONB,
    "ai_hints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "common_mistakes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "key_concepts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "correct_rate" DOUBLE PRECISION,
    "is_verified" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correct_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_answer" INTEGER,
    "is_correct" BOOLEAN,
    "time_spent_seconds" INTEGER NOT NULL DEFAULT 0,
    "first_attempt_at" TIMESTAMP(3),
    "last_attempt_at" TIMESTAMP(3),
    "mastery_level" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "srs_interval" INTEGER NOT NULL DEFAULT 1,
    "srs_ease_factor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "srs_repetitions" INTEGER NOT NULL DEFAULT 0,
    "next_review_at" TIMESTAMP(3),
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "max_streak" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "questions_question_number_key" ON "questions"("question_number");

-- CreateIndex
CREATE INDEX "questions_subject_level_idx" ON "questions"("subject", "level");

-- CreateIndex
CREATE INDEX "questions_exam_year_idx" ON "questions"("exam_year");

-- CreateIndex
CREATE INDEX "questions_topic_idx" ON "questions"("topic");

-- CreateIndex
CREATE INDEX "user_favorites_user_id_created_at_idx" ON "user_favorites"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_favorites_user_id_question_id_key" ON "user_favorites"("user_id", "question_id");

-- CreateIndex
CREATE INDEX "user_progress_user_id_next_review_at_idx" ON "user_progress"("user_id", "next_review_at");

-- CreateIndex
CREATE INDEX "user_progress_user_id_mastery_level_idx" ON "user_progress"("user_id", "mastery_level");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_user_id_question_id_key" ON "user_progress"("user_id", "question_id");

-- AddForeignKey
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
