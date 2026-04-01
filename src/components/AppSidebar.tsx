import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ScrollText, GitBranch, Bell, Settings, Radio, Search } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/logs', icon: ScrollText, label: 'Logs' },
  { to: '/correlations', icon: GitBranch, label: 'Correlations' },
  { to: '/rules', icon: Settings, label: 'Rules' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/sources', icon: Radio, label: 'Sources' },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="w-16 lg:w-56 bg-card border-r border-border flex flex-col shrink-0 h-screen sticky top-0">
      <div className="p-3 lg:p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Search className="w-4 h-4 text-primary" />
          </div>
          <span className="hidden lg:block text-sm font-semibold text-foreground tracking-tight">LogCorr</span>
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(item => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-[10px] text-primary font-bold">A</span>
          </div>
          <span className="hidden lg:block text-xs text-muted-foreground">Admin</span>
        </div>
      </div>
    </aside>
  );
}
