import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, RefreshCw } from 'lucide-react';

const QUOTES = [
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "It's not about ideas. It's about making ideas happen.", author: "Scott Belsky, Behance" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "The function of leadership is to produce more leaders, not more followers.", author: "Ralph Nader" },
  { text: "Management is doing things right; leadership is doing the right things.", author: "Peter Drucker" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Earn your leadership every day.", author: "Michael Jordan" },
  { text: "A leader is one who knows the way, goes the way, and shows the way.", author: "John C. Maxwell" },
  { text: "The best executive is the one who has sense enough to pick good men to do what he wants done, and self-restraint to keep from meddling with them while they do it.", author: "Theodore Roosevelt" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Excellence is not a skill, it's an attitude.", author: "Ralph Marston" },
  { text: "Small habits, big results. Every rep counts.", author: "James Clear" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "First forget inspiration. Habit is more dependable.", author: "Octavia Butler" },
  { text: "You don't rise to the level of your goals, you fall to the level of your systems.", author: "James Clear" },
  { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
  { text: "To win in the marketplace you must first win in the workplace.", author: "Doug Conant, Campbell Soup" },
  { text: "The key to successful leadership is influence, not authority.", author: "Ken Blanchard" },
  { text: "Your reputation is the most important thing you'll ever have — build it one habit at a time.", author: "Warren Buffett" },
  { text: "Control your own destiny or someone else will.", author: "Jack Welch, GE" },
  { text: "Good business leaders create a vision, articulate the vision, passionately own the vision, and relentlessly drive it to completion.", author: "Jack Welch" },
  { text: "The biggest risk is not taking any risk.", author: "Mark Zuckerberg" },
  { text: "Move fast and build things that last.", author: "CEO Mindset" },
  { text: "Work hard in silence. Let your success be your noise.", author: "Frank Ocean" },
  { text: "Don't count the days. Make the days count.", author: "Muhammad Ali" },
  { text: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson" },
];

function getDailyQuoteIndex() {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return dayOfYear % QUOTES.length;
}

export function MotivationalQuote() {
  const [index, setIndex] = useState(getDailyQuoteIndex());
  const [refreshing, setRefreshing] = useState(false);
  const quote = QUOTES[index];

  function refresh() {
    setRefreshing(true);
    setTimeout(() => {
      setIndex((i) => (i + 1) % QUOTES.length);
      setRefreshing(false);
    }, 200);
  }

  return (
    <div className="relative p-5 rounded-xl border border-[hsl(var(--primary)/0.2)] bg-gradient-to-br from-[hsl(var(--primary)/0.08)] to-[hsl(var(--accent)/0.05)] overflow-hidden">
      {/* Decorative quote mark */}
      <Quote className="absolute top-3 right-4 w-16 h-16 text-[hsl(var(--primary)/0.08)] rotate-180" />

      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary)/0.15)] flex items-center justify-center shrink-0 mt-0.5">
          <Quote className="w-4 h-4 text-[hsl(var(--primary))]" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))] mb-2">
            Daily Wisdom
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <blockquote className="text-sm font-medium text-[hsl(var(--foreground))] leading-relaxed mb-2">
                "{quote.text}"
              </blockquote>
              <cite className="text-xs text-[hsl(var(--muted-foreground))] not-italic font-medium">
                — {quote.author}
              </cite>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={refresh}
          className="shrink-0 p-1.5 rounded-lg hover:bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
          aria-label="New quote"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}
