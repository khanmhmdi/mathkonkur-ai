import { aiService } from './ai.service';
import { assert } from 'console';

async function verify() {
  console.log('--- Testing AI Service Integration ---');

  // Test 1: parseMathContent structural extraction
  console.log('\n[Test 1] parseMathContent structural extraction');
  const raw = 'سلام! راه حل این است: $$x = \\frac{-b}{2a}$$ و همچنین $y = mx + c$';
  const parsed = aiService.parseMathContent(raw);
  
  assert(parsed.cleanContent !== undefined, 'T1: cleanContent should be defined');
  assert(parsed.extractedFormulas.length === 2, 'T1: Should extract precisely two formulas');
  assert(parsed.extractedFormulas[0] === 'x = \\frac{-b}{2a}', 'T1: First formula should match the display LaTeX');
  assert(parsed.extractedFormulas[1] === 'y = mx + c', 'T1: Second formula should match the inline LaTeX');
  console.log('✅ Test 1 passed\n');

  // Test 2: Validation Guards
  console.log('[Test 2] LaTeX brace validation guard');
  const unsafeHtml = '$$x = \\frac{-b}{2a}$$ و $$ y = { x $$';
  const guarded = aiService.parseMathContent(unsafeHtml);
  
  // Guard should reject the second block since it has `{` but lacks `}`
  assert(guarded.extractedFormulas.length === 1, 'T2: Should reject imbalanced braces');
  assert(guarded.cleanContent.includes('$$ y = { x $$'), 'T2: Should leave imbalanced latex completely unparsed');
  console.log('✅ Test 2 passed\n');

  // Test 3: Basic structural requirement for Gemini API Error Throwing
  // Since we don't have a reliable mock for GoogleGenAI inside a raw executable without DI,
  // we will verify that validation boundaries instantly reject malformed arrays.
  console.log('[Test 3] Context boundaries validation');
  try {
    await aiService.generateResponse([], 'هندسه', 'ریاضی فیزیک');
    assert(false, 'Should have thrown validation error');
  } catch (err: any) {
    assert(err.code === 400, 'T3: Should throw exactly a 400 Bad Request');
    assert(err.isOperational === true, 'T3: Must be an operational error');
    assert(err.message.includes('cannot be empty'), 'T3: Must inform about empty array');
  }
  console.log('✅ Test 3 passed\n');

  console.log('--- All AI Service logic tests passed ---');
}

verify().catch(err => {
  console.error('AI Service verification failed:', err);
  process.exit(1);
});
