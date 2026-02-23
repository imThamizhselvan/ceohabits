import { motion, AnimatePresence } from 'framer-motion';
import { LEVELS } from '../../lib/gamification';
import { Button } from '../ui/button';

interface LevelUpModalProps {
  level: number;
  onClose: () => void;
}

export function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  const levelData = LEVELS.find((l) => l.level === level) ?? LEVELS[0];

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 400,
    y: (Math.random() - 0.5) * 400,
    rotate: Math.random() * 720,
    color: ['#6366f1', '#f59e0b', '#22c55e', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 5)],
  }));

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Confetti particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute w-3 h-3 rounded-sm"
              style={{ backgroundColor: p.color }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
              animate={{ x: p.x, y: p.y, opacity: 0, scale: 0, rotate: p.rotate }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: Math.random() * 0.3 }}
            />
          ))}
        </div>

        {/* Modal content */}
        <motion.div
          className="relative z-10 text-center px-8 py-10 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] max-w-sm w-full mx-4 shadow-2xl"
          initial={{ scale: 0.5, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1.2, 1.1, 1] }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {levelData.icon}
          </motion.div>

          <div className="mb-1 text-xs font-semibold tracking-widest uppercase text-[hsl(var(--muted-foreground))]">
            Rank Unlocked!
          </div>
          <h2 className="text-3xl font-bold mb-1" style={{ color: levelData.color }}>
            {levelData.name}
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mb-6">
            You've reached Level {levelData.level} on your journey to the corner office. Keep climbing!
          </p>

          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ backgroundColor: `${levelData.color}20`, color: levelData.color }}
          >
            Level {levelData.level} achieved 🎉
          </div>

          <Button className="w-full" onClick={onClose}>
            Keep Climbing 🚀
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
