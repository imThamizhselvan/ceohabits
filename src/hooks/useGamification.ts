import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useGameStore } from '../store/useGameStore';
import { useAuthStore } from '../store/useAuthStore';
import { useHabitStore } from '../store/useHabitStore';
import {
  calculateXP,
  checkAchievements,
  getLevelFromXP,
  isStreakMilestone,
} from '../lib/gamification';
import type { Achievement, UserAchievement } from '../types/gamification';
import type { HabitFrequency } from '../types/habit';

export function useGamification() {
  const store = useGameStore();
  const { user, profile, setProfile } = useAuthStore();

  useEffect(() => {
    if (!user) return;
    fetchGameData();
  }, [user?.id]);

  // Award daily login bonus once per calendar day, triggered after profile loads
  useEffect(() => {
    if (!user || !profile) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const lastLogin = localStorage.getItem('habit-last-login');
    if (lastLogin === todayStr) return;
    localStorage.setItem('habit-last-login', todayStr);
    awardDailyLoginBonus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, !!profile]);

  async function fetchGameData() {
    if (!user) return;
    try {
      const [achievementsRes, userAchievementsRes] = await Promise.all([
        supabase.from('achievements').select('*'),
        supabase
          .from('user_achievements')
          .select('*, achievement:achievements(*)')
          .eq('user_id', user.id),
      ]);

      if (achievementsRes.data) store.setAchievements(achievementsRes.data as Achievement[]);
      if (userAchievementsRes.data) store.setUserAchievements(userAchievementsRes.data as UserAchievement[]);

      // Load all streaks
      const { data: logs } = await supabase
        .from('habit_logs')
        .select('habit_id, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (logs) {
        const habits = useHabitStore.getState().habits;
        const streakMap = computeStreaks(logs, habits);
        store.setStreaks(streakMap);
      }
    } catch (err) {
      console.error('Error fetching game data:', err);
    }
  }

  async function awardDailyLoginBonus() {
    if (!user || !profile) return;
    const DAILY_BONUS = 5;
    const newXP = (profile.xp ?? 0) + DAILY_BONUS;
    try {
      const { data } = await supabase
        .from('profiles')
        .update({ xp: newXP, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();
      if (data) {
        setProfile(data);
        store.setXP(data.xp);
      }
    } catch (err) {
      console.error('Error awarding daily login bonus:', err);
    }
  }

  function computeStreaks(
    logs: { habit_id: string; completed_at: string }[],
    habits: { id: string; frequency: HabitFrequency }[] = []
  ) {
    const byHabit: Record<string, string[]> = {};
    for (const log of logs) {
      if (!byHabit[log.habit_id]) byHabit[log.habit_id] = [];
      byHabit[log.habit_id].push(log.completed_at);
    }

    const streaks: Record<string, number> = {};
    for (const [habitId, dates] of Object.entries(byHabit)) {
      const habit = habits.find((h) => h.id === habitId);
      const frequency = habit?.frequency ?? 'daily';
      streaks[habitId] = computeStreak(dates, frequency);
    }
    return streaks;
  }

  function computeStreak(dates: string[], frequency: HabitFrequency): number {
    if (dates.length === 0) return 0;
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (frequency === 'daily') {
      let streak = 0;
      for (let i = 0; i < sorted.length; i++) {
        const expected = new Date(today);
        expected.setDate(expected.getDate() - i);
        const expectedStr = expected.toISOString().split('T')[0];
        if (sorted[i] === expectedStr) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    }

    if (frequency === 'weekdays') {
      // Build list of expected weekdays backwards from today
      const logSet = new Set(sorted);
      let streak = 0;
      const ptr = new Date(today);
      let checked = 0;
      while (checked < sorted.length + 14) {
        const day = ptr.getDay();
        if (day !== 0 && day !== 6) {
          const dateStr = ptr.toISOString().split('T')[0];
          if (logSet.has(dateStr)) {
            streak++;
          } else {
            // Allow today to be incomplete (hasn't happened yet today)
            const isToday = dateStr === today.toISOString().split('T')[0];
            if (!isToday) break;
          }
        }
        ptr.setDate(ptr.getDate() - 1);
        checked++;
      }
      return streak;
    }

    if (frequency === 'weekly') {
      // Check consecutive calendar weeks (Mon–Sun) for at least one log
      let streak = 0;
      const weekStart = new Date(today);
      // Go to Monday of current week
      weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));

      for (let w = 0; w < 52; w++) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const start = weekStart.toISOString().split('T')[0];
        const end = weekEnd.toISOString().split('T')[0];
        const foundInWeek = sorted.some((d) => d >= start && d <= end);

        if (foundInWeek) {
          streak++;
        } else {
          // Skip current (incomplete) week only for the first iteration
          if (w === 0) {
            weekStart.setDate(weekStart.getDate() - 7);
            continue;
          }
          break;
        }
        weekStart.setDate(weekStart.getDate() - 7);
      }
      return streak;
    }

    return 0;
  }

  async function awardXP(habitId: string, difficulty: string) {
    if (!user || !profile) return;

    const currentStreak = store.streaks[habitId] ?? 0;
    const newStreak = currentStreak + 1;
    const xpEarned = calculateXP(difficulty, currentStreak);

    // Update streak
    store.setStreak(habitId, newStreak);

    // Check streak milestone
    if (isStreakMilestone(newStreak)) {
      // Will be shown via StreakCelebration triggered by parent
    }

    const newTotalXP = (profile.xp ?? 0) + xpEarned;
    const oldLevel = getLevelFromXP(profile.xp ?? 0);
    const newLevel = getLevelFromXP(newTotalXP);

    // Update profile in Supabase
    const updates: { xp: number; level?: number; updated_at: string } = {
      xp: newTotalXP,
      updated_at: new Date().toISOString(),
    };

    if (newLevel.level > oldLevel.level) {
      updates.level = newLevel.level;
      store.setPendingLevelUp(newLevel.level);
    }

    const { data: updatedProfile } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (updatedProfile) {
      setProfile(updatedProfile);
      store.setXP(updatedProfile.xp);
      store.setLevel(updatedProfile.level);
    }

    // Check achievements
    await checkAndUnlockAchievements(newTotalXP, newLevel.level);

    return { xpEarned, newStreak };
  }

  async function checkAndUnlockAchievements(totalXP: number, currentLevel: number) {
    if (!user) return;

    try {
      const { data: logsData } = await supabase
        .from('habit_logs')
        .select('habit_id, xp_earned, completed_at, habit:habits(category)')
        .eq('user_id', user.id);

      const totalCompletions = logsData?.length ?? 0;
      const longestStreak = Math.max(0, ...Object.values(store.streaks));

      const categoryTotals: Record<string, number> = {};
      for (const log of logsData ?? []) {
        const habitData = log.habit as unknown as { category: string } | null;
        const category = habitData?.category;
        if (category) {
          categoryTotals[category] = (categoryTotals[category] ?? 0) + 1;
        }
      }
      const alreadyEarned = store.userAchievements.map((ua) => ua.achievement_id);

      const newAchievements = checkAchievements({
        totalCompletions,
        longestStreak,
        currentLevel,
        categoryTotals,
        alreadyEarned,
        allAchievements: store.achievements,
      });

      for (const ach of newAchievements) {
        const { data: ua } = await supabase
          .from('user_achievements')
          .insert([{ user_id: user.id, achievement_id: ach.id }])
          .select('*, achievement:achievements(*)')
          .single();

        if (ua) {
          store.addUserAchievement(ua as UserAchievement);
          store.addPendingAchievement(ach);

          // Also award XP for the achievement
          if (ach.xp_reward > 0) {
            await supabase
              .from('profiles')
              .update({ xp: totalXP + ach.xp_reward, updated_at: new Date().toISOString() })
              .eq('id', user.id);
          }
        }
      }
    } catch (err) {
      console.error('Error checking achievements:', err);
    }
  }

  return {
    xp: profile?.xp ?? 0,
    level: profile?.level ?? 1,
    streaks: store.streaks,
    achievements: store.achievements,
    userAchievements: store.userAchievements,
    pendingLevelUp: store.pendingLevelUp,
    pendingAchievements: store.pendingAchievements,
    clearPendingLevelUp: () => store.setPendingLevelUp(null),
    clearPendingAchievements: store.clearPendingAchievements,
    awardXP,
    refetch: fetchGameData,
  };
}
