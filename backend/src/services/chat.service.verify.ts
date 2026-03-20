import { chatService } from './chat.service';
import { chatRepository } from '../repositories/chat.repository';
import { aiService } from './ai.service';
import assert from 'node:assert';

// Mocking logic for manual script execution
const mockRepo = {
  create: async (data: any) => ({ ...data, id: 'conv-123', userId: 'user-456' }),
  findById: async (id: string) => id === 'conv-123' ? { id: 'conv-123', userId: 'user-456', subject: 'Math', level: 'High' } : null,
  addMessage: async (cid: string, role: string, content: string) => ({ id: 'msg-789', role, content }),
  getMessages: async () => ({ messages: [{ role: 'user', content: 'Hi' }], pagination: {} }),
};

// Replace registry for testing
(chatRepository as any).create = mockRepo.create;
(chatRepository as any).findById = mockRepo.findById;
(chatRepository as any).addMessage = mockRepo.addMessage;
(chatRepository as any).getMessages = mockRepo.getMessages;

// Mock AI Service
(aiService as any).generateResponse = async () => ({ content: 'AI Answer', tokensUsed: 100 });

async function verify() {
  console.log('--- Testing Chat Service ---');

  const testUserId = 'user-456';

  // Test 1: createConversation
  console.log('\n[Test 1] createConversation logic');
  const result = await chatService.createConversation({
    userId: testUserId,
    initialMessage: 'حل کن: x + 2 = 5',
    subject: 'جبر',
    level: 'متوسط'
  });
  assert.strictEqual(result.conversation.id, 'conv-123');
  assert.strictEqual(result.message.content, 'AI Answer');
  console.log('✅ Test 1 passed');

  // Test 2: processMessage flow
  console.log('\n[Test 2] processMessage flow');
  const aiMsg = await chatService.processMessage({
    conversationId: 'conv-123',
    userId: testUserId,
    content: 'سوال بعدی'
  });
  assert.strictEqual(aiMsg.content, 'AI Answer');
  console.log('✅ Test 2 passed');

  // Test 3: Unauthorized Access
  console.log('\n[Test 3] Unauthorized access (Incorrect User)');
  try {
    await chatService.processMessage({
      conversationId: 'conv-123',
      userId: 'attacker-id',
      content: 'دزدی اطلاعات'
    });
    assert.fail('Should have thrown 403');
  } catch (err: any) {
    assert.strictEqual(err.statusCode, 403);
    assert.strictEqual(err.message, 'UNAUTHORIZED');
  }
  console.log('✅ Test 3 passed');

  // Test 4: Not Found
  console.log('\n[Test 4] Conversation Not Found');
  try {
    await chatService.getConversationHistory('missing-id', testUserId);
    assert.fail('Should have thrown 404');
  } catch (err: any) {
    assert.strictEqual(err.statusCode, 404);
  }
  console.log('✅ Test 4 passed');

  console.log('\n--- All Chat Service logic tests passed ---');
}

verify().catch(err => {
  console.error('Chat Service verification failed:', err);
  process.exit(1);
});
