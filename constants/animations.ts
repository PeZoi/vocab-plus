import type { Variants, Transition } from 'motion/react';

// Transition tokens
export const transitions = {
  springFast: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  } as Transition,
  springSmooth: {
    type: 'spring',
    stiffness: 300,
    damping: 25,
  } as Transition,
  springBouncy: {
    type: 'spring',
    stiffness: 500,
    damping: 20,
  } as Transition,
  easeOutFast: {
    duration: 0.2,
    ease: [0.16, 1, 0.3, 1],
  } as Transition,
  easeOutSmooth: {
    duration: 0.35,
    ease: [0.16, 1, 0.3, 1],
  } as Transition,
};

// Page fade & slide in
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.easeOutSmooth,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: transitions.easeOutFast,
  },
};

// Stagger Container for Grids & Lists
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

// Child items inside Stagger Container
export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.springSmooth,
  },
};

// Smooth Tab Switcher Variant
export const tabVariants: Variants = {
  initial: {
    opacity: 0,
    y: 6,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.easeOutFast,
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: transitions.easeOutFast,
  },
};

// Notification & Alert Slide
export const alertVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    y: -6,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.springFast,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -6,
    transition: transitions.easeOutFast,
  },
};
