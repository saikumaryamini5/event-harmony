import { Severity } from '@/lib/types';
import { cn } from '@/lib/utils';

const severityConfig: Record<Severity, { label: string; className: string }> = {
  critical: { label: 'CRIT', className: 'bg-severity-critical/15 text-severity-critical border-severity-critical/30' },
  error: { label: 'ERR', className: 'bg-severity-error/15 text-severity-error border-severity-error/30' },
  warning: { label: 'WARN', className: 'bg-severity-warning/15 text-severity-warning border-severity-warning/30' },
  info: { label: 'INFO', className: 'bg-severity-info/15 text-severity-info border-severity-info/30' },
  debug: { label: 'DBG', className: 'bg-severity-debug/15 text-severity-debug border-severity-debug/30' },
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const config = severityConfig[severity];
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold border', config.className, className)}>
      {config.label}
    </span>
  );
}
