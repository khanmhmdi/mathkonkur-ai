import {
  getSystemPrompt,
  getProblemSolverPrompt,
  getConceptExplainerPrompt,
  MAX_CONTEXT_MESSAGES,
  MAX_TOKENS
} from './tutor.system';
import { assert } from 'console';

function verify() {
  console.log('--- Testing Prompts Layer ---');

  // Test 1: Constants
  console.log('\n[Test 1] Verifying Constants');
  assert(MAX_CONTEXT_MESSAGES === 10, 'MAX_CONTEXT_MESSAGES should be 10');
  assert(MAX_TOKENS === 2048, 'MAX_TOKENS should be 2048');
  console.log('✅ Test 1 passed');

  // Test 2: System Prompt Interpolation and Rules
  console.log('\n[Test 2] Verifying getSystemPrompt interpolation & rules');
  const subject = 'توابع نمایی';
  const level = 'علوم تجربی';
  const systemPrompt = getSystemPrompt(subject, level);
  
  assert(systemPrompt.includes('MathKonkur AI'), 'Must define identity');
  assert(systemPrompt.includes('زبان فارسی'), 'Must enforce Persian language');
  assert(systemPrompt.includes('روش سقراطی'), 'Must enforce Socratic method');
  assert(systemPrompt.includes('فرمت LaTeX'), 'Must enforce LaTeX formatting');
  assert(systemPrompt.includes('نکته کنکوری'), 'Must highlight exam tips');
  assert(systemPrompt.includes('دام‌های آموزشی'), 'Must highlight common mistakes');
  assert(systemPrompt.includes(subject), 'Must include the requested subject');
  assert(systemPrompt.includes(level), 'Must include the requested level');
  console.log('✅ Test 2 passed');

  // Test 3: Problem Solver Prompt
  console.log('\n[Test 3] Verifying getProblemSolverPrompt');
  const problem = 'انتگرال x^2 dx از ۰ تا ۱ را حساب کنید';
  const solverPrompt = getProblemSolverPrompt(problem);
  assert(solverPrompt.includes(problem), 'Must embed the specific problem text');
  assert(solverPrompt.includes('روش سقراطی'), 'Must reinforce socratic rules');
  console.log('✅ Test 3 passed');

  // Test 4: Concept Explainer Prompt
  console.log('\n[Test 4] Verifying getConceptExplainerPrompt');
  const concept = 'مشتق زنجیره‌ای';
  const explainerPrompt = getConceptExplainerPrompt(concept);
  assert(explainerPrompt.includes(concept), 'Must embed the specific concept text');
  assert(explainerPrompt.includes('مثال‌های کاربردی'), 'Must emphasize practical examples');
  console.log('✅ Test 4 passed');

  console.log('\n--- All Prompt Generation tests passed ---');
}

try {
  verify();
} catch (err) {
  console.error('Prompt Layer verification failed:', err);
  process.exit(1);
}
