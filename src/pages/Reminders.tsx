import { useState } from 'react';
import { Plus, BellOff, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useReminders } from '../hooks/useReminders';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import type { Reminder } from '../types/reminder';
import { cn, today } from '../lib/utils';

interface ReminderFormData {
  title: string;
  description: string;
  reminder_date: string;
  reminder_time: string;
}

const defaultForm: ReminderFormData = {
  title: '',
  description: '',
  reminder_date: '',
  reminder_time: '',
};

interface ReminderFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ReminderFormData) => Promise<void>;
  initialData?: Reminder;
}

function ReminderForm({ open, onClose, onSave, initialData }: ReminderFormProps) {
  const [form, setForm] = useState<ReminderFormData>(
    initialData
      ? {
          title: initialData.title,
          description: initialData.description ?? '',
          reminder_date: initialData.reminder_date,
          reminder_time: initialData.reminder_time.slice(0, 5),
        }
      : defaultForm
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.reminder_date || !form.reminder_time) return;
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
          <DialogTitle>{initialData ? 'Edit Reminder' : 'New Reminder'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="What do you need to remember?"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea
              className="w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              rows={2}
              placeholder="Optional notes..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input
                type="date"
                value={form.reminder_date}
                onChange={(e) => setForm((f) => ({ ...f, reminder_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Time *</Label>
              <Input
                type="time"
                value={form.reminder_time}
                onChange={(e) => setForm((f) => ({ ...f, reminder_time: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Saving…' : initialData ? 'Save Changes' : 'Add Reminder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ReminderCardProps {
  reminder: Reminder;
  onDismiss: (id: string) => void;
  onDelete: (id: string) => void;
  highlight?: boolean;
}

function ReminderCard({ reminder, onDismiss, onDelete, highlight }: ReminderCardProps) {
  const date = new Date(`${reminder.reminder_date}T${reminder.reminder_time}`);
  const formatted = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border bg-[hsl(var(--card))] transition-all',
        highlight
          ? 'border-[hsl(var(--primary)/0.5)] bg-[hsl(var(--primary)/0.05)]'
          : 'border-[hsl(var(--border))]'
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm',
          highlight ? 'bg-[hsl(var(--primary)/0.15)]' : 'bg-[hsl(var(--secondary))]'
        )}
      >
        🔔
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{reminder.title}</p>
        {reminder.description && (
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{reminder.description}</p>
        )}
        <p
          className={cn(
            'text-xs mt-1 font-medium',
            highlight ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'
          )}
        >
          {formatted} at {time}
        </p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onDismiss(reminder.id)}
          title="Dismiss"
          className="p-1.5 rounded-lg hover:bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <BellOff className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(reminder.id)}
          title="Delete"
          className="p-1.5 rounded-lg hover:bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export function Reminders() {
  const { user } = useAuth();
  const { upcoming, loading, todayCount, addReminder, updateReminder, dismissReminder, deleteReminder } =
    useReminders(user?.id);
  const [formOpen, setFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | undefined>();
  const todayStr = today();

  function openAdd() {
    setEditingReminder(undefined);
    setFormOpen(true);
  }

  async function handleSave(data: ReminderFormData) {
    const timeWithSeconds = data.reminder_time.length === 5 ? `${data.reminder_time}:00` : data.reminder_time;
    if (editingReminder) {
      await updateReminder(editingReminder.id, {
        title: data.title,
        description: data.description || null,
        reminder_date: data.reminder_date,
        reminder_time: timeWithSeconds,
      });
    } else {
      await addReminder({
        title: data.title,
        description: data.description || null,
        reminder_date: data.reminder_date,
        reminder_time: timeWithSeconds,
      });
    }
  }

  const dueToday = upcoming.filter((r) => r.reminder_date === todayStr);
  const future = upcoming.filter((r) => r.reminder_date > todayStr);
  const overdue = upcoming.filter((r) => r.reminder_date < todayStr);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Reminders</h1>
            {todayCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {todayCount}
              </span>
            )}
          </div>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
            {upcoming.length} upcoming reminder{upcoming.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-[hsl(var(--secondary))] animate-pulse" />
          ))}
        </div>
      ) : upcoming.length === 0 && overdue.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-lg font-semibold mb-2">No reminders set</h3>
          <p className="text-[hsl(var(--muted-foreground))] mb-6 max-w-sm mx-auto">
            Set reminders so you never miss an important task or event.
          </p>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="w-4 h-4" /> Add Your First Reminder
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-red-500">
                Overdue
              </h2>
              {overdue.map((r) => (
                <ReminderCard
                  key={r.id}
                  reminder={r}
                  onDismiss={dismissReminder}
                  onDelete={deleteReminder}
                  highlight
                />
              ))}
            </section>
          )}

          {dueToday.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--primary))]">
                Due Today
              </h2>
              {dueToday.map((r) => (
                <ReminderCard
                  key={r.id}
                  reminder={r}
                  onDismiss={dismissReminder}
                  onDelete={deleteReminder}
                  highlight
                />
              ))}
            </section>
          )}

          {future.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Upcoming
              </h2>
              {future.map((r) => (
                <ReminderCard
                  key={r.id}
                  reminder={r}
                  onDismiss={dismissReminder}
                  onDelete={deleteReminder}
                />
              ))}
            </section>
          )}
        </div>
      )}

      <ReminderForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initialData={editingReminder}
      />
    </div>
  );
}
