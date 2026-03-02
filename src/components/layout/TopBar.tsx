import { Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { getXPProgress, getLevelFromXP, LEVELS } from '../../lib/gamification';
import { cn } from '../../lib/utils';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { theme, toggle } = useTheme();
  const { profile } = useAuth();

  const xp = profile?.xp ?? 0;
  const level = getLevelFromXP(xp);
  const progress = getXPProgress(xp);
  const nextLevel = LEVELS.find((l) => l.level === level.level + 1);

  const avatarInitial = profile?.username?.[0]?.toUpperCase() ?? '?';

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-20 flex items-center gap-4 px-4',
        'h-[var(--topbar-height)] border-b border-[hsl(var(--border))/0.5]',
        'bg-[hsl(var(--card))/70] backdrop-blur-md',
        'lg:left-[var(--sidebar-width)] left-0'
      )}
    >
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* XP mini bar */}
      <div className="flex-1 max-w-xs hidden sm:block">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium" style={{ color: level.color }}>
            {level.icon} {level.name}
          </span>
          {nextLevel && (
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {progress.current}/{progress.needed} XP
            </span>
          )}
        </div>
        <div className="h-1.5 rounded-full bg-[hsl(var(--secondary))] overflow-hidden">
          <div
            className="h-full xp-gradient rounded-full transition-all duration-700"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* XP badge (mobile) */}
        <span className="sm:hidden text-xs font-bold text-[hsl(var(--accent))]">{xp} XP</span>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white text-sm font-bold cursor-pointer">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            avatarInitial
          )}
        </div>
      </div>
    </header>
  );
}
