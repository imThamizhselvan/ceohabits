import { Lock } from 'lucide-react';
import type { Achievement, UserAchievement } from '../../types/gamification';
import { cn } from '../../lib/utils';

interface AchievementCardProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  currentProgress?: number;
}

const rarityConfig: Record<string, { label: string; color: string; bg: string; glow: string }> = {
  common: { label: 'Common', color: '#60a5fa', bg: '#60a5fa15', glow: '' },
  rare: { label: 'Rare', color: '#818cf8', bg: '#818cf815', glow: 'rarity-rare' },
  epic: { label: 'Epic', color: '#c084fc', bg: '#c084fc15', glow: 'rarity-epic' },
  legendary: { label: 'Legendary', color: '#fbbf24', bg: '#fbbf2415', glow: 'rarity-legendary' },
};

export function AchievementCard({ achievement, userAchievement, currentProgress }: AchievementCardProps) {
  const rarity = rarityConfig[achievement.rarity] ?? rarityConfig.common;
  const isUnlocked = !!userAchievement;
  const progressPct = currentProgress !== undefined
    ? Math.min(100, Math.round((currentProgress / achievement.condition_value) * 100))
    : undefined;

  return (
    <div
      className={cn(
        'relative p-4 rounded-xl border transition-all',
        isUnlocked ? rarity.glow : '',
        !isUnlocked && 'opacity-70'
      )}
      style={{
        borderColor: isUnlocked ? rarity.color + '60' : 'hsl(var(--border))',
        backgroundColor: isUnlocked ? rarity.bg : 'hsl(var(--card))',
      }}
    >
      {!isUnlocked && (
        <div className="absolute top-3 right-3">
          <Lock className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
        </div>
      )}

      <div className="flex flex-col items-center text-center gap-2">
        <span className={cn('text-3xl', !isUnlocked && 'grayscale opacity-50')}>🏆</span>
        <div>
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: isUnlocked ? rarity.color : 'hsl(var(--muted-foreground))' }}
          >
            {rarity.label}
          </span>
          <p className="font-semibold text-sm text-[hsl(var(--foreground))]">{achievement.name}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 leading-relaxed">
            {achievement.description}
          </p>
        </div>

        {achievement.xp_reward > 0 && (
          <span className={cn('text-xs font-bold', isUnlocked ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--muted-foreground))]')}>
            +{achievement.xp_reward} XP
          </span>
        )}

        {isUnlocked && userAchievement && (
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {new Date(userAchievement.earned_at).toLocaleDateString()}
          </span>
        )}

        {/* Progress bar for locked achievements */}
        {!isUnlocked && progressPct !== undefined && (
          <div className="w-full mt-1">
            <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))] mb-1">
              <span>{currentProgress?.toLocaleString()}</span>
              <span>{achievement.condition_value.toLocaleString()}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[hsl(var(--secondary))] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  backgroundColor: rarity.color,
                }}
              />
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{progressPct}% there</p>
          </div>
        )}
      </div>
    </div>
  );
}
