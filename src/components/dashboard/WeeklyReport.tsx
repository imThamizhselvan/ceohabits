import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Zap, CheckSquare, Flame, Star, Share2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { useHabitStore } from '../../store/useHabitStore';

interface WeekStats {
  xp: number;
  completions: number;
  uniqueHabits: number;
  topHabitId: string | null;
  topHabitCount: number;
}

function getWeekRange(offsetWeeks: number): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7) + offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
}

function Trend({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return <Minus className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />;
  if (current > previous) return <TrendingUp className="w-3.5 h-3.5 text-[hsl(var(--success))]" />;
  if (current < previous) return <TrendingDown className="w-3.5 h-3.5 text-[hsl(var(--destructive))]" />;
  return <Minus className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />;
}

export function WeeklyReport() {
  const { user } = useAuthStore();
  const { habits } = useHabitStore();
  const [weekStats, setWeekStats] = useState<WeekStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchWeeklyStats();
  }, [user?.id]);

  async function fetchWeeklyStats() {
    try {
      const results = await Promise.all(
        [-3, -2, -1, 0].map((offset) => {
          const range = getWeekRange(offset);
          return supabase
            .from('habit_logs')
            .select('habit_id, xp_earned, completed_at')
            .eq('user_id', user!.id)
            .gte('completed_at', range.start)
            .lte('completed_at', range.end);
        })
      );
      setWeekStats(results.map((r) => computeStats(r.data ?? [])));
    } finally {
      setLoading(false);
    }
  }

  function computeStats(logs: { habit_id: string; xp_earned: number }[]): WeekStats {
    const xp = logs.reduce((sum, l) => sum + l.xp_earned, 0);
    const completions = logs.length;
    const habitCounts: Record<string, number> = {};
    for (const log of logs) {
      habitCounts[log.habit_id] = (habitCounts[log.habit_id] ?? 0) + 1;
    }
    const topHabitId = Object.entries(habitCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const topHabitCount = topHabitId ? habitCounts[topHabitId] : 0;
    return { xp, completions, uniqueHabits: Object.keys(habitCounts).length, topHabitId, topHabitCount };
  }

  async function handleShare() {
    const thisWeek = weekStats[3];
    const lastWeek = weekStats[2];
    if (!thisWeek) return;

    const topHabit = thisWeek.topHabitId ? habits.find((h) => h.id === thisWeek.topHabitId) : null;
    const diff = thisWeek.completions - (lastWeek?.completions ?? 0);
    const diffStr = diff > 0 ? `+${diff} vs last week` : diff < 0 ? `${diff} vs last week` : 'same as last week';

    const text = [
      `📊 My Habitry week:`,
      `✅ ${thisWeek.completions} completions (${diffStr})`,
      `⚡ ${thisWeek.xp} XP earned`,
      topHabit ? `⭐ Top habit: ${topHabit.name}` : null,
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: ignore
    }
  }

  const thisWeek = weekStats[3] ?? null;
  const lastWeek = weekStats[2] ?? null;
  const topHabit = thisWeek?.topHabitId ? habits.find((h) => h.id === thisWeek.topHabitId) : null;

  const thisRange = getWeekRange(0);
  const weekLabel = `${new Date(thisRange.start + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(thisRange.end + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  const maxCompletions = Math.max(1, ...weekStats.map((w) => w?.completions ?? 0));
  const weekLabels = ['3w ago', '2w ago', 'Last', 'This'];

  if (loading) {
    return <div className="h-32 rounded-xl bg-[hsl(var(--secondary))] animate-pulse" />;
  }

  return (
    <div className="p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm">This Week's Report</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{weekLabel}</p>
        </div>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] transition-colors text-[hsl(var(--muted-foreground))]"
        >
          <Share2 className="w-3.5 h-3.5" />
          {copied ? 'Copied!' : 'Share'}
        </button>
      </div>

      {/* 4-week trend bar chart */}
      <div className="flex items-end gap-1.5 h-16 mb-4">
        {weekStats.map((week, i) => {
          const pct = maxCompletions > 0 ? (week?.completions ?? 0) / maxCompletions : 0;
          const isThisWeek = i === 3;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                {week?.completions ?? 0}
              </span>
              <div className="w-full rounded-t-sm" style={{
                height: `${Math.max(4, pct * 36)}px`,
                backgroundColor: isThisWeek ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.3)',
              }} />
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{weekLabels[i]}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* XP */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--secondary)/0.5)]">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--accent)/0.2)] flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-[hsl(var(--accent))]" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold">{thisWeek?.xp ?? 0}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">XP earned</p>
          </div>
          <Trend current={thisWeek?.xp ?? 0} previous={lastWeek?.xp ?? 0} />
        </div>

        {/* Completions */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--secondary)/0.5)]">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary)/0.2)] flex items-center justify-center shrink-0">
            <CheckSquare className="w-4 h-4 text-[hsl(var(--primary))]" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold">{thisWeek?.completions ?? 0}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Completions</p>
          </div>
          <Trend current={thisWeek?.completions ?? 0} previous={lastWeek?.completions ?? 0} />
        </div>

        {/* Active habits */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--secondary)/0.5)]">
          <div className="w-8 h-8 rounded-lg bg-[hsl(142,71%,45%,0.2)] flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-[hsl(142,71%,45%)]" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold">{thisWeek?.uniqueHabits ?? 0}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Active habits</p>
          </div>
          <Trend current={thisWeek?.uniqueHabits ?? 0} previous={lastWeek?.uniqueHabits ?? 0} />
        </div>

        {/* Top habit */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--secondary)/0.5)]">
          <div className="w-8 h-8 rounded-lg bg-[hsl(38,92%,50%,0.2)] flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 text-[hsl(var(--accent))]" />
          </div>
          <div className="min-w-0 flex-1">
            {topHabit ? (
              <>
                <p className="text-sm font-bold truncate" style={{ color: topHabit.color }}>{topHabit.name}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{thisWeek?.topHabitCount}× this week</p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-[hsl(var(--muted-foreground))]">—</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Top habit</p>
              </>
            )}
          </div>
        </div>
      </div>

      {thisWeek && lastWeek && thisWeek.completions > lastWeek.completions && (
        <div className="mt-3 text-xs text-center text-[hsl(var(--success))] font-medium">
          🎉 {thisWeek.completions - lastWeek.completions} more completions than last week — keep it up!
        </div>
      )}
      {thisWeek && thisWeek.completions === 0 && (
        <div className="mt-3 text-xs text-center text-[hsl(var(--muted-foreground))]">
          No completions yet this week. Start today! 💪
        </div>
      )}
    </div>
  );
}
