import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListChecks, Trophy, User, CheckSquare } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/habits',       icon: ListChecks,      label: 'Habits' },
  { to: '/todos',        icon: CheckSquare,     label: 'To-Do' },
  { to: '/achievements', icon: Trophy,           label: 'Achieve' },
  { to: '/profile',      icon: User,             label: 'Profile' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden h-14 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] flex items-center safe-bottom">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/dashboard'}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-medium transition-colors',
              isActive
                ? 'text-[hsl(var(--primary))]'
                : 'text-[hsl(var(--muted-foreground))]'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
