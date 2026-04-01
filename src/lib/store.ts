import { useState, useCallback, useMemo } from 'react';
import { LogEntry, CorrelationRule, Alert, LogSource, CorrelatedEvent, Severity } from './types';
import { generateLogs, mockSources, mockRules, mockAlerts, correlateLogsWithRules } from './mock-data';

const initialLogs = generateLogs(300);
const initialCorrelatedEvents = correlateLogsWithRules(initialLogs, mockRules);

export function useLogStore() {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [sources] = useState<LogSource[]>(mockSources);
  const [rules, setRules] = useState<CorrelationRule[]>(mockRules);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [correlatedEvents, setCorrelatedEvents] = useState<CorrelatedEvent[]>(initialCorrelatedEvents);

  const addRule = useCallback((rule: Omit<CorrelationRule, 'id' | 'createdAt'>) => {
    const newRule: CorrelationRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdAt: new Date(),
    };
    setRules(prev => {
      const updated = [...prev, newRule];
      setCorrelatedEvents(correlateLogsWithRules(logs, updated));
      return updated;
    });
  }, [logs]);

  const toggleRule = useCallback((ruleId: string) => {
    setRules(prev => {
      const updated = prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r);
      setCorrelatedEvents(correlateLogsWithRules(logs, updated));
      return updated;
    });
  }, [logs]);

  const toggleAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, enabled: !a.enabled } : a));
  }, []);

  const metrics = useMemo(() => {
    const errorLogs = logs.filter(l => l.severity === 'error' || l.severity === 'critical');
    return {
      totalLogs: logs.length,
      logsPerMinute: Math.round(logs.length / 60),
      errorRate: parseFloat(((errorLogs.length / logs.length) * 100).toFixed(1)),
      activeAlerts: alerts.filter(a => a.triggered).length,
      activeSources: sources.filter(s => s.status === 'active').length,
      correlatedEvents: correlatedEvents.length,
    };
  }, [logs, alerts, sources, correlatedEvents]);

  return { logs, sources, rules, alerts, correlatedEvents, metrics, addRule, toggleRule, toggleAlert };
}
