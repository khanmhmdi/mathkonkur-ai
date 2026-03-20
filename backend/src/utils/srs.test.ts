import { calculateSRS, mapAnswerToQuality, SRSData } from './srs';

describe('SM-2 SRS Algorithm', () => {
  it('should handle first success (interval=1, reps=1)', () => {
    const d1: SRSData = { interval: 0, easeFactor: 2.5, repetitions: 0 };
    const r1 = calculateSRS(d1, 4, true);
    expect(r1.newRepetitions).toBe(1);
    expect(r1.newInterval).toBe(1);
    expect(r1.masteryLevel).toBe(25);
  });

  it('should handle second success (interval=6, reps=2)', () => {
    const d2: SRSData = { interval: 1, easeFactor: 2.5, repetitions: 1 };
    const r2 = calculateSRS(d2, 4, true);
    expect(r2.newRepetitions).toBe(2);
    expect(r2.newInterval).toBe(6);
  });

  it('should grow interval by Ease Factor on subsequent successes', () => {
    const d3: SRSData = { interval: 6, easeFactor: 2.5, repetitions: 2 };
    const r3 = calculateSRS(d3, 4, true);
    expect(r3.newInterval).toBe(15); // 6 * 2.5 = 15
  });

  it('should reset interval/reps on failure', () => {
    const d4: SRSData = { interval: 15, easeFactor: 2.5, repetitions: 3 };
    const r4 = calculateSRS(d4, 1, false);
    expect(r4.newRepetitions).toBe(0);
    expect(r4.newInterval).toBe(1);
    expect(r4.masteryLevel).toBe(10);
  });

  it('should adjust Ease Factor based on quality', () => {
    const d3: SRSData = { interval: 6, easeFactor: 2.5, repetitions: 2 };
    
    const rEasy = calculateSRS(d3, 5, true);
    expect(rEasy.newEaseFactor).toBeGreaterThan(2.5);

    const rHard = calculateSRS(d3, 3, true);
    expect(rHard.newEaseFactor).toBeLessThan(2.5);
  });

  it('should cap Ease Factor floor at 1.3', () => {
    const d7: SRSData = { interval: 1, easeFactor: 1.3, repetitions: 1 };
    const r7 = calculateSRS(d7, 0, false);
    expect(r7.newEaseFactor).toBeGreaterThanOrEqual(1.3);
  });

  describe('Quality Mapper', () => {
    it('should map Correct & Fast to Easy (5)', () => {
      expect(mapAnswerToQuality(true, 10)).toBe(5);
    });

    it('should map Correct & Slow to Hard (3)', () => {
      expect(mapAnswerToQuality(true, 70)).toBe(3);
    });

    it('should map Wrong & Fast to Guessing (1)', () => {
      expect(mapAnswerToQuality(false, 5)).toBe(1);
    });

    it('should map Wrong & Slow to Failed (0)', () => {
      expect(mapAnswerToQuality(false, 40)).toBe(0);
    });
  });
});
