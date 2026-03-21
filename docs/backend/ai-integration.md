# AI Integration

GapGPT API integration for math tutoring functionality.

## AI Service Architecture

```
Chat Message
    ↓
chat.service.ts → ai.service.ts
    ↓
Build messages array + system prompt
    ↓
OpenAI client → GapGPT API
    ↓
Parse LaTeX formulas
    ↓
Return formatted response
```

## GapGPT API Integration

**File**: `backend/src/services/ai.service.ts`

### API Configuration

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: env.GAPGPT_API_KEY,
  baseURL: 'https://api.gapgpt.app/v1'
});
```

| Parameter | Value |
|-----------|-------|
| Base URL | `https://api.gapgpt.app/v1` |
| Model | `gapgpt-qwen-3.5` |
| API Key | `env.GAPGPT_API_KEY` |

### API Client

The GapGPT API is OpenAI-compatible, allowing use of the official `openai` npm package.

```typescript
const response = await this.client.chat.completions.create({
  model: this.MODEL_NAME,  // 'gapgpt-qwen-3.5'
  messages: apiMessages,
  max_tokens: 2048,
  temperature: 0.7
});
```

## System Prompt

**File**: `backend/src/prompts/tutor.system.ts`

### Prompt Structure

```
You are an expert math tutor for Iranian Konkur exam preparation.
You respond in Persian (Farsi).
You explain math concepts step-by-step.
You use LaTeX for mathematical formulas:
  - Inline: $...$
  - Display: $$...$$
You adapt explanations to the student's level.
```

### Level Adaptation

| Level | Description | Example Topics |
|-------|-------------|---------------|
| `ریاضی فیزیک` | Math-Physics track | Calculus, Advanced Algebra |
| `علوم تجربی` | Experimental sciences | Biology-focused math |
| `انسانی و معارف` | Humanities | Basic math, Logic |

### Subject Adaptation

| Subject | Topics |
|---------|--------|
| `جبر و توابع` | Algebra, Functions |
| `معادله و نامعادله` | Equations, Inequalities |
| `توابع و نمودارها` | Functions, Graphs |
| `مثلثات` | Trigonometry |
| `هندسه تحلیلی` | Analytic Geometry |
| `بردارها و هندسه` | Vectors, Geometry |
| `حسابان` | Calculus |
| `گسسته و احتمال` | Discrete Math, Probability |

## Message Format

### User Message

```typescript
{
  role: 'user',
  content: 'لطفاً این سوال را حل کنید: ...'
}
```

### Assistant Message

```typescript
{
  role: 'assistant',
  content: '$$ x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a} $$'
}
```

### With Images

```typescript
{
  role: 'user',
  content: [
    { type: 'text', text: 'این نمودار را تحلیل کنید:' },
    { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,...' } }
  ]
}
```

## Response Generation

### `generateResponse()` Flow

```
1. Validate messages, subject, level
2. Get system prompt from prompts/tutor.system.ts
3. Build messages array (system + history)
4. Append image if provided
5. Call GapGPT API with retry logic
6. Parse LaTeX formulas from response
7. Validate Persian text in response
8. Return { content, tokensUsed, modelVersion, processingTimeMs }
```

### Retry Logic

```typescript
const maxAttempts = 3;
let attempt = 0;

while (attempt < maxAttempts) {
  attempt++;
  try {
    // API call with 30s timeout
    return await makeRequest();
  } catch (err) {
    if (attempt === maxAttempts) throw err;
    await new Promise(r => setTimeout(r, attempt * 1000)); // 1s, 2s
  }
}
```

### Timeout Handling

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

const response = await client.chat.completions.create({...}, {
  signal: controller.signal
});

