import { LogEntry, LogSource, CorrelationRule, CorrelatedEvent, Alert, Severity } from './types';

const hosts = ['web-prod-01', 'web-prod-02', 'api-prod-01', 'db-primary', 'cache-01', 'worker-01', 'k8s-node-1', 'k8s-node-2'];
const sources: LogSource['type'][] = ['syslog', 'application', 'cloudwatch', 'gcp', 'kubernetes', 'http'];
const sourceNames = ['nginx-proxy', 'auth-service', 'payment-api', 'user-service', 'cloudwatch-prod', 'gke-cluster', 'k8s-ingress', 'syslog-collector'];
const severities: Severity[] = ['critical', 'error', 'warning', 'info', 'debug'];
const ips = ['192.168.1.42', '10.0.3.15', '172.16.0.8', '10.0.1.200', '192.168.5.100'];
const requestIds = ['req-a1b2c3', 'req-d4e5f6', 'req-g7h8i9', 'req-j0k1l2', 'req-m3n4o5'];
const userIds = ['usr-001', 'usr-002', 'usr-003', 'usr-004', 'usr-005'];

const messages: Record<Severity, string[]> = {
  critical: [
    'Database connection pool exhausted - all connections in use',
    'OOM killer invoked on process payment-worker pid=12847',
    'TLS certificate expired for api.production.internal',
    'Disk usage exceeded 95% on /var/lib/postgresql/data',
  ],
  error: [
    'Failed to process payment: timeout after 30s',
    'Authentication failed: invalid JWT signature',
    'Connection refused to redis://cache-01:6379',
    'Unhandled exception in request handler: NullPointerException',
    'Rate limit exceeded for API key ak_prod_***',
  ],
  warning: [
    'Slow query detected: SELECT * FROM orders took 4.2s',
    'Memory usage at 82% on worker-01',
    'Retry attempt 3/5 for message queue publish',
    'Deprecated API endpoint /v1/users called',
    'SSL certificate expires in 7 days',
  ],
  info: [
    'User login successful from 192.168.1.42',
    'Deployment v2.14.3 rolled out to production',
    'Health check passed for all services',
    'Background job completed: email_batch_send (1247 emails)',
    'Cache hit ratio: 94.2% for last 5 minutes',
    'New connection from source: cloudwatch-prod',
    'Kubernetes pod scaled up: payment-api replicas 3→5',
  ],
  debug: [
    'Request headers: Accept=application/json, X-Request-ID=req-a1b2c3',
    'Query plan: Index Scan using idx_users_email',
    'WebSocket connection established for client ws-8847',
    'Feature flag evaluated: new_checkout=true for usr-001',
  ],
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLogEntry(i: number, baseTime: Date): LogEntry {
  const severity = Math.random() < 0.03 ? 'critical' : Math.random() < 0.1 ? 'error' : Math.random() < 0.25 ? 'warning' : Math.random() < 0.7 ? 'info' : 'debug';
  const offset = Math.floor(Math.random() * 3600000);
  const sourceType = randomFrom(sources);
  return {
    id: `log-${i.toString().padStart(6, '0')}`,
    timestamp: new Date(baseTime.getTime() - offset),
    source: randomFrom(sourceNames),
    sourceType,
    host: randomFrom(hosts),
    severity,
    message: randomFrom(messages[severity]),
    metadata: {
      environment: 'production',
      region: randomFrom(['us-east-1', 'eu-west-1', 'ap-southeast-1']),
      ...(Math.random() > 0.5 ? { container_id: `ctr-${Math.random().toString(36).slice(2, 10)}` } : {}),
    },
    requestId: Math.random() > 0.4 ? randomFrom(requestIds) : undefined,
    userId: Math.random() > 0.6 ? randomFrom(userIds) : undefined,
    ip: Math.random() > 0.5 ? randomFrom(ips) : undefined,
  };
}

export function generateLogs(count: number = 200): LogEntry[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => generateLogEntry(i, now))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export const mockSources: LogSource[] = sourceNames.map((name, i) => ({
  id: `src-${i}`,
  name,
  type: sources[i % sources.length],
  status: Math.random() > 0.15 ? 'active' : Math.random() > 0.5 ? 'inactive' : 'error',
  lastSeen: new Date(Date.now() - Math.floor(Math.random() * 300000)),
  logCount: Math.floor(Math.random() * 50000) + 1000,
}));

export const mockRules: CorrelationRule[] = [
  {
    id: 'rule-1',
    name: 'Request Trace Correlation',
    description: 'Group all logs sharing the same request ID within 60 seconds',
    enabled: true,
    conditions: { sharedFields: ['requestId'], timeWindowSeconds: 60, minEvents: 2 },
    createdAt: new Date(Date.now() - 86400000 * 7),
  },
  {
    id: 'rule-2',
    name: 'IP-based Security Events',
    description: 'Correlate error and critical logs from the same IP within 5 minutes',
    enabled: true,
    conditions: { sharedFields: ['ip'], timeWindowSeconds: 300, minEvents: 3, severityFilter: ['error', 'critical'] },
    createdAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: 'rule-3',
    name: 'User Session Issues',
    description: 'Group warning+ logs for the same user within 2 minutes',
    enabled: false,
    conditions: { sharedFields: ['userId'], timeWindowSeconds: 120, minEvents: 2, severityFilter: ['warning', 'error', 'critical'] },
    createdAt: new Date(Date.now() - 86400000),
  },
];

export function correlateLogsWithRules(logs: LogEntry[], rules: CorrelationRule[]): CorrelatedEvent[] {
  const events: CorrelatedEvent[] = [];
  let eventCounter = 0;

  for (const rule of rules.filter(r => r.enabled)) {
    const groups: Record<string, LogEntry[]> = {};

    for (const log of logs) {
      if (rule.conditions.severityFilter && !rule.conditions.severityFilter.includes(log.severity)) continue;

      const keyParts = rule.conditions.sharedFields.map(f => (log as any)[f]).filter(Boolean);
      if (keyParts.length !== rule.conditions.sharedFields.length) continue;
      const key = keyParts.join('|');

      if (!groups[key]) groups[key] = [];
      groups[key].push(log);
    }

    for (const [key, groupLogs] of Object.entries(groups)) {
      const sorted = groupLogs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const windowMs = rule.conditions.timeWindowSeconds * 1000;
      let windowStart = 0;

      for (let i = 0; i < sorted.length; i++) {
        while (sorted[i].timestamp.getTime() - sorted[windowStart].timestamp.getTime() > windowMs) {
          windowStart++;
        }
        const windowLogs = sorted.slice(windowStart, i + 1);
        if (windowLogs.length >= rule.conditions.minEvents && i === sorted.length - 1) {
          const sharedValues: Record<string, string> = {};
          rule.conditions.sharedFields.forEach((f, idx) => {
            sharedValues[f] = key.split('|')[idx];
          });

          const highestSeverity = (['critical', 'error', 'warning', 'info', 'debug'] as Severity[])
            .find(s => windowLogs.some(l => l.severity === s)) || 'info';

          events.push({
            id: `evt-${eventCounter++}`,
            ruleId: rule.id,
            ruleName: rule.name,
            logs: windowLogs,
            sharedValues,
            startTime: windowLogs[0].timestamp,
            endTime: windowLogs[windowLogs.length - 1].timestamp,
            severity: highestSeverity,
          });
        }
      }
    }
  }

  return events.sort((a, b) => b.endTime.getTime() - a.endTime.getTime());
}

export const mockAlerts: Alert[] = [
  { id: 'alert-1', name: 'Error Rate Spike', condition: 'error_spike', threshold: 10, enabled: true, triggered: true, lastTriggered: new Date(Date.now() - 120000), message: 'Error rate exceeded 10% in the last 5 minutes' },
  { id: 'alert-2', name: 'Critical DB Events', condition: 'pattern_match', enabled: true, triggered: false },
  { id: 'alert-3', name: 'Anomalous Login Pattern', condition: 'anomaly', enabled: true, triggered: true, lastTriggered: new Date(Date.now() - 600000), message: 'Unusual login pattern detected from IP 192.168.1.42' },
  { id: 'alert-4', name: 'High Latency Threshold', condition: 'threshold', threshold: 5000, enabled: false, triggered: false },
];

export function generateVolumeData() {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 3600000);
    data.push({
      time: hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      info: Math.floor(Math.random() * 400) + 200,
      warning: Math.floor(Math.random() * 80) + 20,
      error: Math.floor(Math.random() * 40) + 5,
      critical: Math.floor(Math.random() * 8),
    });
  }
  return data;
}

export function generateErrorRateData() {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 3600000);
    data.push({
      time: hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rate: (Math.random() * 8 + 1).toFixed(1),
    });
  }
  return data;
}
