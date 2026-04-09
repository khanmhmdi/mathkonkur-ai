# Performance

Performance optimization guidelines for MathKonkur AI.

## Performance Metrics

### Response Time Targets

| Endpoint | Target P95 | Target P99 |
|----------|------------|------------|
| `/health` | < 50ms | < 100ms |
| `/api/auth/*` | < 200ms | < 500ms |
| `/api/questions` | < 300ms | < 500ms |
| `/api/chat` | < 1000ms | < 2000ms |
| AI responses | < 5000ms | < 10000ms |

### Throughput Targets

| Environment | Requests/Second |
|--------------|-----------------|
| Development | 10 RPS |
| Staging | 100 RPS |
| Production | 1000 RPS |

## Backend Performance

### Database Optimization

#### Query Optimization

```typescript
// Instead of: Fetch all and filter in JS
const questions = await prisma.question.findMany();
const filtered = questions.filter(q => q.level === 'آسان');

// Use: Database-level filtering
const questions = await prisma.question.findMany({
  where: { level: 'آسان' }
});
```

#### Pagination

```typescript
// Use cursor-based pagination for large datasets
const questions = await prisma.question.findMany({
  take: 20,
  cursor: { id: lastId },
  orderBy: { id: 'asc' }
});
```

#### Index Usage

Ensure queries use indexes:

```sql
-- Good: Uses index
SELECT * FROM questions WHERE subject = 'جبر و توابع' AND level = 'متوسط';

-- Bad: Full table scan
SELECT * FROM questions WHERE text ILIKE '%معادله%';
```

### Connection Pooling

**Prisma uses connection pooling by default**.

Configuration in `backend/prisma/schema.prisma`:

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}
```

Environment variable:
```bash
DATABASE_URL="postgresql://user:password@host:5432/db?connection_limit=20"
```

### Caching Strategy

#### Redis Caching

```typescript
// Pseudo-code for caching
async function getQuestions(filters) {
  const cacheKey = `questions:${JSON.stringify(filters)}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  const questions = await prisma.question.findMany({ where: filters });
  
  await redis.setex(cacheKey, 300, JSON.stringify(questions)); // 5 min TTL
  return questions;
}
```

#### In-Memory Caching

```typescript
// Simple in-memory cache
const cache = new Map();

function getCached(key) {
  const item = cache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.value;
  }
  cache.delete(key);
  return null;
}

function setCache(key, value, ttlMs = 60000) {
  cache.set(key, { value, expiry: Date.now() + ttlMs });
}
```

### API Response Optimization

#### Response Compression

```typescript
// Express compression middleware
import compression from 'compression';
app.use(compression());
```

#### Selective Field Selection

```typescript
// Instead of returning all fields
await prisma.question.findMany();

// Return only needed fields
await prisma.question.findMany({
  select: {
    id: true,
    text: true,
    subject: true,
    level: true
  }
});
```

## Frontend Performance

### Bundle Optimization

#### Code Splitting

```typescript
// Lazy load components
const ChatInterface = lazy(() => import('./components/ChatInterface'));
const QuestionBank = lazy(() => import('./components/QuestionBank'));

// Use in routes
<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/bank" element={<QuestionBank />} />
  </Routes>
</Suspense>
```

#### Tree Shaking

Ensure imports are side-effect-free:

```typescript
// Good: Named import
import { Sigma } from 'lucide-react';
<Sigma />;

// Bad: Default import (can't tree shake)
import Logo from 'lucide-react';
<Logo />;
```

### Image Optimization

```typescript
// Use WebP format
<img src="image.webp" alt="..." />

// Lazy load images
<img loading="lazy" src="image.jpg" alt="..." />

// Responsive images
<img 
  srcset="image-320.jpg 320w, image-640.jpg 640w"
  sizes="(max-width: 640px) 100vw, 640px"
  src="image-640.jpg"
/>
```

### React Performance

#### Memoization

```typescript
import { memo, useMemo } from 'react';

const QuestionCard = memo(({ question, onAskAI }) => {
  return (
    <div className="question-card">
      <h3>{question.text}</h3>
      <button onClick={() => onAskAI(question)}>Ask AI</button>
    </div>
  );
});

// Memoize expensive calculations
function QuestionList({ questions }) {
  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => b.createdAt - a.createdAt);
  }, [questions]);
  
  return sortedQuestions.map(q => <QuestionCard key={q.id} question={q} />);
}
```

#### Virtualization

For long lists, use windowing:

```typescript
import { FixedSizeList } from 'react-window';

function QuestionList({ questions }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={questions.length}
      itemSize={100}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <QuestionCard question={questions[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

## AI Service Performance

### Request Optimization

#### Batch Requests

Instead of multiple individual requests:

```typescript
// Bad: Multiple requests
for (const question of questions) {
  await aiService.generateResponse([question]);
}

// Good: Batch processing (if API supports)
const responses = await aiService.batchGenerate(questions);
```

#### Streaming Responses

For long AI responses, implement streaming:

```typescript
// Frontend streaming
async function* streamChat(message) {
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    body: JSON.stringify({ message })
  });
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    yield chunk;
  }
}
```

### Timeout Configuration

**File**: `backend/src/services/ai.service.ts`

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s

const response = await client.chat.completions.create({
  model: 'gapgpt-qwen-3.5',
  messages: apiMessages,
  max_tokens: 2048
}, {
  signal: controller.signal
});

clearTimeout(timeoutId);
```

## Monitoring Performance

### Response Time Tracking

```typescript
// Add to request logging
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration
    }, 'Request completed');
  });
  
  next();
});
```

### Database Query Logging

```typescript
// In development, log queries
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    console.log(`[PRISMA] Query: ${e.query} | Duration: ${e.duration}ms`);
  });
}
```

### Performance Budgets

| Metric | Budget | Warning Threshold |
|--------|--------|-------------------|
| First Contentful Paint | < 1s | 1.5s |
| Largest Contentful Paint | < 2.5s | 3s |
| Time to Interactive | < 3s | 4s |
| Cumulative Layout Shift | < 0.1 | 0.25 |
| API Response Time P95 | < 500ms | 1000ms |
