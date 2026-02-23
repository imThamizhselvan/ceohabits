import { Flame } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md';
}

export function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  if (streak === 0) return null;

  const isMilestone = [3, 7, 14, 30, 60, 100].includes(streak);
  const isHot = streak >= 7;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs',
        isHot ? 'bg-orange-500/20 text-orange-500' : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]',
        isMilestone && 'ring-1 ring-orange-500/50'
      )}
    >
      <Flame className={cn(size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
      {streak}
    </div>
  );
}
