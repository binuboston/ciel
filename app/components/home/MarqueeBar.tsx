import {Star} from 'lucide-react';
import {Marquee} from '~/components/motion/Marquee';

const DEFAULT_ITEMS = [
  'Free worldwide shipping over $150',
  'Member-only drops',
  '60-day returns',
  'Carbon-neutral delivery',
  'Made in small batches',
  'Built to last',
];

interface MarqueeBarProps {
  items?: string[];
  /** Optional secondary row to add visual depth. */
  reverse?: boolean;
}

export function MarqueeBar({items = DEFAULT_ITEMS, reverse}: MarqueeBarProps) {
  return (
    <div className="surface-dark border-y border-white/10">
      <Marquee reverse={reverse} className="py-4 text-[var(--color-ink)]">
        {items.map((item) => (
          <span
            key={item}
            className="flex items-center gap-3 font-display text-sm font-medium uppercase tracking-[0.2em] whitespace-nowrap"
          >
            {item}
            <Star className="h-3.5 w-3.5 text-[var(--color-accent)]" fill="currentColor" />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
