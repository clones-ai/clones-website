import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';

interface SmoothScrollProps {
  children: React.ReactNode;
  options?: {
    duration?: number;
    easing?: (t: number) => number;
    smooth?: boolean;
    smoothTouch?: boolean;
  };
}

export function SmoothScroll({
  children,
  options = {}
}: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Check for low-end device
    const isLowEndDevice = navigator.hardwareConcurrency <= 4 ||
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (prefersReducedMotion || isLowEndDevice) {
      return; // Don't initialize Lenis on low-end devices
    }

    // Ultra-optimized configuration for performance
    const defaultOptions = {
      duration: 1.2, // Optimal duration
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth easing
      smooth: true,
      smoothTouch: false, // Always disable on touch
      lerp: 0.1, // Faster response
      infinite: false,
      orientation: 'vertical' as const,
      gestureOrientation: 'vertical' as const,
      syncTouch: false,
      touchMultiplier: 2, // Better mobile response
      wheelMultiplier: 1, // Normal scroll speed
      ...options
    };

    // Initialize Lenis with performance optimizations
    lenisRef.current = new Lenis(defaultOptions);

    let rafId: number;
    let isRunning = true;

    // Optimized RAF loop
    function raf(time: number) {
      if (!isRunning) return;

      lenisRef.current?.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Cleanup
    return () => {
      isRunning = false;
      cancelAnimationFrame(rafId);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}

// Global reference for external access
let lenisRef: React.MutableRefObject<Lenis | null> = { current: null };

// Hook for accessing Lenis instance
export function useLenis() {
  return lenisRef;
}

// Optimized scroll utility
export function scrollTo(target: string | HTMLElement, options?: { offset?: number; duration?: number }) {
  if (lenisRef.current) {
    lenisRef.current.scrollTo(target, {
      offset: options?.offset || 0,
      duration: options?.duration || 0.5,
    });
  }
}