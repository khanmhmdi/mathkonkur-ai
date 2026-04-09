# Monitoring

Monitoring setup and observability for MathKonkur AI.

## Logging Configuration

**File**: `backend/src/config/logger.ts`

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  } : undefined,
  base: {
    env: process.env.NODE_ENV,
    service: 'mathkonkur-backend'
  }
});

export default logger;
```

### Log Levels

| Level | Usage |
|-------|-------|
| `fatal` | Unrecoverable errors |
| `error` | Recoverable errors |
| `warn` | Warning conditions |
| `info` | Informational messages |
| `debug` | Debug information |
| `trace` | Detailed trace |

### Log Format

```json
{
  "level": 30,
  "time": 1700000000000,
  "env": "development",
  "service": "mathkonkur-backend",
  "msg": "Request completed",
  "req": {
    "method": "GET",
    "path": "/api/questions",
    "ip": "::1"
  },
  "res": {
    "statusCode": 200
  },
  "durationMs": 45
}
```

## Health Checks

### Endpoint: GET /health

**Response**:
```typescript
{
  success: true,
  data: {
    status: 'ok',
    timestamp: '2026-03-22T00:00:00.000Z',
    version: '1.0.0'
  }
}
```

### Database Health Check

**File**: `backend/src/config/database.ts`

```typescript
export async function checkDatabaseConnection(): Promise<{ connected: boolean; latencyMs: number }> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const latencyMs = Date.now() - start;
    return { connected: true, latencyMs };
  } catch (error) {
    return { connected: false, latencyMs: 0 };
  }
}
```

### Custom Health Endpoint

```typescript
// GET /health/details
app.get('/health/details', async (req, res) => {
  const dbHealth = await checkDatabaseConnection();
  
  res.json({
    status: dbHealth.connected ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbHealth.connected ? 'healthy' : 'unhealthy',
        latencyMs: dbHealth.latencyMs
      },
      ai: {
        status: 'unknown' // Check if needed
      }
    }
  });
});
```

## Metrics Collection

### Request Metrics

```typescript
// Middleware to track request metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.increment(`http.${req.method}.${req.path}.${res.statusCode}`);
    metrics.timing(`http.${req.method}.${req.path}.duration`, duration);
  });
  
  next();
});
```

### Business Metrics

```typescript
// Track user registrations
logger.info({ event: 'user_registered', userId: user.id }, 'User registered');

// Track AI requests
logger.info({
  event: 'ai_request',
  tokensUsed: response.tokensUsed,
  processingTimeMs: response.processingTimeMs
}, 'AI request completed');

// Track chat conversations
logger.info({
  event: 'conversation_created',
  conversationId: conversation.id,
  subject: conversation.subject
}, 'Conversation created');
```

### Custom Metrics

```typescript
import { Counter, Histogram, Gauge } from 'prom-client';

// Register metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status']
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'path'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

const activeUsers = new Gauge({
  name: 'active_users',
  help: 'Number of active users'
});

// Use metrics
httpRequestsTotal.inc({ method: 'GET', path: '/health', status: 200 });
```

## Alerting

### Alert Rules

| Alert | Condition | Severity |
|-------|-----------|----------|
| High Error Rate | error_rate > 5% | critical |
| Database Down | db_connected = false | critical |
| High Latency | p95 > 2s | warning |
| AI Service Down | ai_requests_failed > 10 | critical |
| Low Disk Space | disk_free < 10% | warning |

### Alert Channels

- **Slack**: #alerts-mathkonkur
- **Email**: ops-team@example.com
- **PagerDuty**: Critical alerts

## Distributed Tracing

### Request Tracing

```typescript
import { trace, SpanStatusCode } from '@opentelemetry/api';

// Create tracer
const tracer = trace.getTracer('mathkonkur-backend');

// Add tracing to request
app.use((req, res, next) => {
  const span = tracer.startSpan(`${req.method} ${req.path}`);
  
  res.on('finish', () => {
    span.setAttribute('http.status_code', res.statusCode);
    if (res.statusCode >= 400) {
      span.setStatus({ code: SpanStatusCode.ERROR });
    }
    span.end();
  });
  
  req.span = span;
  next();
});
```

### Span Example

```typescript
// Trace AI service call
const span = tracer.startSpan('ai.generateResponse');
try {
  const response = await aiService.generateResponse(messages, subject, level);
  span.setAttribute('tokens_used', response.tokensUsed);
  span.setAttribute('processing_time_ms', response.processingTimeMs);
  return response;
} catch (error) {
  span.recordException(error);
  span.setStatus({ code: SpanStatusCode.ERROR, description: error.message });
  throw error;
} finally {
  span.end();
}
```

## Log Aggregation

### Recommended Tools

| Tool | Purpose | Setup |
|------|---------|-------|
| Pino | JSON logging | Built-in |
| Loki | Log aggregation | Docker container |
| Grafana | Visualization | Docker container |
| Prometheus | Metrics | Docker container |

### Loki Configuration

```yaml
# docker-compose.yml addition
loki:
  image: grafana/loki:2.9.0
  ports:
    - "3100:3100"
  command: -config.file=/etc/loki/local-config.yaml

promtail:
  image: grafana/promtail:2.9.0
  volumes:
    - /var/log:/var/log
  command: -config.file=/etc/promtail/config.yml
```

### Grafana Dashboard

Import dashboard for MathKonkur:

```json
{
  "dashboard": {
    "title": "MathKonkur AI Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          { "expr": "rate(http_requests_total[5m])" }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          { "expr": "rate(http_requests_total{status=~'5..'}[5m])" }
        ]
      },
      {
        "title": "Response Time P95",
        "type": "graph",
        "targets": [
          { "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))" }
        ]
      }
    ]
  }
}
```

## Incident Response

### Runbook: High Error Rate

1. **Check logs**: `kubectl logs -f --tail=100`
2. **Check metrics**: Grafana dashboard
3. **Identify pattern**: Which endpoints are failing?
4. **Check dependencies**: Database, AI service
5. **Rollback** if needed
6. **Notify team**: Slack #alerts

### Runbook: Database Issues

1. **Check connection**: `SELECT 1`
2. **Check connections**: `SELECT count(*) FROM pg_stat_activity`
3. **Check slow queries**: `SELECT * FROM pg_stat_statements ORDER BY mean_time DESC`
4. **Restart** if needed
5. **Scale** if connection pool exhausted

### Runbook: AI Service Down

1. **Check API key**: Verify GAPGPT_API_KEY
2. **Check quota**: API dashboard
3. **Retry**: Exponential backoff implemented
4. **Fallback**: Use cached responses if available
5. **Notify**: GapGPT support if persistent

## On-Call Schedule

| Week | Primary | Secondary |
|------|---------|-----------|
| Week 1 | @developer1 | @developer2 |
| Week 2 | @developer2 | @developer3 |
| Week 3 | @developer3 | @developer1 |

### Escalation Path

1. Primary on-call receives alert
2. Acknowledge within 15 minutes
3. Investigate within 30 minutes
4. Escalate to secondary if unresolved after 1 hour
5. Escalate to manager if unresolved after 2 hours
