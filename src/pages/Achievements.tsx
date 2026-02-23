import { useEffect, useState } from 'react';
import { useGamification } from '../hooks/useGamification';
import { AchievementCard } from '../components/gamification/AchievementCard';
import { Trophy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

const rarityOrder: Record<string, number> = {
  legendary: 0,
  epic: 1,
  rare: 2,
  common: 3,
};

interface ProgressData {
  totalCompletions: number;
  longestStreak: number;
  currentLevel: number;
  categoryTotals: Record<string, number>;
}

export function Achievements() {
  const { achievements, userAchievements, streaks, level } = useGamification();
  const { user } = useAuthStore();
  const [progress, setProgress] = useState<ProgressData | null>(null);

  const earnedIds = new Set(userAchievements.map((ua) => ua.achievement_id));
  const earned = achievements.filter((a) => earnedIds.has(a.id));
  const locked = achievements.filter((a) => !earnedIds.has(a.id));

  const sorted = [
    ...earned.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]),
    ...locked.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]),
  ];

  useEffect(() => {
    if (!user) return;
    fetchProgress();
  }, [user?.id]);

  async function fetchProgress() {
    try {
      const { data: logs } = await supabase
        .from('habit_logs')
        .select('habit_id, completed_at, habit:habits(category)')
        .eq('user_id', user!.id);

      const totalCompletions = logs?.length ?? 0;
      const longestStreak = Math.max(0, ...Object.values(streaks));

      const categoryTotals: Record<string, number> = {};
      for (const log of logs ?? []) {
        const category = (log.habit as unknown as { category: string } | null)?.category;
        if (category) categoryTotals[category] = (categoryTotals[category] ?? 0) + 1;
      }

      setProgress({ totalCompletions, longestStreak, currentLevel: level, categoryTotals });
    } catch (err) {
      console.error('Error fetching achievement progress:', err);
    }
  }

  function getProgressValue(conditionType: string): number | undefined {
    if (!progress) return undefined;
    switch (conditionType) {
      case 'total_completions': return progress.totalCompletions;
      case 'streak':            return progress.longestStreak;
      case 'level':             return progress.currentLevel;
      case 'category_health':   return progress.categoryTotals['health'] ?? 0;
      case 'category_mindful':  return progress.categoryTotals['mindfulness'] ?? 0;
      default:                  return undefined;
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Achievements</h1>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
          {earned.length} of {achievements.length} unlocked
        </p>
      </div>

      {/* Progress summary */}
      {achievements.length > 0 && (
        <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--accent)/0.2)] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[hsl(var(--accent))]" />
            </div>
            <div>
              <p className="font-semibold text-sm">Trophy Cabinet</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {Math.round((earned.length / achievements.length) * 100)}% complete
              </p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-[hsl(var(--secondary))] overflow-hidden">
            <div
              className="h-full bg-[hsl(var(--accent))] rounded-full transition-all duration-700"
              style={{ width: `${(earned.length / achievements.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {achievements.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-[hsl(var(--muted-foreground))]">Achievements are loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {sorted.map((ach) => {
            const isUnlocked = earnedIds.has(ach.id);
            const currentProgress = isUnlocked ? undefined : getProgressValue(ach.condition_type);
            return (
              <AchievementCard
                key={ach.id}
                achievement={ach}
                userAchievement={userAchievements.find((ua) => ua.achievement_id === ach.id)}
                currentProgress={currentProgress}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
