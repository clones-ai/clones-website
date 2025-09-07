import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDeviceCapabilities } from '../../hooks/useDeviceCapabilities';
import { logger } from '../../utils/logger';

interface UnifiedSplineProps {
  url: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackGradient?: string;
  loading?: 'lazy' | 'eager';
  enableInteraction?: boolean;
}

/**
 * Unified Spline component that replaces all other Spline components
 * Optimized with device capability detection and lazy loading
 * React-compatible implementation to avoid DOM conflicts
 */
export function UnifiedSpline({ 
  url, 
  className = '', 
  style = {},
  fallbackGradient = 'bg-gradient-to-br from-gray-900/50 to-black/50',
  loading = 'lazy',
  enableInteraction = false
}: UnifiedSplineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(loading === 'eager');
  const [splineElement, setSplineElement] = useState<HTMLElement | null>(null);
  
  const { canRender3D, isLowEndDevice, isSlowConnection, prefersReducedMotion } = useDeviceCapabilities();

  // Intersection Observer for lazy loading
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && !shouldLoad && !isLoading) {
      setShouldLoad(true);
    }
  }, [shouldLoad, isLoading]);

  useEffect(() => {
    if (loading === 'lazy' && containerRef.current) {
      observerRef.current = new IntersectionObserver(handleIntersection, {
        threshold: 0.1,
        rootMargin: '50px'
      });
      observerRef.current.observe(containerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, loading]);

  const loadSplineViewer = useCallback(async () => {
    if (isLoading || isLoaded || hasError || !containerRef.current) return;

    // Don't load on very low-end devices or if user prefers reduced motion
    if (!canRender3D || prefersReducedMotion) {
      setHasError(true);
      return;
    }

    setIsLoading(true);

    try {
      // Load script if not already loaded
      if (!document.querySelector('script[src*="spline-viewer"]')) {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://unpkg.com/@splinetool/viewer@1.10.55/build/spline-viewer.js';
        script.async = true;
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Wait for custom element to be defined
      await customElements.whenDefined('spline-viewer');

      // Create viewer element
      const viewer = document.createElement('spline-viewer');
      viewer.setAttribute('url', url);
      viewer.setAttribute('loading', loading);
      viewer.setAttribute('loading-anim-type', 'none');
      
      // Configure interaction based on device capabilities
      if (enableInteraction && !isLowEndDevice) {
        viewer.setAttribute('mouse-controls', 'true');
        viewer.setAttribute('touch-controls', 'true');
      } else {
        viewer.setAttribute('mouse-controls', 'false');
        viewer.setAttribute('touch-controls', 'false');
      }

      // Set performance-optimized styles
      Object.assign(viewer.style, {
        width: '100%',
        height: '100%',
        opacity: isLowEndDevice ? '0.7' : '0.85',
        pointerEvents: enableInteraction ? 'auto' : 'none',
      });

      // Setup load/error handlers
      const handleLoad = () => {
        setIsLoaded(true);
        setIsLoading(false);
      };

      const handleError = () => {
        setHasError(true);
        setIsLoading(false);
        logger.warn('Spline viewer failed to load:', url);
      };

      viewer.addEventListener('load', handleLoad);
      viewer.addEventListener('error', handleError);

      // Store element in state for React to manage
      setSplineElement(viewer);

      // More generous timeout - Spline scenes can take time to fully load
      const timeout = setTimeout(() => {
        // Check if Spline is actually running (even without 'load' event)
        const canvas = viewer.querySelector('canvas');
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          // Spline is working, mark as loaded
          handleLoad();
        } else if (!isLoaded) {
          handleError();
        }
      }, isSlowConnection ? 15000 : 10000);

      return () => {
        clearTimeout(timeout);
        viewer.removeEventListener('load', handleLoad);
        viewer.removeEventListener('error', handleError);
      };

    } catch (error) {
      logger.warn('Failed to load Spline viewer:', error);
      setHasError(true);
      setIsLoading(false);
    }
  }, [url, loading, enableInteraction, canRender3D, isLowEndDevice, isSlowConnection, prefersReducedMotion, isLoading, isLoaded, hasError]);

  useEffect(() => {
    if (shouldLoad && canRender3D) {
      loadSplineViewer();
    }
  }, [shouldLoad, canRender3D, loadSplineViewer]);

  // React-safe DOM insertion
  useEffect(() => {
    if (splineElement && containerRef.current) {
      containerRef.current.appendChild(splineElement);
      
      return () => {
        // React-safe cleanup
        if (splineElement && splineElement.parentNode) {
          splineElement.parentNode.removeChild(splineElement);
        }
      };
    }
  }, [splineElement]);

  // Only show fallback if we really can't render or have definitive error
  const showFallback = !canRender3D || (hasError && !isLoading && !splineElement);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {showFallback && (
        <div 
          className={`absolute inset-0 flex items-center justify-center ${fallbackGradient} backdrop-blur-sm`}
        >
          <div className="text-center text-text-tertiary p-6 rounded-xl bg-black/20 border border-primary-500/20">
            <div className="text-5xl mb-3 animate-pulse">⚡</div>
            <p className="text-base font-medium mb-1">3D Experience</p>
            <p className="text-xs opacity-70">Loading interactive content...</p>
          </div>
        </div>
      )}
      
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}