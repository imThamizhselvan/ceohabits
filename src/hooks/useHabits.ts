import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useHabitStore } from '../store/useHabitStore';
import type { Habit, HabitLog } from '../types/habit';
import { today, isWeekday } from '../lib/utils';

export function useHabits(userId: string | undefined) {
  const store = useHabitStore();

  useEffect(() => {
    if (!userId) return;
    fetchHabits();
    fetchTodayLogs();

    const subscription = supabase
      .channel('habit_logs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habit_logs', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            store.addLog(payload.new as HabitLog);
          }
        }
      )
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, [userId]);

  async function fetchHabits() {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      store.setHabits(data || []);
    } catch (err) {
      console.error('Error fetching habits:', err);
    } finally {
      store.setLoading(false);
    }
  }

  async function fetchTodayLogs() {
    const todayStr = today();
    try {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('completed_at', todayStr);

      if (error) throw error;
      store.setTodayLogs(data || []);
    } catch (err) {
      console.error('Error fetching today logs:', err);
    }
  }

  async function addHabit(input: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'sort_order' | 'is_active'>) {
    try {
      const { data, error } = await supabase
        .from('habits')
        .insert([{ ...input, user_id: userId, sort_order: store.habits.length }])
        .select()
        .single();

      if (error) throw error;
      if (data) store.addHabit(data as Habit);
      return data;
    } catch (err) {
      console.error('Error adding habit:', err);
      throw err;
    }
  }

  async function updateHabit(id: string, updates: Partial<Habit>) {
    store.updateHabit(id, updates);
    try {
      const { error } = await supabase.from('habits').update(updates).eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating habit:', err);
      throw err;
    }
  }

  async function deleteHabit(id: string) {
    store.removeHabit(id);
    try {
      const { error } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting habit:', err);
      throw err;
    }
  }

  async function reorderHabits(habitId: string, direction: 'up' | 'down') {
    const habits = store.habits;
    const idx = habits.findIndex((h) => h.id === habitId);
    if (idx === -1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= habits.length) return;

    const habit = habits[idx];
    const target = habits[targetIdx];

    // Swap sort_orders optimistically
    const updated = habits.map((h) => {
      if (h.id === habit.id) return { ...h, sort_order: target.sort_order };
      if (h.id === target.id) return { ...h, sort_order: habit.sort_order };
      return h;
    });
    store.setHabits([...updated].sort((a, b) => a.sort_order - b.sort_order));

    try {
      await Promise.all([
        supabase.from('habits').update({ sort_order: target.sort_order }).eq('id', habit.id),
        supabase.from('habits').update({ sort_order: habit.sort_order }).eq('id', target.id),
      ]);
    } catch (err) {
      console.error('Error reordering habits:', err);
      store.setHabits(habits); // revert
    }
  }

  function getTodaysHabits() {
    const now = new Date();
    const dayOfWeek = now.getDay();

    return store.habits.filter((habit) => {
      if (habit.frequency === 'daily') return true;
      if (habit.frequency === 'weekdays') return isWeekday(now);
      if (habit.frequency === 'weekly') return dayOfWeek === 1; // Mondays
      return true;
    });
  }

  return {
    habits: store.habits,
    todayLogs: store.todayLogs,
    loading: store.loading,
    isCompletedToday: store.isCompletedToday,
    getTodaysHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    reorderHabits,
    refetch: fetchHabits,
  };
}
