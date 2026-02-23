import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, ArrowRight, ChevronDown, Zap, Flame, Trophy } from 'lucide-react';
import { buttonVariants } from '../components/ui/button';
import { LEVELS } from '../lib/gamification';
import { cn } from '../lib/utils';

const HERO_VIDEO = 'https://assets.mixkit.co/videos/18063/18063-720.mp4';

const goldGradient = {
  backgroundImage: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #d97706 100%)',
} as const;

const features = [
  {
    icon: Zap,
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    title: 'Earn XP Every Day',
    description:
      'Complete habits and earn 10, 25, or 50 XP based on difficulty. Stack up experience with every consistent action.',
  },
  {
    icon: Flame,
    iconColor: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    title: 'Streak Multipliers',
    description:
      'Hit 7 days and earn 1.25× XP. Reach 30 days for a 2× multiplier. Consistency compounds your progress.',
  },
  {
    icon: Trophy,
    iconColor: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    title: 'Unlock Achievements',
    description:
      'Earn rare, epic, and legendary badges as you build the habits that define world-class leaders.',
  },
];

const stats = [
  { value: '10K+', label: 'Habits Tracked', icon: '✅' },
  { value: '2.5M', label: 'XP Earned', icon: '⚡' },
  { value: '94%', label: 'Streak Kept', icon: '🔥' },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Sticky Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a0a]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg xp-gradient flex items-center justify-center">
              <Crown className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-lg tracking-tight">CEOhabits</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              Sign In
            </Link>
            <Link
              to="/auth"
              className={cn(
                buttonVariants({ size: 'sm' }),
                'xp-gradient text-black font-semibold shadow-lg shadow-amber-900/40 border-0 hover:opacity-90'
              )}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative pt-16">
        {/* Background video */}
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-[0.18]"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>

        {/* Gradient overlay on top of video */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-transparent to-[#0a0a0a]" />

        {/* Gold radial glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-amber-500/10 blur-[140px]" />
          <div className="absolute top-2/3 left-1/4 w-[250px] h-[250px] rounded-full bg-orange-500/10 blur-[100px]" />
          <div className="absolute top-2/3 right-1/4 w-[250px] h-[250px] rounded-full bg-yellow-500/10 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-sm text-amber-300">
              👑 The habit tracker for high performers
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Build Habits That{' '}
            <span className="bg-clip-text text-transparent" style={goldGradient}>Make You CEO</span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-white/55 max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            CEOhabits turns your daily disciplines into a career-defining game. Earn XP, build
            streaks, unlock achievements, and climb from Intern to CEO — one habit at a time.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              to="/auth"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'xp-gradient text-black font-semibold shadow-xl shadow-amber-900/40 border-0 hover:opacity-90 px-8'
              )}
            >
              Start Your Climb — Free <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link
              to="/auth"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'border-white/20 text-white hover:bg-white/10 hover:border-white/40 hover:text-white px-8'
              )}
            >
              Sign In
            </Link>
          </motion.div>

          <motion.p
            className="text-sm text-white/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Free to start · No credit card required
          </motion.p>
        </div>

        {/* Bouncing chevron */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-amber-400/50"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How the game works</h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Every great leader is built through daily action. We make that action addictive.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="bg-[#111111] rounded-2xl p-6 border border-white/[0.08] hover:border-amber-500/25 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                    feature.bgColor
                  )}
                >
                  <feature.icon className={cn('w-6 h-6', feature.iconColor)} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Ladder Section */}
      <section className="py-24 px-6 bg-[#060606]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Climb the career ladder</h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Every XP milestone unlocks a new rank. From Intern to CEO, your habits define your
              title.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LEVELS.filter((l) => l.level < 8).map((level, i) => (
              <motion.div
                key={level.level}
                className="bg-[#111111] rounded-2xl p-5 border border-white/[0.08] hover:border-white/20 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                style={{ borderLeftColor: level.color, borderLeftWidth: 3 }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-xl"
                  style={{ backgroundColor: `${level.color}18` }}
                >
                  {level.icon}
                </div>
                <p className="font-semibold text-sm" style={{ color: level.color }}>
                  {level.name}
                </p>
                <p className="text-white/35 text-xs mt-1">
                  {level.xpRequired.toLocaleString()} XP
                </p>
              </motion.div>
            ))}

            {/* CEO card — spans full row */}
            {(() => {
              const ceo = LEVELS[LEVELS.length - 1];
              return (
                <motion.div
                  key={ceo.level}
                  className={cn(
                    'bg-[#111111] rounded-2xl p-6 border border-amber-500/20 rarity-legendary',
                    'col-span-1 sm:col-span-2 lg:col-span-4 text-center'
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 7 * 0.07 }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-3xl mx-auto"
                    style={{ backgroundColor: `${ceo.color}18` }}
                  >
                    {ceo.icon}
                  </div>
                  <p className="text-2xl font-bold mb-1" style={{ color: ceo.color }}>
                    {ceo.name}
                  </p>
                  <p className="text-white/40 text-sm mb-2">
                    {ceo.xpRequired.toLocaleString()} XP · Legendary Rank
                  </p>
                  <p className="text-white/30 text-sm max-w-md mx-auto">
                    The pinnacle of achievement. Reserved for those who turn consistency into legacy.
                  </p>
                </motion.div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div
                  className="text-4xl font-extrabold mb-1 bg-clip-text text-transparent"
                  style={goldGradient}
                >
                  {stat.value}
                </div>
                <div className="text-white/35 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="xp-gradient rounded-3xl p-12 text-center relative overflow-hidden">
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40 rounded-3xl" />
            {/* Decorative orbs */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
            <div className="relative z-10">
              <div className="text-4xl mb-4">👑</div>
              <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
                Ready to lead yourself?
              </h2>
              <p className="text-black/60 max-w-lg mx-auto mb-8 text-lg">
                Join thousands of high performers building the habits that define exceptional
                leaders. Your CEO journey starts today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/auth"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'bg-black text-white hover:bg-black/80 font-semibold px-8 border-0'
                  )}
                >
                  Start for Free <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <Link
                  to="/auth"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'border-black/30 text-black hover:bg-black/10 hover:text-black px-8'
                  )}
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg xp-gradient flex items-center justify-center">
              <Crown className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="font-bold">CEOhabits</span>
          </div>
          <p className="text-white/25 text-sm">© 2025 CEOhabits. Build your legacy.</p>
          <Link
            to="/auth"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'text-white/40 hover:text-white hover:bg-white/10'
            )}
          >
            Sign In →
          </Link>
        </div>
      </footer>
    </div>
  );
}
