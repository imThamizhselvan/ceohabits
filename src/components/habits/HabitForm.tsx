import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { Habit, HabitDifficulty, HabitFrequency } from '../../types/habit';
import { HABIT_CATEGORIES, HABIT_COLORS } from '../../types/habit';
import { cn } from '../../lib/utils';

interface HabitFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'sort_order' | 'is_active'>) => Promise<void>;
  initialData?: Habit;
}

const frequencies: { value: HabitFrequency; label: string }[] = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekly', label: 'Weekly' },
];

const difficulties: { value: HabitDifficulty; label: string; xp: string; color: string }[] = [
  { value: 'easy', label: 'Easy', xp: '10 XP', color: '#22c55e' },
  { value: 'medium', label: 'Medium', xp: '25 XP', color: '#f59e0b' },
  { value: 'hard', label: 'Hard', xp: '50 XP', color: '#ef4444' },
];

interface Template {
  name: string;
  category: string;
  frequency: HabitFrequency;
  difficulty: HabitDifficulty;
  color: string;
  emoji: string;
}

const TEMPLATES: Template[] = [
  { name: 'Morning meditation', category: 'mindfulness', difficulty: 'easy',   frequency: 'daily',    color: '#8b5cf6', emoji: '🧘' },
  { name: 'Exercise 30 min',   category: 'health',       difficulty: 'medium', frequency: 'daily',    color: '#22c55e', emoji: '💪' },
  { name: 'Read 20 pages',     category: 'learning',     difficulty: 'easy',   frequency: 'daily',    color: '#3b82f6', emoji: '📚' },
  { name: 'Journal entry',     category: 'mindfulness',  difficulty: 'easy',   frequency: 'daily',    color: '#ec4899', emoji: '✍️' },
  { name: 'Cold shower',       category: 'health',       difficulty: 'hard',   frequency: 'daily',    color: '#06b6d4', emoji: '🚿' },
  { name: 'No social media',   category: 'productivity', difficulty: 'medium', frequency: 'daily',    color: '#f97316', emoji: '📵' },
  { name: 'Review finances',   category: 'finance',      difficulty: 'medium', frequency: 'weekly',   color: '#f59e0b', emoji: '💰' },
  { name: 'Deep work 2h',      category: 'productivity', difficulty: 'hard',   frequency: 'weekdays', color: '#6366f1', emoji: '⚡' },
];

export function HabitForm({ open, onClose, onSave, initialData }: HabitFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [category, setCategory] = useState(initialData?.category ?? 'general');
  const [frequency, setFrequency] = useState<HabitFrequency>(initialData?.frequency ?? 'daily');
  const [difficulty, setDifficulty] = useState<HabitDifficulty>(initialData?.difficulty ?? 'medium');
  const [color, setColor] = useState(initialData?.color ?? '#6366f1');
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [saving, setSaving] = useState(false);

  function applyTemplate(t: Template) {
    setName(t.name);
    setCategory(t.category);
    setFrequency(t.frequency);
    setDifficulty(t.difficulty);
    setColor(t.color);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), category, frequency, difficulty, color, icon: 'check-circle', notes: notes.trim() || null });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Habit' : 'Add New Habit'}</DialogTitle>
        </DialogHeader>

        {/* Quick templates — only shown when adding */}
        {!initialData && (
          <div className="mt-3">
            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2 uppercase tracking-wide">
              Quick templates
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className={cn(
                    'flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs text-left transition-all',
                    'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--secondary))]'
                  )}
                >
                  <span>{t.emoji}</span>
                  <span className="truncate">{t.name}</span>
                </button>
              ))}
            </div>
            <div className="my-4 border-t border-[hsl(var(--border))]" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Habit Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning meditation, Read 30 min..."
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {HABIT_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all text-left',
                    category === cat.value
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)]'
                  )}
                >
                  <span>{cat.emoji}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-1.5">
            <Label>Frequency</Label>
            <div className="flex gap-2">
              {frequencies.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFrequency(f.value)}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-lg border text-sm transition-all',
                    frequency === f.value
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)]'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-1.5">
            <Label>Difficulty</Label>
            <div className="flex gap-2">
              {difficulties.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDifficulty(d.value)}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all',
                    difficulty === d.value ? 'text-white' : 'border-[hsl(var(--border))]'
                  )}
                  style={
                    difficulty === d.value
                      ? { backgroundColor: d.color, borderColor: d.color }
                      : {}
                  }
                >
                  <div>{d.label}</div>
                  <div className={cn('text-xs', difficulty !== d.value && 'text-[hsl(var(--muted-foreground))]')}>
                    {d.xp}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-7 h-7 rounded-full transition-all',
                    color === c ? 'ring-2 ring-offset-2 ring-[hsl(var(--ring))] scale-110' : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Intention / Notes <span className="text-[hsl(var(--muted-foreground))] font-normal">(optional)</span></Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why does this habit matter to you? What's your intention?"
              rows={3}
              className="w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm shadow-sm resize-none placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !name.trim()} className="flex-1">
              {saving ? 'Saving...' : initialData ? 'Update Habit' : 'Add Habit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
