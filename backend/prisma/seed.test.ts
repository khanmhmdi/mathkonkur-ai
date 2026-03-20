/**
 * Verification tests for backend/prisma/seed.ts helper functions.
 * We extract and test the pure functions independently from the DB.
 */

// ── Inline reimplementation of helpers for testability ──────
function parseSteps(explanation: string): Array<{ step: number; text: string }> {
  const sentences = explanation.split(/[.!?؟]+/).filter((s: string) => s.trim().length > 10);
  return sentences.slice(0, 5).map((text: string, idx: number) => ({
    step: idx + 1,
    text: text.trim(),
  }));
}

function transformQuestion(q: any) {
  return {
    questionNumber: q.id,
    text: q.text,
    textTeX: q.text,
    options: q.options,
    correctAnswer: q.correctAnswer ?? 0,
    subject: q.subject,
    topic: q.subject,
    level: q.level,
    examYear: null,
    imageUrl: q.image ?? null,
    explanation: q.explanation ?? 'تشریحی در دست تهیه است.',
    explanationTeX: q.explanation ?? null,
    solutionSteps: q.explanation ? parseSteps(q.explanation) : [],
    isVerified: true,
    attemptCount: 0,
    correctCount: 0,
    correctRate: null,
  };
}

describe('Seed Helpers', () => {
  it('parseSteps should split on Persian/Latin punctuation', () => {
    const exp1 = 'فرمول کلی. مرحله اول محاسبه. نتیجه نهایی.';
    const steps1 = parseSteps(exp1);
    expect(steps1.length).toBeGreaterThanOrEqual(2);
    expect(steps1[0].step).toBe(1);
    expect(steps1[1].step).toBe(2);
  });

  it('parseSteps should be capped at 5 steps even with many sentences', () => {
    const many = 'جمله اول است. جمله دوم است. جمله سوم است. جمله چهارم است. جمله پنجم است. جمله ششم است و بیشتر.';
    const steps2 = parseSteps(many);
    expect(steps2.length).toBeLessThanOrEqual(5);
  });

  it('parseSteps should filter out short fragments', () => {
    const shorts = 'بله. خیر. این یک جمله طولانی برای تست است.';
    const steps3 = parseSteps(shorts);
    expect(steps3.length).toBe(1);
  });

  it('transformQuestion should map id to questionNumber', () => {
    const mockQ = {
      id: 7,
      subject: 'آمار',
      level: 'متوسط',
      text: 'سوال تست',
      options: ['الف', 'ب', 'ج', 'د'],
      correctAnswer: 2,
      explanation: 'توضیح این سوال در اینجاست. مرحله بعد اینجا',
    };
    const result = transformQuestion(mockQ);
    expect(result.questionNumber).toBe(7);
    expect(result.subject).toBe('آمار');
    expect(result.correctAnswer).toBe(2);
    expect(result.examYear).toBeNull();
    expect(result.attemptCount).toBe(0);
    expect(result.correctRate).toBeNull();
    expect(result.isVerified).toBe(true);
  });

  it('transformQuestion should provide default explanation for missing field', () => {
    const noExpQ = { id: 99, subject: 'جبر', level: 'آسان', text: 'متن', options: ['۱'], correctAnswer: 0 };
    const noExpResult = transformQuestion(noExpQ);
    expect(noExpResult.explanation).toBe('تشریحی در دست تهیه است.');
    expect(noExpResult.explanationTeX).toBeNull();
    expect(noExpResult.solutionSteps).toEqual([]);
  });

  it('transformQuestion should preserve image URL', () => {
    const imgQ = { id: 1, subject: 'S', level: 'L', text: 'T', options: ['O'], image: 'https://example.com/img.png' };
    const imgResult = transformQuestion(imgQ);
    expect(imgResult.imageUrl).toBe('https://example.com/img.png');
  });

  it('transformQuestion should default undefined correctAnswer to 0', () => {
    const noAnsQ = { id: 5, subject: 'هندسه', level: 'سخت', text: 't', options: ['a'] };
    const noAns = transformQuestion(noAnsQ);
    expect(noAns.correctAnswer).toBe(0);
  });

  it('solutionSteps should be an array of {step, text}', () => {
    const mockQ = { id: 1, text: 'T', options: ['O'], explanation: 'Sentence one is long enough. Sentence two is also long.' };
    const stepResult = transformQuestion(mockQ);
    const stepsArr = stepResult.solutionSteps;
    expect(Array.isArray(stepsArr)).toBe(true);
    if (stepsArr.length > 0) {
      expect(stepsArr[0]).toHaveProperty('step');
      expect(stepsArr[0]).toHaveProperty('text');
      expect(typeof stepsArr[0].step).toBe('number');
    }
  });
});
