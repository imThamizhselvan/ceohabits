import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { LEVELS, getLevelFromXP } from '../../lib/gamification';

interface CareerProgressModalProps {
  open: boolean;
  onClose: () => void;
  xp: number;
}

export function CareerProgressModal({ open, onClose, xp }: CareerProgressModalProps) {
  const currentLevel = getLevelFromXP(xp);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rank Path</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-2">
          {LEVELS.map((level) => {
            const isCompleted = xp >= level.xpRequired && level.level < currentLevel.level;
            const isCurrent = level.level === currentLevel.level;
            const isLocked = level.level > currentLevel.level;

            return (
              <div
                key={level.level}
                className="flex items-center gap-3 p-3 rounded-lg border border-[hsl(var(--border))]"
                style={isCurrent ? { borderLeftWidth: 3, borderLeftColor: level.color } : {}}
              >
                {/* Icon bubble */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: `${level.color}22` }}
                >
                  {level.icon}
                </div>

                {/* Name + XP */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">{level.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {level.xpRequired.toLocaleString()} XP required
                  </p>
                </div>

                {/* Status chip */}
                {isCompleted && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 whitespace-nowrap">
                    ✓ Completed
                  </span>
                )}
                {isCurrent && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{ backgroundColor: `${level.color}22`, color: level.color }}
                  >
                    ▶ Current
                  </span>
                )}
                {isLocked && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                    🔒 Locked
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-center text-xs text-[hsl(var(--muted-foreground))]">
          Your total XP: <span className="font-semibold text-[hsl(var(--foreground))]">{xp.toLocaleString()}</span>
        </p>
      </DialogContent>
    </Dialog>
  );
}
