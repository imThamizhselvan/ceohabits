-- ============================================================
-- Habitry - Supabase Schema (Clerk Auth)
-- Run this in your Supabase SQL Editor
-- NOTE: Uses Clerk user IDs (text) instead of Supabase auth UUIDs
-- ============================================================

-- ── PROFILES ──────────────────────────────────────────────
create table public.profiles (
  id          text primary key,
  username    text,
  avatar_url  text,
  xp          integer not null default 0,
  level       integer not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles disable row level security;

-- ── HABITS ────────────────────────────────────────────────
create table public.habits (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  name        text not null,
  category    text not null default 'general',
  frequency   text not null default 'daily',
  difficulty  text not null default 'medium',
  icon        text not null default 'check-circle',
  color       text not null default '#6366f1',
  notes       text,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.habits disable row level security;

-- ── HABIT LOGS ────────────────────────────────────────────
create table public.habit_logs (
  id           uuid primary key default gen_random_uuid(),
  habit_id     uuid not null references public.habits(id) on delete cascade,
  user_id      text not null,
  xp_earned    integer not null default 0,
  completed_at date not null default current_date,
  created_at   timestamptz not null default now(),
  unique (habit_id, completed_at)
);

alter table public.habit_logs disable row level security;

create index habit_logs_streak_idx on public.habit_logs (habit_id, completed_at desc);
create index habit_logs_user_date_idx on public.habit_logs (user_id, completed_at desc);

-- ── ACHIEVEMENTS ──────────────────────────────────────────
create table public.achievements (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  description     text not null,
  icon            text not null default 'trophy',
  condition_type  text not null,
  condition_value integer not null,
  xp_reward       integer not null default 0,
  rarity          text not null default 'common'
);

alter table public.achievements disable row level security;

-- Seed achievements
insert into public.achievements (name, description, icon, condition_type, condition_value, xp_reward, rarity) values
  ('First Step',     'Complete your first habit',       'footprints', 'total_completions', 1,    25,   'common'),
  ('Habit Starter',  'Complete 10 habits total',        'zap',        'total_completions', 10,   50,   'common'),
  ('Consistent',     'Complete 50 habits total',        'check',      'total_completions', 50,   100,  'common'),
  ('Century Club',   'Complete 100 habits total',       'trophy',     'total_completions', 100,  200,  'rare'),
  ('Legend',         'Complete 500 habits total',       'star',       'total_completions', 500,  1000, 'epic'),
  ('3-Day Starter',  'Maintain a 3-day streak',         'flame',      'streak',            3,    50,   'common'),
  ('Week Warrior',   'Maintain a 7-day streak',         'fire',       'streak',            7,    150,  'rare'),
  ('Fortnight',      'Maintain a 14-day streak',        'bolt',       'streak',            14,   300,  'rare'),
  ('Month Master',   'Maintain a 30-day streak',        'crown',      'streak',            30,   500,  'epic'),
  ('Iron Will',      'Maintain a 100-day streak',       'shield',     'streak',            100,  2000, 'legendary'),
  ('Rising Star',    'Reach Sr. Manager (Level 3)',     'star',       'level',             3,    100,  'common'),
  ('Executive',      'Reach VP (Level 5)',              'briefcase',  'level',             5,    300,  'rare'),
  ('Corner Office',  'Reach CEO (Level 8) 👑',          'crown',      'level',             8,    1000, 'legendary');

-- ── USER ACHIEVEMENTS ─────────────────────────────────────
create table public.user_achievements (
  id             uuid primary key default gen_random_uuid(),
  user_id        text not null,
  achievement_id uuid not null references public.achievements(id),
  earned_at      timestamptz not null default now(),
  unique (user_id, achievement_id)
);

alter table public.user_achievements disable row level security;

-- ── REALTIME ──────────────────────────────────────────────
alter publication supabase_realtime add table public.habit_logs;
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.user_achievements;

-- ── TODOS ─────────────────────────────────────────────────
create table public.todos (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  title       text not null,
  description text,
  priority    text not null default 'medium',  -- 'low' | 'medium' | 'high'
  due_date    date,
  is_done     boolean not null default false,
  xp_earned   integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.todos disable row level security;
create index todos_user_idx on public.todos (user_id, created_at desc);

-- ── REMINDERS ─────────────────────────────────────────────
create table public.reminders (
  id              uuid primary key default gen_random_uuid(),
  user_id         text not null,
  title           text not null,
  description     text,
  reminder_date   date not null,
  reminder_time   time not null,
  is_dismissed    boolean not null default false,
  created_at      timestamptz not null default now()
);
alter table public.reminders disable row level security;
create index reminders_user_date_idx on public.reminders (user_id, reminder_date asc, reminder_time asc);

-- ── NOTES ─────────────────────────────────────────────────
create table public.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  title      text not null,
  content    text not null default '',
  tags       text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.notes disable row level security;
create index notes_user_idx on public.notes (user_id, updated_at desc);
