import { create } from 'zustand';
import type { Achievement, UserAchievement } from '../types/gamification';

interface GameState {
  xp: number;
  level: number;
  streaks: Record<string, number>;
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  pendingLevelUp: number | null;
  pendingAchievements: Achievement[];
  setXP: (xp: number) => void;
  setLevel: (level: number) => void;
  setStreaks: (streaks: Record<string, number>) => void;
  setStreak: (habitId: string, streak: number) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setUserAchievements: (userAchievements: UserAchievement[]) => void;
  setPendingLevelUp: (level: number | null) => void;
  addPendingAchievement: (achievement: Achievement) => void;
  clearPendingAchievements: () => void;
  addUserAchievement: (ua: UserAchievement) => void;
}

export const useGameStore = create<GameState>((set) => ({
  xp: 0,
  level: 1,
  streaks: {},
  achievements: [],
  userAchievements: [],
  pendingLevelUp: null,
  pendingAchievements: [],
  setXP: (xp) => set({ xp }),
  setLevel: (level) => set({ level }),
  setStreaks: (streaks) => set({ streaks }),
  setStreak: (habitId, streak) =>
    set((state) => ({ streaks: { ...state.streaks, [habitId]: streak } })),
  setAchievements: (achievements) => set({ achievements }),
  setUserAchievements: (userAchievements) => set({ userAchievements }),
  setPendingLevelUp: (pendingLevelUp) => set({ pendingLevelUp }),
  addPendingAchievement: (achievement) =>
    set((state) => ({ pendingAchievements: [...state.pendingAchievements, achievement] })),
  clearPendingAchievements: () => set({ pendingAchievements: [] }),
  addUserAchievement: (ua) =>
    set((state) => ({ userAchievements: [...state.userAchievements, ua] })),
}));
