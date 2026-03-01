import { create } from 'zustand';
import type { Reminder } from '../types/reminder';
import { today } from '../lib/utils';

interface ReminderState {
  reminders: Reminder[];
  loading: boolean;
  pendingReminderToasts: Reminder[];
  setReminders: (reminders: Reminder[]) => void;
  setLoading: (loading: boolean) => void;
  addReminder: (reminder: Reminder) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  removeReminder: (id: string) => void;
  addPendingReminderToast: (reminder: Reminder) => void;
  clearPendingReminderToasts: () => void;
  todayCount: () => number;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  loading: true,
  pendingReminderToasts: [],
  setReminders: (reminders) => set({ reminders }),
  setLoading: (loading) => set({ loading }),
  addReminder: (reminder) =>
    set((state) => ({ reminders: [reminder, ...state.reminders] })),
  updateReminder: (id, updates) =>
    set((state) => ({
      reminders: state.reminders.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),
  removeReminder: (id) =>
    set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) })),
  addPendingReminderToast: (reminder) =>
    set((state) => ({
      pendingReminderToasts: [...state.pendingReminderToasts, reminder],
    })),
  clearPendingReminderToasts: () => set({ pendingReminderToasts: [] }),
  todayCount: () => {
    const todayStr = today();
    return get().reminders.filter(
      (r) => !r.is_dismissed && r.reminder_date === todayStr
    ).length;
  },
}));
