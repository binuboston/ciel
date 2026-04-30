import type {Transition, Variants} from 'motion/react';

/**
 * Centralized motion language for the storefront.
 * Importing from here keeps animation timings consistent across components
 * and lets us tune the whole storefront from one place.
 */

export const easings = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  inOutExpo: [0.87, 0, 0.13, 1] as const,
  spring: [0.2, 0.8, 0.2, 1] as const,
};

export const durations = {
  fast: 0.15,
  base: 0.32,
  slow: 0.6,
  page: 0.7,
};

export const fadeUp: Variants = {
  hidden: {opacity: 0, y: 24},
  show: {
    opacity: 1,
    y: 0,
    transition: {duration: durations.slow, ease: easings.outExpo},
  },
};

export const fadeIn: Variants = {
  hidden: {opacity: 0},
  show: {
    opacity: 1,
    transition: {duration: durations.base, ease: easings.outExpo},
  },
};

export const scaleIn: Variants = {
  hidden: {opacity: 0, scale: 0.96},
  show: {
    opacity: 1,
    scale: 1,
    transition: {duration: durations.slow, ease: easings.outExpo},
  },
};

export const stagger = (delayChildren = 0, staggerChildren = 0.08): Variants => ({
  hidden: {},
  show: {
    transition: {
      delayChildren,
      staggerChildren,
    },
  },
});

export const slideRight: Variants = {
  hidden: {x: '100%'},
  show: {
    x: 0,
    transition: {duration: durations.slow, ease: easings.outExpo},
  },
  exit: {
    x: '100%',
    transition: {duration: durations.base, ease: easings.inOutExpo},
  },
};

export const slideLeft: Variants = {
  hidden: {x: '-100%'},
  show: {
    x: 0,
    transition: {duration: durations.slow, ease: easings.outExpo},
  },
  exit: {
    x: '-100%',
    transition: {duration: durations.base, ease: easings.inOutExpo},
  },
};

export const baseTransition: Transition = {
  duration: durations.base,
  ease: easings.outExpo,
};
