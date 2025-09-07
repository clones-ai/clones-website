import React, { Suspense, lazy } from 'react';

// Lazy load motion components only when needed
const MotionDiv = lazy(async () => {
    const { motion } = await import('framer-motion');
    return { default: motion.div };
});

const MotionButton = lazy(async () => {
    const { motion } = await import('framer-motion');
    return { default: motion.button };
});

interface LazyMotionProps {
    children: React.ReactNode;
    component?: 'div' | 'button';
    animate?: any;
    initial?: any;
    transition?: any;
    whileHover?: any;
    whileTap?: any;
    className?: string;
    onClick?: () => void;
}

// Hook to detect if user prefers reduced motion
export function useReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return prefersReducedMotion;
}

// Conditional motion component that respects user preferences
export function ConditionalMotion({
    children,
    component = 'div',
    animate,
    initial,
    transition,
    whileHover,
    whileTap,
    className,
    onClick
}: LazyMotionProps) {
    const prefersReducedMotion = useReducedMotion();

    // If user prefers reduced motion, render static element
    if (prefersReducedMotion) {
        const Component = component;
        return (
            <Component className={className} onClick={onClick}>
                {children}
            </Component>
        );
    }

    // Otherwise, lazy load motion component
    const MotionComponent = component === 'button' ? MotionButton : MotionDiv;

    return (
        <Suspense fallback={
            <div className={className} onClick={onClick}>
                {children}
            </div>
        }>
            <MotionComponent
                animate={animate}
                initial={initial}
                transition={transition}
                whileHover={whileHover}
                whileTap={whileTap}
                className={className}
                onClick={onClick}
            >
                {children}
            </MotionComponent>
        </Suspense>
    );
}

// Performance-optimized reveal component
export function OptimizedReveal({
    children,
    delay = 0
}: {
    children: React.ReactNode;
    delay?: number;
}) {
    const prefersReducedMotion = useReducedMotion();
    const [isVisible, setIsVisible] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => setIsVisible(true), delay * 1000);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [delay]);

    if (prefersReducedMotion) {
        return <div ref={ref}>{children}</div>;
    }

    return (
        <div
            ref={ref}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease'
            }}
        >
            {children}
        </div>
    );
}
