import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTodoStore } from '../store/useTodoStore';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';
import { XP_REWARDS, getLevelFromXP } from '../lib/gamification';
import { TODO_PRIORITY_TO_DIFFICULTY } from '../types/todo';
import type { Todo } from '../types/todo';

export function useTodos(userId: string | undefined) {
  const store = useTodoStore();
  const { profile, setProfile } = useAuthStore();
  const gameStore = useGameStore();

  useEffect(() => {
    if (!userId) return;
    fetchTodos();
  }, [userId]);

  async function fetchTodos() {
    store.setLoading(true);
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      store.setTodos(data || []);
    } catch (err) {
      console.error('Error fetching todos:', err);
    } finally {
      store.setLoading(false);
    }
  }

  async function addTodo(input: Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'xp_earned' | 'is_done'>) {
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ ...input, user_id: userId, is_done: false, xp_earned: 0 }])
        .select()
        .single();

      if (error) throw error;
      if (data) store.addTodo(data as Todo);
      return data;
    } catch (err) {
      console.error('Error adding todo:', err);
      throw err;
    }
  }

  async function updateTodo(id: string, updates: Partial<Todo>) {
    store.updateTodo(id, updates);
    try {
      const { error } = await supabase
        .from('todos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating todo:', err);
      throw err;
    }
  }

  async function deleteTodo(id: string) {
    store.removeTodo(id);
    try {
      const { error } = await supabase.from('todos').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting todo:', err);
      throw err;
    }
  }

  async function toggleTodo(todo: Todo): Promise<{ xpEarned: number }> {
    const completing = !todo.is_done;

    if (completing) {
      const difficulty = TODO_PRIORITY_TO_DIFFICULTY[todo.priority];
      const xpToAward = XP_REWARDS[difficulty] ?? 25;
      const currentXP = profile?.xp ?? 0;
      const newXP = currentXP + xpToAward;
      const oldLevel = getLevelFromXP(currentXP);
      const newLevel = getLevelFromXP(newXP);

      // Optimistic update
      store.updateTodo(todo.id, { is_done: true, xp_earned: xpToAward });

      try {
        const profileUpdates: { xp: number; level?: number; updated_at: string } = {
          xp: newXP,
          updated_at: new Date().toISOString(),
        };
        if (newLevel.level > oldLevel.level) {
          profileUpdates.level = newLevel.level;
          gameStore.setPendingLevelUp(newLevel.level);
        }

        const [todoResult, profileResult] = await Promise.all([
          supabase
            .from('todos')
            .update({ is_done: true, xp_earned: xpToAward, updated_at: new Date().toISOString() })
            .eq('id', todo.id)
            .select()
            .single(),
          supabase
            .from('profiles')
            .update(profileUpdates)
            .eq('id', userId)
            .select()
            .single(),
        ]);

        if (todoResult.error) throw todoResult.error;
        if (profileResult.error) throw profileResult.error;

        if (profileResult.data) {
          setProfile(profileResult.data);
          gameStore.setXP(profileResult.data.xp);
          gameStore.setLevel(profileResult.data.level);
        }

        return { xpEarned: xpToAward };
      } catch (err) {
        // Rollback
        store.updateTodo(todo.id, { is_done: false, xp_earned: 0 });
        console.error('Error toggling todo:', err);
        throw err;
      }
    } else {
      // Unchecking: subtract previously earned XP
      const xpToSubtract = todo.xp_earned;
      const currentXP = profile?.xp ?? 0;
      const newXP = Math.max(0, currentXP - xpToSubtract);

      // Optimistic update
      store.updateTodo(todo.id, { is_done: false, xp_earned: 0 });

      try {
        const [todoResult, profileResult] = await Promise.all([
          supabase
            .from('todos')
            .update({ is_done: false, xp_earned: 0, updated_at: new Date().toISOString() })
            .eq('id', todo.id)
            .select()
            .single(),
          supabase
            .from('profiles')
            .update({ xp: newXP, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single(),
        ]);

        if (todoResult.error) throw todoResult.error;
        if (profileResult.error) throw profileResult.error;

        if (profileResult.data) {
          setProfile(profileResult.data);
          gameStore.setXP(profileResult.data.xp);
          gameStore.setLevel(profileResult.data.level);
        }

        return { xpEarned: 0 };
      } catch (err) {
        // Rollback
        store.updateTodo(todo.id, { is_done: true, xp_earned: xpToSubtract });
        console.error('Error toggling todo:', err);
        throw err;
      }
    }
  }

  return {
    todos: store.todos,
    loading: store.loading,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    refetch: fetchTodos,
  };
}
