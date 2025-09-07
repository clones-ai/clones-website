import React, { Suspense, lazy } from 'react';
import { useDeviceCapabilities } from './useOptimizedAnimation';

// Types for motion components with proper Framer Motion types
type MotionVariant = string | {
  [key: string]: string | number;
};

type Transition = {
  duration?: number;
  delay?: number;
  ease?: string | number[];
  type?: 'spring' | 'tween' | 'keyframes';
  stiffness?: number;
  damping?: number;
};

type Viewport = {
  once?: boolean;
  margin?: string;
  amount?: number | 'some' | 'all';
};

interface MotionProps extends React.HTMLAttributes<HTMLElement> {
    initial?: MotionVariant | false;
    animate?: MotionVariant;
    exit?: MotionVariant;
    transition?: Transition;
    variants?: Record<string, MotionVariant>;
    whileHover?: MotionVariant;
    whileTap?: MotionVariant;
    whileInView?: MotionVariant;
    viewport?: Viewport;
    children?: React.ReactNode;
}

// Lazy load specific Framer Motion components
const LazyMotionDiv = lazy(async () => {
    const { motion } = await import('framer-motion');
    return { default: motion.div };
});

const LazyMotionButton = lazy(async () => {
    const { motion } = await import('framer-motion');
    return { default: motion.button };
});

const LazyMotionSection = lazy(async () => {
    const { motion } = await import('framer-motion');
    return { default: motion.section };
});

const LazyMotionH1 = lazy(async () => {
    const { motion } = await import('framer-motion');
    return { default: motion.h1 };
});

const LazyMotionSpan = lazy(async () => {
    const { motion } = await import('framer-motion');
    return { default: motion.span };
});

// Fallback component for reduced motion
const StaticDiv = React.forwardRef<HTMLDivElement, MotionProps>(
    ({ initial, animate, exit, transition, variants, whileHover, whileTap, whileInView, viewport, ...props }, ref) => (
        <div ref={ref} {...props} />
    )
);

const StaticButton = React.forwardRef<HTMLButtonElement, MotionProps>(
    ({ initial, animate, exit, transition, variants, whileHover, whileTap, whileInView, viewport, ...props }, ref) => (
        <button ref={ref} {...props} />
    )
);

const StaticSection = React.forwardRef<HTMLElement, MotionProps>(
    ({ initial, animate, exit, transition, variants, whileHover, whileTap, whileInView, viewport, ...props }, ref) => (
        <section ref={ref} {...props} />
    )
);

const StaticH1 = React.forwardRef<HTMLHeadingElement, MotionProps>(
    ({ initial, animate, exit, transition, variants, whileHover, whileTap, whileInView, viewport, ...props }, ref) => (
        <h1 ref={ref} {...props} />
    )
);

const StaticSpan = React.forwardRef<HTMLSpanElement, MotionProps>(
    ({ initial, animate, exit, transition, variants, whileHover, whileTap, whileInView, viewport, ...props }, ref) => (
        <span ref={ref} {...props} />
    )
);

// Loading fallback
const MotionFallback: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={className} style={{ opacity: 0.8 }}>
        {children}
    </div>
);

// Optimized motion components that respect user preferences
export const OptimizedMotion = {
    div: React.forwardRef<HTMLDivElement, MotionProps>((props, ref) => {
        const { isLowEndDevice, prefersReducedMotion } = useDeviceCapabilities();

        if (isLowEndDevice || prefersReducedMotion) {
            return <StaticDiv ref={ref} {...props} />;
        }

        return (
            <Suspense fallback={<MotionFallback className={props.className}>{props.children}</MotionFallback>}>
                <LazyMotionDiv ref={ref} {...props} />
            </Suspense>
        );
    }),

    button: React.forwardRef<HTMLButtonElement, MotionProps>((props, ref) => {
        const { isLowEndDevice, prefersReducedMotion } = useDeviceCapabilities();

        if (isLowEndDevice || prefersReducedMotion) {
            return <StaticButton ref={ref} {...props} />;
        }

        return (
            <Suspense fallback={<MotionFallback className={props.className}>{props.children}</MotionFallback>}>
                <LazyMotionButton ref={ref} {...props} />
            </Suspense>
        );
    }),

    section: React.forwardRef<HTMLElement, MotionProps>((props, ref) => {
        const { isLowEndDevice, prefersReducedMotion } = useDeviceCapabilities();

        if (isLowEndDevice || prefersReducedMotion) {
            return <StaticSection ref={ref} {...props} />;
        }

        return (
            <Suspense fallback={<MotionFallback className={props.className}>{props.children}</MotionFallback>}>
                <LazyMotionSection ref={ref} {...props} />
            </Suspense>
        );
    }),

    h1: React.forwardRef<HTMLHeadingElement, MotionProps>((props, ref) => {
        const { isLowEndDevice, prefersReducedMotion } = useDeviceCapabilities();

        if (isLowEndDevice || prefersReducedMotion) {
            return <StaticH1 ref={ref} {...props} />;
        }

        return (
            <Suspense fallback={<MotionFallback className={props.className}>{props.children}</MotionFallback>}>
                <LazyMotionH1 ref={ref} {...props} />
            </Suspense>
        );
    }),

    span: React.forwardRef<HTMLSpanElement, MotionProps>((props, ref) => {
        const { isLowEndDevice, prefersReducedMotion } = useDeviceCapabilities();

        if (isLowEndDevice || prefersReducedMotion) {
            return <StaticSpan ref={ref} {...props} />;
        }

        return (
            <Suspense fallback={<MotionFallback className={props.className}>{props.children}</MotionFallback>}>
                <LazyMotionSpan ref={ref} {...props} />
            </Suspense>
        );
    })
};

// Lazy load motion utilities
export const useOptimizedInView = () => {
    const { isLowEndDevice, prefersReducedMotion } = useDeviceCapabilities();

    // Always call useMemo to avoid conditional hook usage
    const result = React.useMemo(() => {
        if (isLowEndDevice || prefersReducedMotion) {
            return { ref: null, inView: true };
        }

        // For now, return a simple fallback
        // TODO: Implement proper dynamic hook loading if needed
        return { ref: null, inView: true }; // Fallback until loaded
    }, [isLowEndDevice, prefersReducedMotion]);

    return result;
};

// Optimized animation variants
export const optimizedVariants = {
    // Fast variants for low-end devices
    fast: {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } }
    },

    // Standard variants for normal devices
    standard: {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
        }
    },

    // Premium variants for high-end devices
    premium: {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
                staggerChildren: 0.1
            }
        }
    }
};

// Get appropriate variants based on device capabilities
// Note: This should be called within a React component or custom hook
export function useOptimizedVariants(type: 'fast' | 'standard' | 'premium' = 'standard') {
    const { isLowEndDevice, prefersReducedMotion } = useDeviceCapabilities();

    if (prefersReducedMotion) {
        return {
            hidden: { opacity: 1 },
            visible: { opacity: 1 }
        };
    }

    if (isLowEndDevice) {
        return optimizedVariants.fast;
    }

    return optimizedVariants[type];
}
