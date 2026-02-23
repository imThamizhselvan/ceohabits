import { HABIT_CATEGORIES } from '../../types/habit';

interface CategoryTagProps {
  category: string;
}

const categoryColorMap: Record<string, string> = {
  health: '#22c55e',
  mindfulness: '#a78bfa',
  learning: '#60a5fa',
  productivity: '#f59e0b',
  social: '#f472b6',
  creativity: '#fb923c',
  finance: '#34d399',
  general: '#94a3b8',
};

export function CategoryTag({ category }: CategoryTagProps) {
  const cat = HABIT_CATEGORIES.find((c) => c.value === category);
  const color = categoryColorMap[category] ?? '#94a3b8';

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: color + '20', color }}
    >
      {cat?.emoji} {cat?.label ?? category}
    </span>
  );
}
