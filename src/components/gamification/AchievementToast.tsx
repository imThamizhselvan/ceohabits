import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Achievement } from '../../types/gamification';

interface AchievementToastProps {
  achievements: Achievement[];
  onClose: () => void;
}

const rarityColors: Record<string, string> = {
  common: '#60a5fa',
  rare: '#818cf8',
  epic: '#c084fc',
  legendary: '#fbbf24',
};

const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 160,
  y: (Math.random() - 0.5) * 160,
  rotate: Math.random() * 720,
  color: ['#6366f1', '#f59e0b', '#22c55e', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 5)],
}));

export function AchievementToast({ achievements, onClose }: AchievementToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 space-y-2 max-w-xs w-full">
      <AnimatePresence>
        {achievements.map((ach, i) => {
          const color = rarityColors[ach.rarity] ?? rarityColors.common;
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ delay: i * 0.15, type: 'spring', stiffness: 200 }}
              className="relative overflow-hidden flex items-center gap-3 p-4 rounded-xl border bg-[hsl(var(--card))] shadow-lg cursor-pointer"
              style={{ borderColor: color + '60' }}
              onClick={onClose}
            >
              {/* Confetti particles */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                {particles.map((p) => (
                  <motion.div
                    key={p.id}
                    className="absolute w-2 h-2 rounded-sm"
                    style={{ backgroundColor: p.color }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                    animate={{ x: p.x, y: p.y, opacity: 0, scale: 0, rotate: p.rotate }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.15 + Math.random() * 0.3 }}
                  />
                ))}
              </div>

              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: color + '20' }}
              >
                🏆
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
                  Achievement Unlocked!
                </p>
                <p className="text-sm font-bold text-[hsl(var(--foreground))]">{ach.name}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{ach.description}</p>
                {ach.xp_reward > 0 && (
                  <p className="text-xs font-bold text-[hsl(var(--accent))] mt-0.5">+{ach.xp_reward} XP</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
