import type { Level, XPProgress, Achievement } from '../types/gamification';

export const LEVELS: Level[] = [
  { level: 1, name: 'Spark',      xpRequired: 0,     icon: '✦',  color: '#94a3b8' },
  { level: 2, name: 'Ember',      xpRequired: 100,   icon: '🔥', color: '#60a5fa' },
  { level: 3, name: 'Glow',       xpRequired: 300,   icon: '💫', color: '#34d399' },
  { level: 4, name: 'Radiance',   xpRequired: 700,   icon: '⭐', color: '#a78bfa' },
  { level: 5, name: 'Beacon',     xpRequired: 1500,  icon: '🔆', color: '#f472b6' },
  { level: 6, name: 'Luminary',   xpRequired: 3000,  icon: '🌟', color: '#fb923c' },
  { level: 7, name: 'Nova',       xpRequired: 6000,  icon: '🌠', color: '#e879f9' },
  { level: 8, name: 'Lumen',      xpRequired: 10000, icon: '✨', color: '#fbbf24' },
];

export const XP_REWARDS: Record<string, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
};

export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2.0;
  if (streak >= 14) return 1.5;
  if (streak >= 7) return 1.25;
  if (streak >= 3) return 1.1;
  return 1.0;
}

export function calculateXP(difficulty: string, streak: number): number {
  const base = XP_REWARDS[difficulty] ?? 25;
  const multiplier = getStreakMultiplier(streak);
  return Math.round(base * multiplier);
}

export function getLevelFromXP(totalXP: number): Level {
  return [...LEVELS].reverse().find(l => totalXP >= l.xpRequired) ?? LEVELS[0];
}

export function getXPProgress(totalXP: number): XPProgress {
  const currentLevel = getLevelFromXP(totalXP);
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);

  if (!nextLevel) {
    return { current: totalXP - currentLevel.xpRequired, needed: 0, percentage: 100 };
  }

  const xpIntoLevel = totalXP - currentLevel.xpRequired;
  const xpForThisLevel = nextLevel.xpRequired - currentLevel.xpRequired;

  return {
    current: xpIntoLevel,
    needed: xpForThisLevel,
    percentage: Math.min(100, Math.round((xpIntoLevel / xpForThisLevel) * 100)),
  };
}

export interface AchievementContext {
  totalCompletions: number;
  longestStreak: number;
  currentLevel: number;
  categoryTotals: Record<string, number>;
  alreadyEarned: string[];
  allAchievements: Achievement[];
}

export function checkAchievements(context: AchievementContext): Achievement[] {
  return context.allAchievements.filter(ach => {
    if (context.alreadyEarned.includes(ach.id)) return false;

    switch (ach.condition_type) {
      case 'total_completions':
        return context.totalCompletions >= ach.condition_value;
      case 'streak':
        return context.longestStreak >= ach.condition_value;
      case 'level':
        return context.currentLevel >= ach.condition_value;
      case 'category_health':
        return (context.categoryTotals['health'] ?? 0) >= ach.condition_value;
      case 'category_mindful':
        return (context.categoryTotals['mindfulness'] ?? 0) >= ach.condition_value;
      default:
        return false;
    }
  });
}

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

export function isStreakMilestone(streak: number): boolean {
  return STREAK_MILESTONES.includes(streak);
}
