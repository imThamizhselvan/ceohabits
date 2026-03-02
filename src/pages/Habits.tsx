import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useHabits } from '../hooks/useHabits';
import { useGamification } from '../hooks/useGamification';
import { useHabitStore } from '../store/useHabitStore';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitForm } from '../components/habits/HabitForm';
import { Button } from '../components/ui/button';
import { HABIT_CATEGORIES } from '../types/habit';
import { supabase } from '../lib/supabase';
import type { Habit } from '../types/habit';
import { cn } from '../lib/utils';

export function Habits() {
  const { user } = useAuth();
  const { habits, loading, addHabit, updateHabit, deleteHabit, reorderHabits } = useHabits(user?.id);
  const { streaks, awardXP } = useGamification();
  const isCompletedToday = useHabitStore((s) => s.isCompletedToday);

  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [monthCounts, setMonthCounts] = useState<Record<string, number>>({});

  // Fetch this-month completion counts per habit
  useEffect(() => {
    if (!user || habits.length === 0) return;
    fetchMonthCounts();
  }, [user?.id, habits.length]);

  async function fetchMonthCounts() {
    const start = new Date();
    start.setDate(1);
    const startStr = start.toISOString().split('T')[0];

    try {
      const { data } = await supabase
        .from('habit_logs')
        .select('habit_id')
        .eq('user_id', user!.id)
        .gte('completed_at', startStr);

      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        counts[row.habit_id] = (counts[row.habit_id] ?? 0) + 1;
      }
      setMonthCounts(counts);
    } catch {
      // non-critical, ignore
    }
  }

  function openAdd() {
    setEditingHabit(undefined);
    setFormOpen(true);
  }

  function openEdit(habit: Habit) {
    setEditingHabit(habit);
    setFormOpen(true);
  }

  async function handleSave(data: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'sort_order' | 'is_active'>) {
    if (editingHabit) {
      await updateHabit(editingHabit.id, data);
    } else {
      await addHabit(data);
    }
  }

  async function handleComplete(habit: Habit) {
    return awardXP(habit.id, habit.difficulty);
  }

  // Categories that have at least one habit
  const usedCategories = ['all', ...HABIT_CATEGORIES
    .filter((c) => habits.some((h) => h.category === c.value))
    .map((c) => c.value)];

  const filteredHabits = activeCategory === 'all'
    ? habits
    : habits.filter((h) => h.category === activeCategory);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">My Habits</h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
            {habits.length} habit{habits.length !== 1 ? 's' : ''} in your routine
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Add Habit
        </Button>
      </div>

      {/* Category filter */}
      {habits.length > 0 && usedCategories.length > 2 && (
        <div className="flex gap-2 flex-wrap">
          {usedCategories.map((cat) => {
            const meta = HABIT_CATEGORIES.find((c) => c.value === cat);
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all',
                  activeCategory === cat
                    ? 'bg-[hsl(var(--primary))] border-[hsl(var(--primary))] text-white font-medium'
                    : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.4)]'
                )}
              >
                {cat === 'all' ? (
                  <>✨ All</>
                ) : (
                  <>{meta?.emoji} {meta?.label}</>
                )}
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-[hsl(var(--secondary))] animate-pulse" />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
            Start your journey
          </h3>
          <p className="text-[hsl(var(--muted-foreground))] mb-6 max-w-sm mx-auto">
            Every great journey starts with a single habit. What will you build first?
          </p>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="w-4 h-4" /> Add Your First Habit
          </Button>
        </div>
      ) : filteredHabits.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-[hsl(var(--muted-foreground))]">No habits in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHabits.map((habit, idx) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              isCompleted={isCompletedToday(habit.id)}
              streak={streaks[habit.id] ?? 0}
              onComplete={handleComplete}
              onEdit={openEdit}
              onDelete={deleteHabit}
              onMoveUp={idx > 0 ? () => reorderHabits(habit.id, 'up') : undefined}
              onMoveDown={idx < filteredHabits.length - 1 ? () => reorderHabits(habit.id, 'down') : undefined}
              showActions
              monthCount={monthCounts[habit.id] ?? 0}
            />
          ))}
        </div>
      )}

      <HabitForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initialData={editingHabit}
      />
    </div>
  );
}
