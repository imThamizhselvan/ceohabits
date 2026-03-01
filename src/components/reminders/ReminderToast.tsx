import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Reminder } from '../../types/reminder';
import { useReminderStore } from '../../store/useReminderStore';

interface ReminderToastProps {
  reminders: Reminder[];
  onDismiss: (id: string) => void;
}

export function ReminderToast({ reminders, onDismiss }: ReminderToastProps) {
  const { clearPendingReminderToasts } = useReminderStore();

  useEffect(() => {
    if (reminders.length === 0) return;
    const timer = setTimeout(() => {
      clearPendingReminderToasts();
    }, 8000);
    return () => clearTimeout(timer);
  }, [reminders.length]);

  function handleDismiss(id: string) {
    onDismiss(id);
    clearPendingReminderToasts();
  }

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 space-y-2 max-w-xs w-full">
      <AnimatePresence>
        {reminders.map((reminder, i) => {
          const date = new Date(`${reminder.reminder_date}T${reminder.reminder_time}`);
          const formatted = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

          return (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
              className="flex items-start gap-3 p-4 rounded-xl border bg-[hsl(var(--card))] shadow-lg"
              style={{ borderColor: 'hsl(var(--primary) / 0.4)', backgroundColor: 'hsl(var(--card))' }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: 'hsl(var(--primary) / 0.15)' }}
              >
                🔔
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--primary))]">
                  Reminder
                </p>
                <p className="text-sm font-bold text-[hsl(var(--foreground))]">{reminder.title}</p>
                {reminder.description && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{reminder.description}</p>
                )}
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{formatted}</p>
              </div>
              <button
                onClick={() => handleDismiss(reminder.id)}
                className="p-1 rounded hover:bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
