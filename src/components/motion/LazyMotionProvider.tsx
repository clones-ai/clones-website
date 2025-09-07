import React, { Suspense, lazy, useMemo } from 'react';
import { useDeviceCapabilities } from './useOptimizedAnimation';

// Lazy load Framer Motion components
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

interface LazyMotionProviderProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Provider for lazy-loaded Framer Motion components
 * Automatically falls back to regular elements on low-end devices
 */
export function LazyMotionProvider({
    children,
    fallback = <div>Loading...</div>
}: LazyMotionProviderProps) {
    const { isLowEndDevice, prefersReducedMotion } = useDeviceCapabilities();

    const shouldUseAnimations = useMemo(() => {
        return !isLowEndDevice && !prefersReducedMotion;
    }, [isLowEndDevice, prefersReducedMotion]);

    if (!shouldUseAnimations) {
        return <>{children}</>;
    }

    return (
        <Suspense fallback={fallback}>
            {children}
        </Suspense>
    );
}

/**
 * Optimized motion components that lazy load and respect user preferences
 */
export const OptimizedMotion = {
    div: React.forwardRef<HTMLDivElement, any>((props, ref) => {
        const { isLowEndDevice, prefersReducedMotion } = useDeviceCapabilities();

        if (isLowEndDevice || prefersReducedMotion) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { animate, initial, exit, transition, variants, whileHover, whileTap, ...restProps } = props;
            return <div ref={ref} {...restProps} />;
        }

        return (
            <Suspense fallback={<div {...props} />}>
                <LazyMotionDiv ref={ref} {...props} />
            </Suspense>
        );
    }),

    button: React.forwardRef<HTMLButtonElement, any>((props, ref) => {
        const { isLowEndDevice, prefersReducedMotion } = useDeviceCapabilities();

        if (isLowEndDevice || prefersReducedMotion) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { animate, initial, exit, transition, variants, whileHover, whileTap, ...restProps } = props;
            return <button ref={ref} {...restProps} />;
        }

        return (
            <Suspense fallback={<button {...props} />}>
                <LazyMotionButton ref={ref} {...props} />
            </Suspense>
        );
    }),

    section: React.forwardRef<HTMLElement, any>((props, ref) => {
        const { isLowEndDevice, prefersReducedMotion } = useDeviceCapabilities();

        if (isLowEndDevice || prefersReducedMotion) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { animate, initial, exit, transition, variants, whileHover, whileTap, ...restProps } = props;
            return <section ref={ref} {...restProps} />;
        }

        return (
            <Suspense fallback={<section {...props} />}>
                <LazyMotionSection ref={ref} {...props} />
            </Suspense>
        );
    })
};

/**
 * Hook to conditionally import Framer Motion utilities
 */
export function useMotionUtils() {
    const { isLowEndDevice, prefersReducedMotion } = useDeviceCapabilities();

    const shouldUseMotion = !isLowEndDevice && !prefersReducedMotion;

    const importMotionUtils = useMemo(async () => {
        if (!shouldUseMotion) {
            return {
                useInView: () => ({ ref: null, inView: true }),
                useAnimation: () => ({ start: () => { }, stop: () => { } }),
                useScroll: () => ({ scrollY: { get: () => 0 } })
            };
        }

        const [
            { useInView },
            { useAnimation },
            { useScroll }
        ] = await Promise.all([
            import('framer-motion').then(m => ({ useInView: m.useInView })),
            import('framer-motion').then(m => ({ useAnimation: m.useAnimation })),
            import('framer-motion').then(m => ({ useScroll: m.useScroll }))
        ]);

        return { useInView, useAnimation, useScroll };
    }, [shouldUseMotion]);

    return { importMotionUtils, shouldUseMotion };
}

/**
 * Optimized variants that respect reduced motion
 */
export const createOptimizedVariants = (variants: Record<string, any>) => {
    return (prefersReducedMotion: boolean) => {
        if (prefersReducedMotion) {
            // Return static variants without animation
            return Object.keys(variants).reduce((acc, key) => {
                acc[key] = {
                    opacity: variants[key].opacity || 1,
                    // Remove all transform properties
                    x: 0,
                    y: 0,
                    scale: 1,
                    rotate: 0
                };
                return acc;
            }, {} as any);
        }

        return variants;
    };
};

/**
 * Performance-optimized transition presets
 */
export const optimizedTransitions = {
    // Ultra-fast for low-end devices
    fast: {
        type: "tween",
        duration: 0.2,
        ease: "easeOut"
    },

    // Standard for most interactions
    standard: {
        type: "tween",
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
    },

    // Smooth for hero animations
    smooth: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 0.8
    },

    // No animation fallback
    none: {
        duration: 0
    }
};

/**
 * Get appropriate transition based on device capabilities
 * Note: This should be called within a React component or custom hook
 */
export function useOptimizedTransition(type: keyof typeof optimizedTransitions = 'standard') {
    const { isLowEndDevice, prefersReducedMotion } = useDeviceCapabilities();

    if (prefersReducedMotion) return optimizedTransitions.none;
    if (isLowEndDevice) return optimizedTransitions.fast;

    return optimizedTransitions[type];
}
