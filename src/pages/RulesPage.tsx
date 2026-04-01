import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLogStore } from '@/lib/store';
import { Severity } from '@/lib/types';
import { Plus, Settings, Clock, Layers } from 'lucide-react';

const sharedFieldOptions = ['requestId', 'ip', 'userId', 'host', 'source'];

export default function RulesPage() {
  const { rules, addRule, toggleRule } = useLogStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sharedFields, setSharedFields] = useState<string[]>(['requestId']);
  const [timeWindow, setTimeWindow] = useState('60');
  const [minEvents, setMinEvents] = useState('2');

  const handleAdd = () => {
    if (!name.trim()) return;
    addRule({
      name,
      description,
      enabled: true,
      conditions: {
        sharedFields,
        timeWindowSeconds: parseInt(timeWindow),
        minEvents: parseInt(minEvents),
      },
    });
    setName('');
    setDescription('');
    setSharedFields(['requestId']);
    setTimeWindow('60');
    setMinEvents('2');
    setOpen(false);
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Correlation Rules</h1>
            <p className="text-sm text-muted-foreground">Define rules to automatically correlate related log events</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-1" /> New Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Create Correlation Rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label className="text-muted-foreground">Rule Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Request Trace" className="bg-secondary border-border mt-1" />
                </div>
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what this rule correlates" className="bg-secondary border-border mt-1" />
                </div>
                <div>
                  <Label className="text-muted-foreground">Shared Field</Label>
                  <Select value={sharedFields[0]} onValueChange={v => setSharedFields([v])}>
                    <SelectTrigger className="bg-secondary border-border mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sharedFieldOptions.map(f => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-muted-foreground">Time Window (s)</Label>
                    <Input type="number" value={timeWindow} onChange={e => setTimeWindow(e.target.value)} className="bg-secondary border-border mt-1" />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Min Events</Label>
                    <Input type="number" value={minEvents} onChange={e => setMinEvents(e.target.value)} className="bg-secondary border-border mt-1" />
                  </div>
                </div>
                <Button onClick={handleAdd} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Create Rule</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {rules.map(rule => (
            <Card key={rule.id} className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{rule.name}</p>
                  <p className="text-xs text-muted-foreground">{rule.description}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {rule.conditions.sharedFields.join(', ')}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {rule.conditions.timeWindowSeconds}s</span>
                  <span className="flex items-center gap-1"><Settings className="w-3 h-3" /> ≥{rule.conditions.minEvents} events</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
