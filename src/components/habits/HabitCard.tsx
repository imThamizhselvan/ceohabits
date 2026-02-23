import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Pencil, Archive, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { Habit } from '../../types/habit';
import { StreakBadge } from './StreakBadge';
import { CategoryTag } from './CategoryTag';
import { XPPopup } from '../gamification/XPPopup';
import { calculateXP } from '../../lib/gamification';
import { cn } from '../../lib/utils';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  streak: number;
  onComplete: (habit: Habit) => Promise<{ xpEarned: number; newStreak: number } | undefined>;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  showActions?: boolean;
  monthCount?: number;
}

const difficultyLabel: Record<string, string> = {
  easy: '⭐ Easy',
  medium: '⭐⭐ Medium',
  hard: '⭐⭐⭐ Hard',
};

export function HabitCard({
  habit,
  isCompleted,
  streak,
  onComplete,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  showActions = false,
  monthCount,
}: HabitCardProps) {
  const [completing, setCompleting] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [xpPopup, setXpPopup] = useState<{ visible: boolean; xp: number; streak: number }>({
    visible: false,
    xp: 0,
    streak: 0,
  });

  async function handleComplete() {
    if (isCompleted || completing) return;
    setCompleting(true);
    try {
      const result = await onComplete(habit);
      if (result) {
        setXpPopup({ visible: true, xp: result.xpEarned, streak: result.newStreak });
        setTimeout(() => setXpPopup((p) => ({ ...p, visible: false })), 1500);
      }
    } finally {
      setCompleting(false);
    }
  }

  const estimatedXP = calculateXP(habit.difficulty, streak);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative flex items-center gap-4 p-4 rounded-xl border transition-all',
        isCompleted
          ? 'border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.05)]'
          : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.3)]'
      )}
    >
      {/* XP popup */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <XPPopup xp={xpPopup.xp} visible={xpPopup.visible} streak={xpPopup.streak} />
      </div>

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg"
        style={{ backgroundColor: habit.color + '20' }}
      >
        <span style={{ color: habit.color }}>✓</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn('font-medium text-sm', isCompleted && 'line-through text-[hsl(var(--muted-foreground))]')}>
            {habit.name}
          </p>
          <StreakBadge streak={streak} size="sm" />
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <CategoryTag category={habit.category} />
          <span className="text-xs text-[hsl(var(--muted-foreground))]">{difficultyLabel[habit.difficulty]}</span>
          {!isCompleted && (
            <span className="text-xs text-[hsl(var(--accent))] font-medium">+{estimatedXP} XP</span>
          )}
          {monthCount !== undefined && (
            <span className="text-xs text-[hsl(var(--muted-foreground))]">· {monthCount} this month</span>
          )}
          {habit.notes && (
            <button
              onClick={() => setNotesOpen((o) => !o)}
              className="inline-flex items-center gap-0.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${notesOpen ? 'rotate-180' : ''}`} />
              {notesOpen ? 'Hide note' : 'Show note'}
            </button>
          )}
        </div>
        <AnimatePresence>
          {notesOpen && habit.notes && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 text-xs text-[hsl(var(--muted-foreground))] italic leading-relaxed border-l-2 border-[hsl(var(--primary)/0.3)] pl-2"
            >
              {habit.notes}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {showActions && (
          <>
            {/* Reorder buttons */}
            {onMoveUp && (
              <button
                onClick={onMoveUp}
                className="p-1.5 rounded-lg hover:bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] transition-colors"
                aria-label="Move up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            )}
            {onMoveDown && (
              <button
                onClick={onMoveDown}
                className="p-1.5 rounded-lg hover:bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] transition-colors"
                aria-label="Move down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            )}

            {onEdit && (
              <button
                onClick={() => onEdit(habit)}
                className="p-1.5 rounded-lg hover:bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] transition-colors"
                aria-label="Edit habit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(habit.id)}
                className="p-1.5 rounded-lg hover:bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors"
                aria-label="Archive habit"
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}

        {/* Check button */}
        <AnimatePresence mode="wait">
          {isCompleted ? (
            <motion.div
              key="completed"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-9 h-9 rounded-full bg-[hsl(var(--success))] flex items-center justify-center"
            >
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </motion.div>
          ) : (
            <motion.button
              key="incomplete"
              onClick={handleComplete}
              disabled={completing}
              className={cn(
                'w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all',
                'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]',
                'hover:bg-[hsl(var(--primary)/0.05)]',
                completing && 'animate-pulse'
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Mark complete"
            >
              {completing && <div className="w-3 h-3 rounded-full bg-[hsl(var(--primary))] animate-ping" />}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
