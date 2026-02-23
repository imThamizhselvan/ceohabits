import { create } from 'zustand';
import type { Habit, HabitLog } from '../types/habit';

interface HabitState {
  habits: Habit[];
  logs: HabitLog[];
  todayLogs: HabitLog[];
  loading: boolean;
  setHabits: (habits: Habit[]) => void;
  setLogs: (logs: HabitLog[]) => void;
  setTodayLogs: (logs: HabitLog[]) => void;
  setLoading: (loading: boolean) => void;
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  removeHabit: (id: string) => void;
  addLog: (log: HabitLog) => void;
  removeLog: (logId: string) => void;
  isCompletedToday: (habitId: string) => boolean;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  logs: [],
  todayLogs: [],
  loading: true,
  setHabits: (habits) => set({ habits }),
  setLogs: (logs) => set({ logs }),
  setTodayLogs: (todayLogs) => set({ todayLogs }),
  setLoading: (loading) => set({ loading }),
  addHabit: (habit) => set((state) => ({ habits: [habit, ...state.habits] })),
  updateHabit: (id, updates) =>
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    })),
  removeHabit: (id) =>
    set((state) => ({ habits: state.habits.filter((h) => h.id !== id) })),
  addLog: (log) =>
    set((state) => ({
      logs: [log, ...state.logs],
      todayLogs: [log, ...state.todayLogs],
    })),
  removeLog: (logId) =>
    set((state) => ({
      logs: state.logs.filter((l) => l.id !== logId),
      todayLogs: state.todayLogs.filter((l) => l.id !== logId),
    })),
  isCompletedToday: (habitId) => {
    const today = new Date().toISOString().split('T')[0];
    return get().todayLogs.some(
      (l) => l.habit_id === habitId && l.completed_at === today
    );
  },
}));
