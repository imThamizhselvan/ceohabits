import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useReminderStore } from '../store/useReminderStore';
import { today } from '../lib/utils';
import type { Reminder } from '../types/reminder';

export function useReminders(userId: string | undefined) {
  const store = useReminderStore();
  const firedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;
    fetchReminders();

    const interval = setInterval(checkDueReminders, 30_000);
    return () => clearInterval(interval);
  }, [userId]);

  // Also check whenever reminders change
  useEffect(() => {
    checkDueReminders();
  }, [store.reminders.length]);

  async function fetchReminders() {
    store.setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .eq('is_dismissed', false)
        .order('reminder_date', { ascending: true })
        .order('reminder_time', { ascending: true });

      if (error) throw error;
      store.setReminders(data || []);
    } catch (err) {
      console.error('Error fetching reminders:', err);
    } finally {
      store.setLoading(false);
    }
  }

  function checkDueReminders() {
    const todayStr = today();
    const now = new Date();
    const nowHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    for (const reminder of store.reminders) {
      if (reminder.is_dismissed) continue;
      if (firedIds.current.has(reminder.id)) continue;

      const isDue =
        reminder.reminder_date < todayStr ||
        (reminder.reminder_date === todayStr && reminder.reminder_time.slice(0, 5) <= nowHHMM);

      if (isDue) {
        firedIds.current.add(reminder.id);
        store.addPendingReminderToast(reminder);
      }
    }
  }

  async function addReminder(input: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'is_dismissed'>) {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert([{ ...input, user_id: userId, is_dismissed: false }])
        .select()
        .single();

      if (error) throw error;
      if (data) store.addReminder(data as Reminder);
      return data;
    } catch (err) {
      console.error('Error adding reminder:', err);
      throw err;
    }
  }

  async function updateReminder(id: string, updates: Partial<Reminder>) {
    store.updateReminder(id, updates);
    try {
      const { error } = await supabase.from('reminders').update(updates).eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating reminder:', err);
      throw err;
    }
  }

  async function dismissReminder(id: string) {
    store.updateReminder(id, { is_dismissed: true });
    // Remove from store so it no longer appears in the list
    store.removeReminder(id);
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_dismissed: true })
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error dismissing reminder:', err);
      throw err;
    }
  }

  async function deleteReminder(id: string) {
    store.removeReminder(id);
    try {
      const { error } = await supabase.from('reminders').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting reminder:', err);
      throw err;
    }
  }

  const upcoming = [...store.reminders]
    .filter((r) => !r.is_dismissed)
    .sort((a, b) => {
      const dateCompare = a.reminder_date.localeCompare(b.reminder_date);
      if (dateCompare !== 0) return dateCompare;
      return a.reminder_time.localeCompare(b.reminder_time);
    });

  return {
    reminders: store.reminders,
    upcoming,
    loading: store.loading,
    todayCount: store.todayCount(),
    addReminder,
    updateReminder,
    dismissReminder,
    deleteReminder,
    refetch: fetchReminders,
  };
}
