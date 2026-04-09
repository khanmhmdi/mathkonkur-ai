import { aiService } from './src/services/ai.service';

async function testGapGPT() {
  try {
    
    console.log('🧪 Testing GapGPT Integration...\n');
    
    const response = await aiService.generateResponse(
      [
        {
          role: 'user',
          content: 'سلام! یک مثال ساده در مورد معادلات خطی برایم توضیح دهید.'
        }
      ],
      'ریاضی',
      'پایه دهم'
    );

    console.log('✅ GapGPT Response Received:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Content:', response.content.substring(0, 200) + '...');
    console.log('Tokens Used:', response.tokensUsed);
    console.log('Model:', response.modelVersion);
    console.log('Processing Time:', response.processingTimeMs + 'ms');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✨ GapGPT integration is working correctly!\n');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ GapGPT Test Failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    process.exit(1);
  }
}

testGapGPT();
