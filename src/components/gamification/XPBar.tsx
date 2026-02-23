import { motion } from 'framer-motion';
import { getXPProgress, getLevelFromXP, LEVELS } from '../../lib/gamification';

interface XPBarProps {
  xp: number;
  className?: string;
}

export function XPBar({ xp, className = '' }: XPBarProps) {
  const level = getLevelFromXP(xp);
  const progress = getXPProgress(xp);
  const nextLevel = LEVELS.find((l) => l.level === level.level + 1);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{level.icon}</span>
          <div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Current Rank</p>
            <p className="font-bold text-base" style={{ color: level.color }}>{level.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Total XP</p>
          <p className="font-bold text-lg text-[hsl(var(--accent))]">{xp.toLocaleString()}</p>
        </div>
      </div>

      <div className="relative">
        <div className="h-3 rounded-full bg-[hsl(var(--secondary))] overflow-hidden">
          <motion.div
            className="h-full xp-gradient rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div
          className="absolute -top-0.5 h-4 w-4 rounded-full border-2 border-white shadow-md xp-gradient transition-all duration-1000"
          style={{ left: `calc(${progress.percentage}% - 8px)` }}
        />
      </div>

      <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
        <span>{progress.current} XP into level</span>
        {nextLevel ? (
          <span>{progress.needed - progress.current} XP to {nextLevel.name} {nextLevel.icon}</span>
        ) : (
          <span className="text-[hsl(var(--accent))] font-semibold">MAX LEVEL 👑</span>
        )}
      </div>
    </div>
  );
}
