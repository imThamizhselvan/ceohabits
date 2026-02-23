import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
}

export function StatsCard({ icon: Icon, label, value, subtext, color = 'hsl(var(--primary))' }: StatsCardProps) {
  return (
    <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
          style={{ backgroundColor: color + '20' }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{value}</p>
      <p className="text-sm text-[hsl(var(--muted-foreground))]">{label}</p>
      {subtext && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{subtext}</p>}
    </div>
  );
}
