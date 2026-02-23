import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Habit } from '../../types/habit';
import { HabitCard } from './HabitCard';
import { useGamification } from '../../hooks/useGamification';
import { useHabitStore } from '../../store/useHabitStore';
import { supabase } from '../../lib/supabase';
import { today } from '../../lib/utils';
import { useAuthStore } from '../../store/useAuthStore';
import type { HabitLog } from '../../types/habit';

interface HabitGridProps {
  habits: Habit[];
  emptyMessage?: string;
}

interface UndoInfo {
  logId: string;
  habitName: string;
}

export function HabitGrid({ habits, emptyMessage = "No habits for today. Add some habits to get started!" }: HabitGridProps) {
  const { awardXP, streaks } = useGamification();
  const { isCompletedToday, addLog, removeLog } = useHabitStore();
  const { user } = useAuthStore();
  const [undoInfo, setUndoInfo] = useState<UndoInfo | null>(null);
  const [undoTimer, setUndoTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  function showUndo(logId: string, habitName: string) {
    if (undoTimer) clearTimeout(undoTimer);
    setUndoInfo({ logId, habitName });
    const timer = setTimeout(() => setUndoInfo(null), 4500);
    setUndoTimer(timer);
  }

  async function handleUndo() {
    if (!undoInfo) return;
    if (undoTimer) clearTimeout(undoTimer);
    setUndoInfo(null);
    try {
      removeLog(undoInfo.logId);
      await supabase.from('habit_logs').delete().eq('id', undoInfo.logId);
    } catch (err) {
      console.error('Error undoing completion:', err);
    }
  }

  async function handleComplete(habit: Habit) {
    if (!user) return;
    const todayStr = today();

    try {
      // Insert log first so streak/completion counts are accurate when awarding XP
      const { data, error } = await supabase
        .from('habit_logs')
        .insert([{
          habit_id: habit.id,
          user_id: user.id,
          xp_earned: 0,
          completed_at: todayStr,
        }])
        .select()
        .single();

      if (error) {
        // Unique constraint violation = already completed today
        if (error.code === '23505') return;
        throw error;
      }

      if (data) {
        addLog(data as HabitLog);
        showUndo(data.id, habit.name);
      }

      // Award XP after log insertion so achievement checks see the new completion
      const result = await awardXP(habit.id, habit.difficulty);

      return result;
    } catch (err) {
      console.error('Error completing habit:', err);
    }
  }

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-5xl mb-4">🎯</div>
        <p className="text-[hsl(var(--muted-foreground))]">{emptyMessage}</p>
      </div>
    );
  }

  const completed = habits.filter((h) => isCompletedToday(h.id));
  const pending = habits.filter((h) => !isCompletedToday(h.id));

  return (
    <>
      <div className="space-y-3">
        <AnimatePresence>
          {pending.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              isCompleted={false}
              streak={streaks[habit.id] ?? 0}
              onComplete={handleComplete}
            />
          ))}
        </AnimatePresence>

        {completed.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium mb-2 uppercase tracking-wide">
              ✅ Completed ({completed.length})
            </p>
            <AnimatePresence>
              {completed.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleted={true}
                  streak={streaks[habit.id] ?? 0}
                  onComplete={handleComplete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Undo toast */}
      <AnimatePresence>
        {undoInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[hsl(var(--foreground))] text-[hsl(var(--background))] shadow-lg text-sm font-medium whitespace-nowrap"
          >
            <span>✓ <span className="font-bold">{undoInfo.habitName}</span> completed</span>
            <button
              onClick={handleUndo}
              className="underline underline-offset-2 hover:opacity-80 transition-opacity font-semibold"
            >
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
