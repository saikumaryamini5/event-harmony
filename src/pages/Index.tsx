import { useMemo, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { MetricCard } from '@/components/MetricCard';
import { SeverityBadge } from '@/components/SeverityBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogStore } from '@/lib/store';
import { generateVolumeData, generateErrorRateData } from '@/lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, AlertTriangle, Database, Radio, GitBranch, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { metrics, logs, alerts, correlatedEvents } = useLogStore();
  const volumeData = useMemo(() => generateVolumeData(), []);
  const errorRateData = useMemo(() => generateErrorRateData(), []);

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time log monitoring and correlation overview</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <MetricCard title="Total Logs" value={metrics.totalLogs.toLocaleString()} icon={Database} accentClass="text-primary" />
          <MetricCard title="Logs/Min" value={metrics.logsPerMinute} icon={Activity} accentClass="text-severity-info" />
          <MetricCard title="Error Rate" value={`${metrics.errorRate}%`} icon={TrendingUp} accentClass="text-severity-error" />
          <MetricCard title="Active Alerts" value={metrics.activeAlerts} icon={AlertTriangle} accentClass="text-severity-warning" />
          <MetricCard title="Sources" value={metrics.activeSources} icon={Radio} accentClass="text-severity-info" />
          <MetricCard title="Correlated" value={metrics.correlatedEvents} icon={GitBranch} accentClass="text-accent" />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Log Volume (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={volumeData}>
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }} />
                  <Bar dataKey="info" stackId="a" fill="hsl(var(--chart-1))" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="warning" stackId="a" fill="hsl(var(--chart-3))" />
                  <Bar dataKey="error" stackId="a" fill="hsl(var(--chart-5))" />
                  <Bar dataKey="critical" stackId="a" fill="hsl(var(--severity-critical))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Error Rate (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={errorRateData}>
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="rate" stroke="hsl(var(--severity-error))" fill="hsl(var(--severity-error) / 0.15)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.filter(a => a.triggered).map(alert => (
                <div key={alert.id} className="flex items-center gap-3 p-2 rounded-md bg-secondary/50">
                  <AlertTriangle className="w-4 h-4 text-severity-warning shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{alert.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {alert.lastTriggered && new Date(alert.lastTriggered).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent Correlated Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {correlatedEvents.slice(0, 4).map(event => (
                <div key={event.id} className="flex items-center gap-3 p-2 rounded-md bg-secondary/50">
                  <SeverityBadge severity={event.severity} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{event.ruleName}</p>
                    <p className="text-xs text-muted-foreground">{event.logs.length} logs correlated</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {Object.values(event.sharedValues).join(', ')}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
