import { useEffect, useRef } from 'react';

interface UseOptimizedAnimationOptions {
    onStart?: () => void;
    onEnd?: () => void;
    duration?: number;
}

/**
 * Hook to optimize animations by managing will-change property
 * Prevents GPU layer creation when not needed
 */
export function useOptimizedAnimation(
    triggerAnimation: boolean,
    options: UseOptimizedAnimationOptions = {}
) {
    const elementRef = useRef<HTMLElement>(null);
    const { onStart, onEnd, duration = 300 } = options;

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        if (triggerAnimation) {
            // Add will-change before animation starts
            element.style.willChange = 'transform';
            element.classList.add('animating');
            onStart?.();

            // Remove will-change after animation completes
            const cleanup = setTimeout(() => {
                element.style.willChange = 'auto';
                element.classList.remove('animating');
                element.classList.add('animation-done');
                onEnd?.();

                // Remove animation-done class after a brief delay
                setTimeout(() => {
                    element.classList.remove('animation-done');
                }, 50);
            }, duration);

            return () => clearTimeout(cleanup);
        }
    }, [triggerAnimation, onStart, onEnd, duration]);

    return elementRef;
}

/**
 * Hook to optimize scroll-triggered animations
 * Uses Intersection Observer for better performance
 */
export function useScrollAnimation(options: {
    threshold?: number;
    rootMargin?: string;
    once?: boolean;
} = {}) {
    const elementRef = useRef<HTMLElement>(null);
    const { threshold = 0.1, rootMargin = '0px', once = true } = options;

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Element is visible, trigger animation
                        entry.target.classList.add('animate-in');
                        entry.target.classList.remove('animate-out');

                        if (once) {
                            observer.unobserve(entry.target);
                        }
                    } else if (!once) {
                        // Element is not visible, reverse animation
                        entry.target.classList.remove('animate-in');
                        entry.target.classList.add('animate-out');
                    }
                });
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [threshold, rootMargin, once]);

    return elementRef;
}

/**
 * Debounced scroll handler for performance
 */
export function useOptimizedScroll(
    callback: (scrollY: number) => void,
    delay: number = 16 // ~60fps
) {
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        let lastScrollY = 0;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Only update if scroll position changed significantly
            if (Math.abs(currentScrollY - lastScrollY) > 1) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    callback(currentScrollY);
                    lastScrollY = currentScrollY;
                }, delay);
            }
        };

        // Use passive listener for better performance
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, [callback, delay]);
}

/**
 * Hook to detect if device can handle smooth animations
 */
export function useDeviceCapabilities() {
    return {
        supportsWillChange: CSS.supports('will-change', 'transform'),
        supportsTransform3d: CSS.supports('transform', 'translate3d(0,0,0)'),
        isLowEndDevice: navigator.hardwareConcurrency <= 4,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        isTouchDevice: 'ontouchstart' in window,
    };
}
