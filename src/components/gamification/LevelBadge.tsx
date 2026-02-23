import { getLevelFromXP } from '../../lib/gamification';
import { cn } from '../../lib/utils';

interface LevelBadgeProps {
  xp: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LevelBadge({ xp, size = 'md', className }: LevelBadgeProps) {
  const level = getLevelFromXP(xp);

  const sizes = {
    sm: { wrapper: 'px-2 py-1 text-xs gap-1', icon: 'text-sm' },
    md: { wrapper: 'px-3 py-1.5 text-sm gap-1.5', icon: 'text-base' },
    lg: { wrapper: 'px-4 py-2 text-base gap-2', icon: 'text-xl' },
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-semibold border',
        sizes[size].wrapper,
        className
      )}
      style={{
        backgroundColor: `${level.color}20`,
        borderColor: `${level.color}40`,
        color: level.color,
      }}
    >
      <span className={sizes[size].icon}>{level.icon}</span>
      <span>Level {level.level} · {level.name}</span>
    </div>
  );
}
