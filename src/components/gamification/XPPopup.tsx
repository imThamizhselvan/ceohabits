import { motion, AnimatePresence } from 'framer-motion';

interface XPPopupProps {
  xp: number;
  visible: boolean;
  streak?: number;
}

export function XPPopup({ xp, visible, streak }: XPPopupProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -32, scale: 1 }}
          exit={{ opacity: 0, y: -60, scale: 0.8 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-bold text-sm text-[hsl(var(--accent))] drop-shadow-md whitespace-nowrap">
              +{xp} XP ⚡
            </span>
            {streak && streak > 1 && (
              <span className="text-xs text-orange-500 font-medium">
                🔥 {streak} streak!
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
