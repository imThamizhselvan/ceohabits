export type TodoPriority = 'low' | 'medium' | 'high';

export const TODO_PRIORITY_TO_DIFFICULTY: Record<TodoPriority, string> = {
  low: 'easy',
  medium: 'medium',
  high: 'hard',
};

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: TodoPriority;
  due_date: string | null;
  is_done: boolean;
  xp_earned: number;
  created_at: string;
  updated_at: string;
}
