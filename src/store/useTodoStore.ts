import { create } from 'zustand';
import type { Todo } from '../types/todo';

interface TodoState {
  todos: Todo[];
  loading: boolean;
  setTodos: (todos: Todo[]) => void;
  setLoading: (loading: boolean) => void;
  addTodo: (todo: Todo) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  removeTodo: (id: string) => void;
}

export const useTodoStore = create<TodoState>((set) => ({
  todos: [],
  loading: true,
  setTodos: (todos) => set({ todos }),
  setLoading: (loading) => set({ loading }),
  addTodo: (todo) => set((state) => ({ todos: [todo, ...state.todos] })),
  updateTodo: (id, updates) =>
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTodo: (id) =>
    set((state) => ({ todos: state.todos.filter((t) => t.id !== id) })),
}));
