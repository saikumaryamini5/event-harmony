import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { useLogStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Radio, Wifi, WifiOff, AlertCircle } from 'lucide-react';

const statusConfig = {
  active: { icon: Wifi, label: 'Active', className: 'text-severity-info' },
  inactive: { icon: WifiOff, label: 'Inactive', className: 'text-muted-foreground' },
  error: { icon: AlertCircle, label: 'Error', className: 'text-severity-error' },
};

const typeLabels: Record<string, string> = {
  syslog: 'Syslog',
  application: 'Application',
  cloudwatch: 'CloudWatch',
  gcp: 'GCP Logging',
  kubernetes: 'Kubernetes',
  http: 'HTTP API',
  file: 'File Upload',
};

export default function SourcesPage() {
  const { sources } = useLogStore();

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Log Sources</h1>
          <p className="text-sm text-muted-foreground">Connected log ingestion sources and their status</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sources.map(source => {
            const status = statusConfig[source.status];
            const StatusIcon = status.icon;
            return (
              <Card key={source.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                      <Radio className="w-4 h-4 text-primary" />
                    </div>
                    <div className={cn('flex items-center gap-1 text-xs', status.className)}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground">{source.name}</p>
                  <p className="text-xs text-muted-foreground mb-3">{typeLabels[source.type]}</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{source.logCount.toLocaleString()} logs</span>
                    <span>Last seen {Math.round((Date.now() - source.lastSeen.getTime()) / 60000)}m ago</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
