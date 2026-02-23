import { useState } from 'react';
import { Flame, CheckSquare, Zap, Target, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useHabits } from '../hooks/useHabits';
import { useGamification } from '../hooks/useGamification';
import { XPBar } from '../components/gamification/XPBar';
import { StatsCard } from '../components/gamification/StatsCard';
import { CareerProgressModal } from '../components/gamification/CareerProgressModal';
import { HabitGrid } from '../components/habits/HabitGrid';
import { HabitHeatmap } from '../components/habits/HabitHeatmap';
import { HabitForm } from '../components/habits/HabitForm';
import { MotivationalQuote } from '../components/dashboard/MotivationalQuote';
import { WeeklyReport } from '../components/dashboard/WeeklyReport';
import { Button } from '../components/ui/button';
import { useHabitStore } from '../store/useHabitStore';

export function Dashboard() {
  const { user, profile } = useAuth();
  const { getTodaysHabits, loading, addHabit } = useHabits(user?.id);
  const { streaks } = useGamification();
  const { todayLogs } = useHabitStore();

  const [careerOpen, setCareerOpen] = useState(false);
  const [habitFormOpen, setHabitFormOpen] = useState(false);

  const todaysHabits = getTodaysHabits();
  const completedToday = todayLogs.length;
  const totalToday = todaysHabits.length;
  const xpToday = todayLogs.reduce((sum, log) => sum + log.xp_earned, 0);
  const longestStreak = Math.max(0, ...Object.values(streaks));

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const name = profile?.username ?? user?.email?.split('@')[0] ?? 'Leader';

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          {greeting()}, {name} 👋
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          {completedToday === totalToday && totalToday > 0
            ? "You've crushed all your habits today! 🎉"
            : `${completedToday} of ${totalToday} habits done today`}
        </p>
      </div>

      {/* Motivational Quote */}
      <MotivationalQuote />

      {/* XP Bar — clickable to open career path */}
      {profile && (
        <div
          className="p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] cursor-pointer hover:ring-2 hover:ring-[hsl(var(--ring))] transition-shadow"
          onClick={() => setCareerOpen(true)}
        >
          <XPBar xp={profile.xp} />
          <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))] text-right">
            View career path →
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard
          icon={CheckSquare}
          label="Today's Progress"
          value={`${completedToday}/${totalToday}`}
          subtext={totalToday > 0 ? `${Math.round((completedToday / totalToday) * 100)}% complete` : 'No habits today'}
          color="hsl(var(--primary))"
        />
        <StatsCard
          icon={Zap}
          label="XP Earned Today"
          value={`+${xpToday}`}
          subtext="Keep going for more!"
          color="hsl(var(--accent))"
        />
        <StatsCard
          icon={Flame}
          label="Best Streak"
          value={`${longestStreak}d`}
          subtext={longestStreak >= 7 ? '🔥 On fire!' : 'Build consistency'}
          color="#f97316"
        />
        <StatsCard
          icon={Target}
          label="Total Habits"
          value={todaysHabits.length}
          subtext="Active habits"
          color="hsl(var(--success))"
        />
      </div>

      {/* Weekly Report + Heatmap side by side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeeklyReport />
        <HabitHeatmap />
      </div>

      {/* Today's habits */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-[hsl(var(--foreground))]">Today's Habits</h2>
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <Button size="sm" onClick={() => setHabitFormOpen(true)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Add Habit
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-[hsl(var(--secondary))] animate-pulse" />
            ))}
          </div>
        ) : (
          <HabitGrid habits={todaysHabits} />
        )}
      </div>

      {/* Modals */}
      {profile && (
        <CareerProgressModal
          open={careerOpen}
          onClose={() => setCareerOpen(false)}
          xp={profile.xp}
        />
      )}
      <HabitForm
        open={habitFormOpen}
        onClose={() => setHabitFormOpen(false)}
        onSave={addHabit}
      />
    </div>
  );
}
