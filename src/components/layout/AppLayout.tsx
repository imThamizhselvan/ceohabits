import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { LevelUpModal } from '../gamification/LevelUpModal';
import { AchievementToast } from '../gamification/AchievementToast';
import { ReminderToast } from '../reminders/ReminderToast';
import { useGamification } from '../../hooks/useGamification';
import { useReminders } from '../../hooks/useReminders';
import { useReminderStore } from '../../store/useReminderStore';
import { useAuth } from '../../hooks/useAuth';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pendingLevelUp, clearPendingLevelUp, pendingAchievements, clearPendingAchievements } =
    useGamification();
  const { user } = useAuth();
  const { dismissReminder } = useReminders(user?.id);
  const { pendingReminderToasts } = useReminderStore();

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onMenuClick={() => setSidebarOpen(true)} />

      <main className="pt-[var(--topbar-height)] lg:pl-[var(--sidebar-width)] min-h-screen pb-16 lg:pb-0">
        <div className="p-4 md:p-6 max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>

      <BottomNav />

      {pendingLevelUp !== null && (
        <LevelUpModal level={pendingLevelUp} onClose={clearPendingLevelUp} />
      )}

      {pendingAchievements.length > 0 && (
        <AchievementToast achievements={pendingAchievements} onClose={clearPendingAchievements} />
      )}

      {pendingReminderToasts.length > 0 && (
        <ReminderToast reminders={pendingReminderToasts} onDismiss={dismissReminder} />
      )}
    </div>
  );
}
