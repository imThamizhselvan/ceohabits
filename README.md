# Lumen — Gamified Habit Tracker

Lumen is a habit tracking application that turns building good habits into a game. Earn XP, climb through career-themed levels, unlock achievements, and maintain streaks to stay motivated.

## Features

- **Habit Tracking** — Create habits with custom frequency (daily, weekly, weekdays), difficulty, icon, and color
- **Gamification** — Earn XP for completing habits and level up through 8 career tiers: Spark → Ember → Glow → Radiance → Beacon → Luminary → Nova → Lumen
- **Streaks & Multipliers** — Keep your streak alive to earn bonus XP (up to 2× at 30+ days)
- **Achievements** — Unlock badges across common, rare, epic, and legendary rarity tiers
- **Daily Login Bonus** — Earn 5 XP just for showing up
- **Productivity Tools** — Todos, reminders, and notes built in
- **Weekly Reports** — See your performance over the past week

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4, Radix UI |
| Animations | Framer Motion |
| State | Zustand |
| Routing | React Router v7 |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Clerk](https://clerk.com) application

### Setup

1. Clone the repository:

   ```bash
   git clone <repo-url>
   cd ceohabits
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the environment template and fill in your keys:

   ```bash
   cp .env.local.example .env.local
   ```

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

4. Set up the database by running `supabase-schema.sql` in your Supabase SQL editor.

5. Start the development server:

   ```bash
   npm run dev
   ```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Gamification Details

### Levels

| Level | Name |
|---|---|
| 1 | Spark |
| 2 | Ember |
| 3 | Glow |
| 4 | Radiance |
| 5 | Beacon |
| 6 | Luminary |
| 7 | Nova |
| 8 | Lumen |

### XP Rewards

| Difficulty | Base XP |
|---|---|
| Easy | 10 XP |
| Medium | 25 XP |
| Hard | 50 XP |

### Streak Multipliers

| Streak | Multiplier |
|---|---|
| 3 days | 1.1× |
| 7 days | 1.25× |
| 14 days | 1.5× |
| 30 days | 2.0× |

## Deployment

The project is configured for [Netlify](https://netlify.com). The `netlify.toml` file handles SPA routing redirects automatically.

## License

Private project.