clearTimeout(timeoutId);
```

## LaTeX Parsing

**File**: `backend/src/services/ai.service.ts`

### `parseMathContent()`

Extracts LaTeX formulas from AI response.

**Input**:
```
برای حل این معادله از فرمول زیر استفاده کنید:
$$ x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a} $$
سپس مقدار $x$ را محاسبه کنید.
```

**Output**:
```typescript
{
  cleanContent: "برای حل این معادله از فرمول زیر استفاده کنید:\n\n[فرمول 1]\n\nسپس مقدار [فرمول 2] را محاسبه کنید.",
  extractedFormulas: [
    "\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}",
    "x"
  ]
}
```

### Validation

```typescript
private isValidLatex(formula: string): boolean {
  // Check minimum length
  if (formula.length < 3) return false;

  // Check balanced braces
  let balance = 0;
  for (const char of formula) {
    if (char === '{') balance++;
    if (char === '}') balance--;
    if (balance < 0) return false;
  }
  if (balance !== 0) return false;

  // Blacklist dangerous commands
  const blacklist = ['\\input', '\\include', '\\write', '\\read'];
  for (const command of blacklist) {
    if (formula.includes(command)) return false;
  }

  return true;
}
```

## Error Handling

### Error Types

| Error | Code | HTTP Status | Cause |
|-------|------|-------------|-------|
| `AI_VALIDATION` | 400 | Bad Request | Invalid input parameters |
| `AI_INVALID_RESPONSE` | 500 | Internal Error | Empty AI response |
| `AI_TIMEOUT` | 504 | Gateway Timeout | 30s timeout exceeded |
| `AI_QUOTA_EXCEEDED` | 429 | Too Many Requests | API quota limit |
| `AI_SAFETY_BLOCKED` | 400 | Bad Request | Content filtered |
| `AI_SERVICE_ERROR` | 503 | Service Unavailable | API failure |

### Error Handling Flow

```typescript
try {
  const response = await client.chat.completions.create({...});
} catch (err) {
  if (err.name === 'AbortError') {
    throw new AppError('AI_TIMEOUT', 504, true);
  }
  if (err.message?.includes('quota')) {
    throw new AppError('AI_QUOTA_EXCEEDED', 429, true);
  }
  if (err.message?.includes('safety')) {
    throw new AppError('AI_SAFETY_BLOCKED', 400, true);
  }
  throw new AppError('AI_SERVICE_ERROR', 503, true);
}
```

## Usage Examples

### Basic Chat

```typescript
const messages = [
  { role: 'user', content: 'چگونه مشتق تابع f(x)=x^2 را حساب کنیم؟' }
];

const response = await aiService.generateResponse(
  messages,
  'حسابان',
  'ریاضی فیزیک'
);

console.log(response.content);
// "برای مشتق گرفتن از f(x)=x^2، از قاعده توان استفاده می‌کنیم:
// $$ \\frac{d}{dx}[x^n] = nx^{n-1} $$
// بنابراین: $$ f'(x) = 2x $$
```

### With Image

```typescript
const image = {
  data: base64EncodedImage,
  mimeType: 'image/png'
};

const response = await aiService.generateResponse(
  messages,
  'هندسه تحلیلی',
  'ریاضی فیزیک',
  image
);
```

## Rate Limits & Quotas

**Not explicitly defined in repository** - Check GapGPT API dashboard for current limits.

## Performance Monitoring

**Logged Metrics**:

```typescript
logger.info({
  tokensUsed: number,
  modelVersion: string,
  subject: string,
  hasImage: boolean,
  processingTimeMs: number,
  costEth: tokensUsed * 0.00001
}, 'AI Generation Complete');
```

## Frontend Integration

**File**: `src/components/ChatInterface.tsx`

```typescript
// Send message to API
const response = await api.post(`/chat/${conversationId}/message`, {
  content: userMessage,
  image?: base64Image
});

// Display AI response
setMessages(response.data.data);
```

## Related Files

| File | Purpose |
|------|---------|
| `backend/src/services/ai.service.ts` | AI service implementation |
| `backend/src/prompts/tutor.system.ts` | System prompt template |
| `backend/src/services/chat.service.ts` | Chat service using AI |
| `src/components/ChatInterface.tsx` | Frontend chat UI |
