import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useLogStore } from '@/lib/store';
import { AlertTriangle, Bell, TrendingUp, Search as SearchIcon } from 'lucide-react';

const conditionIcons = {
  error_spike: TrendingUp,
  pattern_match: SearchIcon,
  anomaly: AlertTriangle,
  threshold: Bell,
};

const conditionLabels = {
  error_spike: 'Error Spike',
  pattern_match: 'Pattern Match',
  anomaly: 'Anomaly Detection',
  threshold: 'Threshold',
};

export default function AlertsPage() {
  const { alerts, toggleAlert } = useLogStore();

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Alerts</h1>
          <p className="text-sm text-muted-foreground">Monitor patterns and receive notifications on anomalies</p>
        </div>

        <div className="space-y-3">
          {alerts.map(alert => {
            const Icon = conditionIcons[alert.condition];
            return (
              <Card key={alert.id} className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-4">
                  <Switch checked={alert.enabled} onCheckedChange={() => toggleAlert(alert.id)} />
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{alert.name}</p>
                      {alert.triggered && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-severity-warning/15 text-severity-warning border border-severity-warning/30">
                          TRIGGERED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{conditionLabels[alert.condition]}{alert.threshold ? ` · Threshold: ${alert.threshold}` : ''}</p>
                  </div>
                  {alert.lastTriggered && (
                    <span className="text-xs text-muted-foreground">
                      Last: {new Date(alert.lastTriggered).toLocaleTimeString()}
                    </span>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
