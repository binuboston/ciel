import {motion, useReducedMotion, type Variants} from 'motion/react';
import {type ReactNode} from 'react';
import {fadeUp} from '~/lib/motion';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Custom variant (defaults to fadeUp). */
  variants?: Variants;
  /** Delay before the reveal starts (s). */
  delay?: number;
  /** How much of the element must be visible before reveal triggers (0-1). */
  amount?: number;
  /** When true, only animates once. Default true. */
  once?: boolean;
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'ul' | 'li';
}

/**
 * Reveals children when scrolled into view. Respects prefers-reduced-motion
 * by rendering them statically.
 */
export function ScrollReveal({
  children,
  className,
  variants = fadeUp,
  delay = 0,
  amount = 0.2,
  once = true,
  as = 'div',
}: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{once, amount}}
      variants={variants}
      transition={{delay}}
    >
      {children}
    </MotionTag>
  );
}
