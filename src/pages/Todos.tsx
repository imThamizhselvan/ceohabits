import { useState } from 'react';
import { Plus, Trash2, Pencil, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTodos } from '../hooks/useTodos';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { XPPopup } from '../components/gamification/XPPopup';
import { XP_REWARDS } from '../lib/gamification';
import { TODO_PRIORITY_TO_DIFFICULTY } from '../types/todo';
import type { Todo, TodoPriority } from '../types/todo';
import { cn, today } from '../lib/utils';

type FilterTab = 'all' | 'active' | 'done';

const PRIORITY_COLORS: Record<TodoPriority, string> = {
  low: 'text-green-500 bg-green-500/10 border-green-500/30',
  medium: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
  high: 'text-red-500 bg-red-500/10 border-red-500/30',
};

interface TodoFormData {
  title: string;
  description: string;
  priority: TodoPriority;
  due_date: string;
}

const defaultForm: TodoFormData = {
  title: '',
  description: '',
  priority: 'medium',
  due_date: '',
};

interface TodoFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: TodoFormData) => Promise<void>;
  initialData?: Todo;
}

function TodoForm({ open, onClose, onSave, initialData }: TodoFormProps) {
  const [form, setForm] = useState<TodoFormData>(
    initialData
      ? {
          title: initialData.title,
          description: initialData.description ?? '',
          priority: initialData.priority,
          due_date: initialData.due_date ?? '',
        }
      : defaultForm
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit To-Do' : 'New To-Do'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea
              className="w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              rows={3}
              placeholder="Optional details..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Priority</Label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as TodoPriority[]).map((p) => {
                const xp = XP_REWARDS[TODO_PRIORITY_TO_DIFFICULTY[p]];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, priority: p }))}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg border text-sm font-medium capitalize transition-all',
                      form.priority === p
                        ? PRIORITY_COLORS[p]
                        : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.4)]'
                    )}
                  >
                    {p}
                    <span className="block text-xs opacity-70">+{xp} XP</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Due Date</Label>
            <Input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Saving…' : initialData ? 'Save Changes' : 'Add To-Do'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface TodoCardProps {
  todo: Todo;
  onToggle: (todo: Todo) => Promise<{ xpEarned: number }>;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

function TodoCard({ todo, onToggle, onEdit, onDelete }: TodoCardProps) {
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const todayStr = today();
  const isOverdue = todo.due_date && todo.due_date < todayStr && !todo.is_done;

  async function handleToggle() {
    const result = await onToggle(todo);
    if (!todo.is_done && result) {
      const xp = XP_REWARDS[TODO_PRIORITY_TO_DIFFICULTY[todo.priority]];
      if (xp > 0) {
        setXpAmount(xp);
        setShowXP(true);
        setTimeout(() => setShowXP(false), 1500);
      }
    }
  }

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-xl border bg-[hsl(var(--card))] transition-all',
        todo.is_done
          ? 'opacity-60 border-[hsl(var(--border))]'
          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)]'
      )}
    >
      <XPPopup xp={xpAmount} visible={showXP} />

      <button
        onClick={handleToggle}
        className={cn(
          'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
          todo.is_done
            ? 'bg-[hsl(var(--primary))] border-[hsl(var(--primary))]'
            : 'border-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]'
        )}
      >
        {todo.is_done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium',
            todo.is_done && 'line-through text-[hsl(var(--muted-foreground))]'
          )}
        >
          {todo.title}
        </p>
        {todo.description && (
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 line-clamp-2">
            {todo.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize',
              PRIORITY_COLORS[todo.priority]
            )}
          >
            {todo.priority}
          </span>
          {todo.due_date && (
            <span
              className={cn(
                'text-[10px] font-medium',
                isOverdue ? 'text-red-500' : 'text-[hsl(var(--muted-foreground))]'
              )}
            >
              {isOverdue ? '⚠ ' : ''}Due {todo.due_date}
            </span>
          )}
          {todo.is_done && todo.xp_earned > 0 && (
            <span className="text-[10px] font-bold text-[hsl(var(--accent))]">
              +{todo.xp_earned} XP
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onEdit(todo)}
          className="p-1.5 rounded-lg hover:bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="p-1.5 rounded-lg hover:bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export function Todos() {
  const { user } = useAuth();
  const { todos, loading, addTodo, updateTodo, deleteTodo, toggleTodo } = useTodos(user?.id);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();

  function openAdd() {
    setEditingTodo(undefined);
    setFormOpen(true);
  }

  function openEdit(todo: Todo) {
    setEditingTodo(todo);
    setFormOpen(true);
  }

  async function handleSave(data: TodoFormData) {
    if (editingTodo) {
      await updateTodo(editingTodo.id, {
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        due_date: data.due_date || null,
      });
    } else {
      await addTodo({
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        due_date: data.due_date || null,
      });
    }
  }

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.is_done;
    if (filter === 'done') return t.is_done;
    return true;
  });

  const activeCount = todos.filter((t) => !t.is_done).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">To-Do List</h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
            {activeCount} task{activeCount !== 1 ? 's' : ''} remaining
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-[hsl(var(--secondary))] w-fit">
        {(['all', 'active', 'done'] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all',
              filter === tab
                ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-[hsl(var(--secondary))] animate-pulse" />
          ))}
        </div>
      ) : todos.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-lg font-semibold mb-2">Your to-do list is clear</h3>
          <p className="text-[hsl(var(--muted-foreground))] mb-6 max-w-sm mx-auto">
            Add tasks and earn XP as you complete them.
          </p>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="w-4 h-4" /> Add Your First Task
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-[hsl(var(--muted-foreground))]">No tasks in this view.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onEdit={openEdit}
              onDelete={deleteTodo}
            />
          ))}
        </div>
      )}

      <TodoForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initialData={editingTodo}
      />
    </div>
  );
}

