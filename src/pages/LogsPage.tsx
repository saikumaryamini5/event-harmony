import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { SeverityBadge } from '@/components/SeverityBadge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLogStore } from '@/lib/store';
import { Severity } from '@/lib/types';
import { Search, Filter } from 'lucide-react';

export default function LogsPage() {
  const { logs } = useLogStore();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const uniqueSources = useMemo(() => [...new Set(logs.map(l => l.source))], [logs]);

  const filtered = useMemo(() => {
    return logs.filter(log => {
      if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
      if (sourceFilter !== 'all' && log.source !== sourceFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return log.message.toLowerCase().includes(q) ||
          log.host.toLowerCase().includes(q) ||
          (log.requestId?.toLowerCase().includes(q) ?? false) ||
          (log.ip?.toLowerCase().includes(q) ?? false);
      }
      return true;
    });
  }, [logs, search, severityFilter, sourceFilter]);

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Log Explorer</h1>
          <p className="text-sm text-muted-foreground">Search and filter across all ingested logs</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search logs by message, host, request ID, IP..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[140px] bg-card border-border">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              {(['critical', 'error', 'warning', 'info', 'debug'] as Severity[]).map(s => (
                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[160px] bg-card border-border">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {uniqueSources.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground">{filtered.length} logs found</div>

        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/50 border-b border-border">
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Time</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Severity</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Source</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Host</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Message</th>
                  <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Request ID</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map(log => (
                  <tr key={log.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-3 py-2 text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-3 py-2"><SeverityBadge severity={log.severity} /></td>
                    <td className="px-3 py-2 text-xs text-foreground">{log.source}</td>
                    <td className="px-3 py-2 text-xs font-mono text-muted-foreground">{log.host}</td>
                    <td className="px-3 py-2 text-xs text-foreground max-w-md truncate">{log.message}</td>
                    <td className="px-3 py-2 text-xs font-mono text-primary/70">{log.requestId || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
