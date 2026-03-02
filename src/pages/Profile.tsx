import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGamification } from '../hooks/useGamification';
import { useHabitStore } from '../store/useHabitStore';
import { useAccentColor, ACCENT_COLORS } from '../hooks/useAccentColor';
import { XPBar } from '../components/gamification/XPBar';
import { LevelBadge } from '../components/gamification/LevelBadge';
import { StatsCard } from '../components/gamification/StatsCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Flame, CheckSquare, Trophy, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../lib/utils';

export function Profile() {
  const { user, profile } = useAuth();
  const { xp, streaks, userAchievements } = useGamification();
  const { logs } = useHabitStore();
  const { setProfile } = useAuthStore();
  const { accent, setAccent } = useAccentColor();

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username ?? '');
  const [saving, setSaving] = useState(false);

  const longestStreak = Math.max(0, ...Object.values(streaks));
  const totalCompletions = logs.length;

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .update({ username, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();
      if (data) setProfile(data);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const avatarInitial = profile?.username?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Profile</h1>

      {/* Avatar + info */}
      <div className="flex items-center gap-5 p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--primary))] flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" className="w-full h-full rounded-2xl object-cover" />
          ) : (
            avatarInitial
          )}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label htmlFor="username" className="text-xs">Display Name</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1"
                  placeholder="Your name"
                />
              </div>
              <Button size="sm" onClick={saveProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <>
              <p className="font-bold text-lg truncate">
                {profile?.username ?? user?.email?.split('@')[0] ?? 'Leader'}
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] truncate">{user?.email}</p>
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-[hsl(var(--primary))] mt-1 hover:underline"
              >
                Edit name
              </button>
            </>
          )}
        </div>
        {profile && <LevelBadge xp={profile.xp} size="md" />}
      </div>

      {/* XP Progress */}
      {profile && (
        <div className="p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <h2 className="font-semibold mb-4">Rank Progress</h2>
          <XPBar xp={profile.xp} />
        </div>
      )}

      {/* Stats */}
      <div>
        <h2 className="font-semibold mb-3">Your Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatsCard
            icon={CheckSquare}
            label="Total Completions"
            value={totalCompletions}
            subtext="All time"
            color="hsl(var(--primary))"
          />
          <StatsCard
            icon={Flame}
            label="Best Streak"
            value={`${longestStreak} days`}
            color="#f97316"
          />
          <StatsCard
            icon={Zap}
            label="Total XP"
            value={xp.toLocaleString()}
            subtext="Keep earning!"
            color="hsl(var(--accent))"
          />
          <StatsCard
            icon={Trophy}
            label="Achievements"
            value={userAchievements.length}
            subtext="Unlocked"
            color="#fbbf24"
          />
        </div>
      </div>

      {/* Accent color */}
      <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <h2 className="font-semibold mb-1">Accent Color</h2>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3">Personalise the app's primary color</p>
        <div className="flex gap-2.5 flex-wrap">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.hsl}
              onClick={() => setAccent(c.hsl)}
              title={c.label}
              className={cn(
                'w-8 h-8 rounded-full transition-all',
                accent === c.hsl
                  ? 'ring-2 ring-offset-2 ring-[hsl(var(--ring))] scale-110'
                  : 'hover:scale-105 opacity-80 hover:opacity-100'
              )}
              style={{ backgroundColor: c.hex }}
              aria-label={c.label}
            />
          ))}
        </div>
      </div>

      {/* Account info */}
      <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <h2 className="font-semibold mb-3">Account</h2>
        <div className="text-sm space-y-2 text-[hsl(var(--muted-foreground))]">
          <p>Email: <span className="text-[hsl(var(--foreground))]">{user?.email}</span></p>
          <p>Member since: <span className="text-[hsl(var(--foreground))]">
            {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '—'}
          </span></p>
        </div>
      </div>
    </div>
  );
}
