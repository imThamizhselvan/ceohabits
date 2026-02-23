import { SignIn } from '@clerk/clerk-react';
import { Crown } from 'lucide-react';

export function Auth() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo + headline */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--primary))] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">CEOhabits</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2">
            Build the habits of a world-class leader
          </p>
        </div>

        {/* Gamification teaser */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: '⚡', label: 'Earn XP', sub: 'for every habit' },
            { icon: '🔥', label: 'Build Streaks', sub: 'daily consistency' },
            { icon: '👑', label: 'Reach CEO', sub: 'climb the ranks' },
          ].map((item) => (
            <div
              key={item.label}
              className="text-center p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <p className="text-xs font-semibold text-[hsl(var(--foreground))]">{item.label}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Auth form */}
        <div className="flex justify-center">
          <SignIn routing="hash" />
        </div>

        <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-6">
          Your journey to the corner office starts with one habit.
        </p>
      </div>
    </div>
  );
}
