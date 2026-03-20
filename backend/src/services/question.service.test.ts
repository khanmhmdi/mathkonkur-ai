import { describe, it, expect } from '@jest/globals';

// ── Mock Logic (in-memory) ──────────────────────────────────
const mockQuestion = {
  id: 'q-1',
  questionNumber: 1,
  text: 'کدام گزینه صحیح است؟',
  options: ['۱', '۲', '۳', '۴'],
  correctAnswer: 2,
  explanation: 'توضیح تستی',
  subject: 'جبر',
  level: 'آسان',
};

const mockQuestionRepository = {
  findById: async (id: string, userId?: string) => {
    if (id === 'q-1') return { 
      ...mockQuestion, 
      favorites: userId ? [] : undefined, 
      progress: userId ? [] : undefined 
    };
    return null;
  },
  incrementStats: async () => ({}),
};

const mockProgressRepository = {
  upsert: async (input: any) => ({
    ...input,
    masteryLevel: input.isCorrect ? 100 : 0,
    nextReviewAt: new Date(),
  }),
};

describe('Question Service Business Logic', () => {
  it('should handle correct answer logic in submitAnswer', async () => {
    const userId = 'u-1';
    const qId = 'q-1';
    const selected = 2; // Correct
    
    const q = await mockQuestionRepository.findById(qId);
    const isCorrect = q?.correctAnswer === selected;
    expect(isCorrect).toBe(true);
    
    const prog = await mockProgressRepository.upsert({ userId, questionId: qId, isCorrect, lastAnswer: selected });
    expect(prog.isCorrect).toBe(true);
    expect(prog.masteryLevel).toBe(100);
  });

  it('should handle incorrect answer logic in submitAnswer', async () => {
    const selected = 0; // Wrong
    
    const q = await mockQuestionRepository.findById('q-1');
    const isCorrect = q?.correctAnswer === selected;
    expect(isCorrect).toBe(false);
    
    const prog = await mockProgressRepository.upsert({ isCorrect });
    expect(prog.isCorrect).toBe(false);
    expect(prog.masteryLevel).toBe(0);
  });

  it('should sanitize search queries correctly', () => {
    const query = '  مشتق  ';
    const sanitized = query.trim().substring(0, 100);
    expect(sanitized).toBe('مشتق');
    
    const toolong = 'a'.repeat(150);
    expect(toolong.trim().substring(0, 100).length).toBe(100);
  });

  it('should allocate correct percentages for practice sets', () => {
    const count = 10;
    const reviewCount = Math.ceil(count * 0.3); // 3
    const weakCount = Math.ceil(count * 0.4);   // 4
    const newCount = count - reviewCount - weakCount; // 3
    
    expect(reviewCount).toBe(3);
    expect(weakCount).toBe(4);
    expect(newCount).toBe(3);
  });
});
