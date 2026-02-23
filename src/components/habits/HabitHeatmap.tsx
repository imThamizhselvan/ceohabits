import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../lib/utils';

const DAYS = 7;
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getWeeks(): number {
  return window.innerWidth < 640 ? 8 : 16;
}

function getColor(count: number, isDark: boolean): string {
  if (count === 0) return isDark ? '#1e293b' : '#f1f5f9';
  if (count === 1) return '#818cf8';
  if (count === 2) return '#6366f1';
  if (count === 3) return '#4f46e5';
  return '#3730a3';
}

export function HabitHeatmap() {
  const { user } = useAuthStore();
  const [data, setData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);
  const [weeks, setWeeks] = useState(getWeeks);
  const isDark = document.documentElement.classList.contains('dark');

  useEffect(() => {
    function onResize() { setWeeks(getWeeks()); }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchLogs();
  }, [user?.id]);

  async function fetchLogs() {
    const since = new Date();
    since.setDate(since.getDate() - 16 * 7); // always fetch max 16 weeks
    const sinceStr = since.toISOString().split('T')[0];

    try {
      const { data: logs } = await supabase
        .from('habit_logs')
        .select('completed_at')
        .eq('user_id', user!.id)
        .gte('completed_at', sinceStr);

      const counts: Record<string, number> = {};
      for (const log of logs ?? []) {
        counts[log.completed_at] = (counts[log.completed_at] ?? 0) + 1;
      }
      setData(counts);
    } finally {
      setLoading(false);
    }
  }

  // Build grid: columns = weeks, rows = days (Sun-Sat)
  const grid: { date: string; count: number }[][] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (weeks * 7 - 1));
  // Align to previous Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  for (let w = 0; w < weeks; w++) {
    const week: { date: string; count: number }[] = [];
    for (let d = 0; d < DAYS; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      const dateStr = date.toISOString().split('T')[0];
      const isFuture = date > today;
      week.push({ date: dateStr, count: isFuture ? -1 : (data[dateStr] ?? 0) });
    }
    grid.push(week);
  }

  // Month labels: find first week where month changes
  const monthMarkers: { week: number; label: string }[] = [];
  let lastMonth = -1;
  for (let w = 0; w < weeks; w++) {
    const month = new Date(grid[w][0].date).getMonth();
    if (month !== lastMonth) {
      monthMarkers.push({ week: w, label: MONTH_LABELS[month] });
      lastMonth = month;
    }
  }

  const totalThisPeriod = Object.values(data).reduce((sum, v) => sum + v, 0);

  return (
    <div className="p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm">Activity Heatmap</h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
            {totalThisPeriod} completions · last {weeks} weeks
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((v) => (
            <div
              key={v}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getColor(v, isDark) }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {loading ? (
        <div className="h-24 rounded-lg bg-[hsl(var(--secondary))] animate-pulse" />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Month labels */}
            <div className="flex mb-1 pl-8">
              {grid.map((_, w) => {
                const marker = monthMarkers.find((m) => m.week === w);
                return (
                  <div key={w} className="w-4 mr-0.5 text-xs text-[hsl(var(--muted-foreground))] shrink-0">
                    {marker ? marker.label : ''}
                  </div>
                );
              })}
            </div>

            {/* Grid */}
            <div className="flex gap-0.5">
              {/* Day labels */}
              <div className="flex flex-col gap-0.5 mr-1.5">
                {DAY_LABELS.map((d, i) => (
                  <div key={d} className={cn('w-6 h-3.5 text-xs text-[hsl(var(--muted-foreground))] flex items-center justify-end pr-1', i % 2 !== 0 && 'invisible')}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Week columns */}
              {grid.map((week, w) => (
                <div key={w} className="flex flex-col gap-0.5">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className="w-3.5 h-3.5 rounded-sm cursor-pointer transition-transform hover:scale-125 relative"
                      style={{
                        backgroundColor: day.count < 0 ? 'transparent' : getColor(day.count, isDark),
                      }}
                      onMouseEnter={(e) => {
                        if (day.count >= 0) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({ date: day.date, count: day.count, x: rect.left, y: rect.top });
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1 rounded-md text-xs bg-[hsl(var(--foreground))] text-[hsl(var(--background))] pointer-events-none shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y - 32 }}
        >
          {tooltip.count} completion{tooltip.count !== 1 ? 's' : ''} · {new Date(tooltip.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      )}
    </div>
  );
}
