import React, { useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export function Reveal({
  children,
  delay = 0,
  direction = 'up',
  distance = 2,
  duration = 0.1,
  className = '',
  once = true
}: RevealProps) {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once,
    margin: "0px", // No margin for instant triggering
    amount: 0.1
  });

  const transforms = useMemo(() => {
    let initial, animate;

    switch (direction) {
      case 'up':
        initial = { opacity: 0, y: distance * 2 };
        animate = { opacity: 1, y: 0 };
        break;
      case 'down':
        initial = { opacity: 0, y: -distance * 2 };
        animate = { opacity: 1, y: 0 };
        break;
      case 'left':
        initial = { opacity: 0, x: distance * 2 };
        animate = { opacity: 1, x: 0 };
        break;
      case 'right':
        initial = { opacity: 0, x: -distance * 2 };
        animate = { opacity: 1, x: 0 };
        break;
      default:
        initial = { opacity: 0, y: distance * 2 };
        animate = { opacity: 1, y: 0 };
    }

    return {
      initial,
      animate
    };
  }, [direction, distance]);

  const transition = useMemo(() => ({
    duration,
    ease: "easeOut",
    delay
  }), [duration, delay]);

  return (
    <motion.div
      ref={ref}
      initial={transforms.initial}
      animate={inView ? transforms.animate : transforms.initial}
      transition={transition}
      className={className}
      style={{
        willChange: inView ? 'transform, opacity' : 'auto',
        contain: 'layout style paint' // Performance optimization
      }}
    >
      {children}
    </motion.div>
  );
}

// Variantes prédéfinies optimisées
export const RevealUp = React.memo(({ children, ...props }: Omit<RevealProps, 'direction'>) => {
  return <Reveal direction="up" {...props}>{children}</Reveal>;
});

export const RevealDown = React.memo(({ children, ...props }: Omit<RevealProps, 'direction'>) => {
  return <Reveal direction="down" {...props}>{children}</Reveal>;
});

export const RevealLeft = React.memo(({ children, ...props }: Omit<RevealProps, 'direction'>) => {
  return <Reveal direction="left" {...props}>{children}</Reveal>;
});

export const RevealRight = React.memo(({ children, ...props }: Omit<RevealProps, 'direction'>) => {
  return <Reveal direction="right" {...props}>{children}</Reveal>;
});