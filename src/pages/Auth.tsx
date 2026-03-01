import { SignIn } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Crown, Zap, Flame, Trophy, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LEVELS } from '../lib/gamification';
import { buttonVariants } from '../components/ui/button';
import { cn } from '../lib/utils';

const goldGradient = {
  backgroundImage: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #d97706 100%)',
} as const;

const bullets = [
  {
    icon: Zap,
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    title: 'Earn XP for every habit',
    description: '10–50 XP per completion, with streak multipliers.',
  },
  {
    icon: Flame,
    iconColor: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    title: 'Streak multipliers compound fast',
    description: '7-day = 1.25×, 30-day = 2× XP earned.',
  },
  {
    icon: Trophy,
    iconColor: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    title: 'Unlock rare achievements',
    description: 'Rare, Epic, and Legendary badges await.',
  },
];

export function Auth() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel */}
      <div className="lg:w-[55%] bg-[hsl(224,71%,4%)] text-white flex flex-col p-8 lg:p-12 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-amber-500/15 blur-[100px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-orange-500/10 blur-[80px] translate-x-1/3 translate-y-1/3" />
        </div>

        {/* Logo link */}
        <Link
          to="/"
          className="relative z-10 flex items-center gap-2 mb-12 w-fit group"
        >
          <div className="w-8 h-8 rounded-lg xp-gradient flex items-center justify-center transition-opacity group-hover:opacity-80">
            <Crown className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-lg">Habitry</span>
        </Link>

        {/* Middle content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg">
          <motion.h1
            className="text-4xl lg:text-5xl font-extrabold mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Build habits that{' '}
            <span className="bg-clip-text text-transparent" style={goldGradient}>define leaders</span>
          </motion.h1>

          <motion.p
            className="text-white/60 text-base mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Track your daily disciplines, earn XP, build streaks, and climb from Intern to CEO —
            one consistent action at a time.
          </motion.p>

          {/* Feature bullets */}
          <div className="space-y-4 mb-10">
            {bullets.map((bullet, i) => (
              <motion.div
                key={bullet.title}
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    bullet.bgColor
                  )}
                >
                  <bullet.icon className={cn('w-5 h-5', bullet.iconColor)} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{bullet.title}</p>
                  <p className="text-white/50 text-xs mt-0.5">{bullet.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Career preview — first 4 levels */}
          <motion.div
            className="flex items-center gap-2 flex-wrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.55 }}
          >
            {LEVELS.slice(0, 4).map((level, i) => (
              <div key={level.level} className="flex items-center gap-1.5">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border"
                  style={{
                    color: level.color,
                    borderColor: `${level.color}40`,
                    backgroundColor: `${level.color}15`,
                  }}
                >
                  {level.icon} {level.name}
                </span>
                {i < 3 && <ArrowRight className="w-3 h-3 text-white/20" />}
              </div>
            ))}
            <span className="text-white/30 text-xs">+ 4 more</span>
          </motion.div>
        </div>

        {/* Bottom social proof */}
        <p className="relative z-10 mt-8 text-white/30 text-xs">
          Trusted by ambitious professionals building the habits that matter.
        </p>
      </div>

      {/* Right Panel */}
      <div className="lg:w-[45%] bg-[hsl(var(--background))] flex flex-col items-center justify-center p-8 lg:p-12">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
            Welcome back, leader.
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mb-8">
            Sign in to continue your journey to the top.
          </p>

          <div className="flex justify-center mb-8">
            <SignIn routing="hash" forceRedirectUrl="/dashboard" />
          </div>

          <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mb-6">
            Your journey to the corner office starts with one habit.
          </p>

          <div className="flex justify-center">
            <Link
              to="/"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'text-[hsl(var(--muted-foreground))]'
              )}
            >
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
