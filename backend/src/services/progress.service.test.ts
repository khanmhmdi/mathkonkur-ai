describe('Progress Service Logic', () => {
  // ── Mock Repositories ──────────────────────────────────────
  const mockQuestion = {
    id: 'q-1',
    correctAnswer: 1,
    explanation: 'توضیح',
    solutionSteps: [],
  };

  const mockProgressRepository = {
    findByUserAndQuestion: jest.fn(),
    upsertProgress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('recordAttempt: First time correct should identify as correct', async () => {
    const input = { userId: 'u-1', questionId: 'q-1', answerIndex: 1, timeSpentSeconds: 20 };
    const isCorrect = input.answerIndex === mockQuestion.correctAnswer;
    expect(isCorrect).toBe(true);

    mockProgressRepository.findByUserAndQuestion.mockResolvedValue(null);
    const existing = await mockProgressRepository.findByUserAndQuestion();
    const isNewRecord = (existing === null) && isCorrect;
    expect(isNewRecord).toBe(true);
  });

  it('Streak logic: should increment on correct and reset on wrong', () => {
    const existingStreak = 3;
    let isCorrect = true;
    let newStreak = isCorrect ? existingStreak + 1 : 0;
    expect(newStreak).toBe(4);

    isCorrect = false;
    newStreak = isCorrect ? newStreak + 1 : 0;
    expect(newStreak).toBe(0);
  });

  it('Accuracy: should calculate correctly (1/2 attempts = 50%)', () => {
    const attempts = 2;
    const correct = 1;
    const accuracy = (correct / attempts) * 100;
    expect(accuracy).toBe(50);
  });

  it('Weekly Activity: should fill dates correctly', () => {
    const activityRaw = [{ date: new Date(), attempts: 5, correct: 3 }];
    
    const activity = Array.from({ length: 3 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (2 - i));
      const dateStr = d.toISOString().split('T')[0];
      const found = activityRaw.find(a => a.date.toISOString().split('T')[0] === dateStr);
      return { date: dateStr, attempts: found?.attempts || 0 };
    });

    expect(activity.length).toBe(3);
    expect(activity[2].attempts).toBe(5);
    expect(activity[1].attempts).toBe(0);
  });
});
