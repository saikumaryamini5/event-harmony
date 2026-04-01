export type Severity = 'critical' | 'error' | 'warning' | 'info' | 'debug';

export interface LogSource {
  id: string;
  name: string;
  type: 'syslog' | 'application' | 'cloudwatch' | 'gcp' | 'kubernetes' | 'http' | 'file';
  status: 'active' | 'inactive' | 'error';
  lastSeen: Date;
  logCount: number;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  source: string;
  sourceType: LogSource['type'];
  host: string;
  severity: Severity;
  message: string;
  metadata: Record<string, string>;
  requestId?: string;
  userId?: string;
  ip?: string;
}

export interface CorrelationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: {
    sharedFields: string[];
    timeWindowSeconds: number;
    minEvents: number;
    severityFilter?: Severity[];
    sourceFilter?: string[];
  };
  createdAt: Date;
}

export interface CorrelatedEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  logs: LogEntry[];
  sharedValues: Record<string, string>;
  startTime: Date;
  endTime: Date;
  severity: Severity;
}

export interface Alert {
  id: string;
  name: string;
  condition: 'error_spike' | 'pattern_match' | 'anomaly' | 'threshold';
  threshold?: number;
  enabled: boolean;
  triggered: boolean;
  lastTriggered?: Date;
  message?: string;
}

export interface DashboardMetrics {
  totalLogs: number;
  logsPerMinute: number;
  errorRate: number;
  activeAlerts: number;
  activeSources: number;
  correlatedEvents: number;
}
