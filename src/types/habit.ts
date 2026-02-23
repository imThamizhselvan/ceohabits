export type HabitFrequency = 'daily' | 'weekly' | 'weekdays';
export type HabitDifficulty = 'easy' | 'medium' | 'hard';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  category: string;
  frequency: HabitFrequency;
  difficulty: HabitDifficulty;
  icon: string;
  color: string;
  is_active: boolean;
  sort_order: number;
  notes?: string | null;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  xp_earned: number;
  completed_at: string;
  created_at: string;
}

export const HABIT_CATEGORIES = [
  { value: 'health', label: 'Health & Fitness', emoji: '💪' },
  { value: 'mindfulness', label: 'Mindfulness', emoji: '🧘' },
  { value: 'learning', label: 'Learning', emoji: '📚' },
  { value: 'productivity', label: 'Productivity', emoji: '⚡' },
  { value: 'social', label: 'Social', emoji: '🤝' },
  { value: 'creativity', label: 'Creativity', emoji: '🎨' },
  { value: 'finance', label: 'Finance', emoji: '💰' },
  { value: 'general', label: 'General', emoji: '✅' },
] as const;

export const HABIT_ICONS = [
  'activity', 'alarm-clock', 'apple', 'award', 'barbell',
  'book', 'brain', 'briefcase', 'check-circle', 'coffee',
  'dumbbell', 'flame', 'heart', 'leaf', 'lightning',
  'moon', 'mountain', 'music', 'pencil', 'star',
  'sun', 'target', 'trophy', 'water', 'zap',
] as const;

export const HABIT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#84cc16', '#f59e0b',
] as const;
