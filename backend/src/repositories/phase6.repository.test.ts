import { describe, it, expect } from '@jest/globals';

function sm2(isCorrect: boolean, reps: number, ease: number, interval: number) {
  const quality = isCorrect ? 5 : 1;
  let newReps = reps;
  let newInterval = interval;
  let newEase = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEase < 1.3) newEase = 1.3;
  if (quality < 3) { newReps = 0; newInterval = 1; }
  else {
    newReps += 1;
    if (newReps === 1) newInterval = 1;
    else if (newReps === 2) newInterval = 6;
    else newInterval = Math.round(interval * newEase);
  }
  return { srsRepetitions: newReps, srsInterval: newInterval, srsEaseFactor: newEase };
}

describe('Phase 6.1 Repository Logic', () => {
  it('SM-2: first correct answer should set rep=1, interval=1', () => {
    const s1 = sm2(true, 0, 2.5, 1);
    expect(s1.srsRepetitions).toBe(1);
    expect(s1.srsInterval).toBe(1);
    expect(s1.srsEaseFactor).toBeGreaterThanOrEqual(2.5);
  });

  it('SM-2: second correct answer should set interval=6', () => {
    const s1 = sm2(true, 0, 2.5, 1);
    const s2 = sm2(true, 1, s1.srsEaseFactor, s1.srsInterval);
    expect(s2.srsRepetitions).toBe(2);
    expect(s2.srsInterval).toBe(6);
  });

  it('SM-2: wrong answer should reset reps and interval', () => {
    const s3 = sm2(false, 2, 2.6, 6);
    expect(s3.srsRepetitions).toBe(0);
    expect(s3.srsInterval).toBe(1);
  });

  it('SM-2: ease factor should never drop below 1.3', () => {
    const s4 = sm2(false, 0, 1.3, 1);
    expect(s4.srsEaseFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('QuestionFilter: should only set relevant fields', () => {
    function buildWhere(filter: { subject?: string; level?: string }) {
      const where: any = {};
      if (filter.subject) where.subject = filter.subject;
      if (filter.level) where.level = filter.level;
      return where;
    }
    const w = buildWhere({ subject: 'جبر' });
    expect(w).toEqual({ subject: 'جبر' });
    const w2 = buildWhere({});
    expect(w2).toEqual({});
  });

  it('correctRate: should be calculated correctly after attempts', () => {
    function computeRate(correct: number, total: number) {
      return total > 0 ? correct / total : null;
    }
    expect(computeRate(3, 10)).toBe(0.3);
    expect(computeRate(0, 0)).toBeNull();
  });

  it('Streak: should reset to 0 on wrong and increment on correct', () => {
    function updateStreak(current: number, max: number, isCorrect: boolean) {
      const next = isCorrect ? current + 1 : 0;
      return { currentStreak: next, maxStreak: Math.max(max, next) };
    }
    const st1 = updateStreak(3, 3, true);
    expect(st1).toEqual({ currentStreak: 4, maxStreak: 4 });
    const st2 = updateStreak(4, 4, false);
    expect(st2).toEqual({ currentStreak: 0, maxStreak: 4 });
  });

  it('Mastery: should be capped at 100', () => {
    function masteryLevel(correct: number, total: number) {
      return Math.min(100, (correct / total) * 100);
    }
    expect(masteryLevel(10, 10)).toBe(100);
    expect(masteryLevel(5, 10)).toBe(50);
    expect(masteryLevel(1000, 1000)).toBeLessThanOrEqual(100);
  });
});
