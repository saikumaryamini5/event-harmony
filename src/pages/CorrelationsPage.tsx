import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { SeverityBadge } from '@/components/SeverityBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogStore } from '@/lib/store';
import { GitBranch, ChevronDown, ChevronRight } from 'lucide-react';

export default function CorrelationsPage() {
  const { correlatedEvents } = useLogStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Correlated Events</h1>
          <p className="text-sm text-muted-foreground">Events grouped by correlation rules with timeline view</p>
        </div>

        {correlatedEvents.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No correlated events found. Enable rules to start correlating logs.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {correlatedEvents.map(event => {
              const isExpanded = expanded === event.id;
              const durationMs = event.endTime.getTime() - event.startTime.getTime();
              const durationStr = durationMs < 1000 ? `${durationMs}ms` : `${(durationMs / 1000).toFixed(1)}s`;

              return (
                <Card key={event.id} className="bg-card border-border overflow-hidden">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : event.id)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-secondary/30 transition-colors"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    <SeverityBadge severity={event.severity} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground">{event.ruleName}</span>
                      <span className="text-xs text-muted-foreground ml-3">{event.logs.length} logs · {durationStr}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      {Object.entries(event.sharedValues).map(([k, v]) => (
                        <span key={k} className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono">
                          {k}={v}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {event.startTime.toLocaleTimeString()}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border">
                      {/* Timeline visualization */}
                      <div className="px-4 py-3 space-y-1">
                        {event.logs.map((log, i) => (
                          <div key={log.id} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                              {i < event.logs.length - 1 && <div className="w-px h-6 bg-border" />}
                            </div>
                            <div className="flex-1 flex items-start gap-2 pb-1">
                              <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap mt-0.5">
                                {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                              <SeverityBadge severity={log.severity} className="mt-0.5" />
                              <span className="text-xs text-foreground">{log.message}</span>
                              <span className="text-[10px] text-muted-foreground font-mono ml-auto">{log.source}/{log.host}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
