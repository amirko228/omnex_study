'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ReactNode } from 'react';

export interface TransitionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

// Detect if device is mobile
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

// Reduced motion settings for mobile
const getAnimationConfig = () => {
  const mobile = isMobile();
  return {
    duration: mobile ? 0.3 : 0.5,
    ease: (mobile ? 'easeOut' : [0.22, 1, 0.36, 1]) as never,
  };
};

export function PageTransition({ children, className = '', delay = 0 }: TransitionProps) {
  const config = getAnimationConfig();
  const mobile = isMobile();

  return (
    <motion.div
      initial={{ opacity: 0, y: mobile ? 15 : 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: mobile ? -15 : -30 }}
      transition={{
        ...config,
        delay: mobile ? delay * 0.5 : delay
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({ children, delay = 0, className = '' }: TransitionProps) {
  const mobile = isMobile();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: mobile ? 0.4 : 0.7,
        delay: mobile ? delay * 0.5 : delay,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({
  children,
  direction = 'up',
  delay = 0,
  className = ''
}: TransitionProps & {
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const mobile = isMobile();
  const distance = mobile ? 30 : 50;

  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: mobile ? 0.4 : 0.6,
        delay: mobile ? delay * 0.5 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({
  children,
  delay = 0,
  className = ''
}: TransitionProps) {
  const mobile = isMobile();

  return (
    <motion.div
      initial={{ opacity: 0, scale: mobile ? 0.95 : 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: mobile ? 0.3 : 0.5,
        delay: mobile ? delay * 0.5 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger container with reduced motion on mobile
export function StaggerContainer({
  children,
  className = ''
}: TransitionProps) {
  const mobile = isMobile();

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: mobile ? 0.05 : 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Individual stagger item with optimized settings
export function StaggerItem({
  children,
  className = '',
  delay = 0
}: TransitionProps) {
  const mobile = isMobile();

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: mobile ? 10 : 20 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: mobile ? 0.3 : 0.5,
            delay: mobile ? delay * 0.5 : delay,
            ease: 'easeOut',
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export { AnimatePresence };
