import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDeviceCapabilities } from '../../hooks/useDeviceCapabilities';
import { logger } from '../../utils/logger';

// Global cache for Spline instances
const splineCache = new Map<string, HTMLElement>();

interface UnifiedSplineProps {
  url: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  enableInteraction?: boolean;
  bottomFade?: boolean;
  fadeHeight?: string;
  fadeColor?: string;
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
  loading = 'lazy',
  enableInteraction = false,
  bottomFade = false,
  fadeHeight = '120px',
  fadeColor = 'rgba(0, 0, 0, 1)'
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
      // Check if we have a cached instance
      const cacheKey = `${url}-${enableInteraction}-${isLowEndDevice}`;
      let viewer = splineCache.get(cacheKey);

      if (viewer && viewer.parentNode) {
        // Remove from current parent to avoid DOM conflicts
        viewer.parentNode.removeChild(viewer);
      }

      if (!viewer) {
        // Load Spline viewer dynamically
        try {
          await import('@splinetool/viewer');
        } catch (error) {
          logger.warn('Failed to load Spline viewer module:', error);
        }
        
        // Wait for custom element to be defined
        await customElements.whenDefined('spline-viewer');

        // Create new viewer element
        viewer = document.createElement('spline-viewer');
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

        // Cache the viewer instance
        splineCache.set(cacheKey, viewer);
      }

      // Force the internal canvas to fill the container properly
      const applyCanvasStyles = () => {
        const canvas = viewer.querySelector('canvas');
        if (canvas) {
          canvas.style.setProperty('width', '100%', 'important');
          canvas.style.setProperty('height', '100%', 'important');
          canvas.style.setProperty('object-fit', 'cover', 'important');
          canvas.style.setProperty('object-position', 'center', 'important');
          canvas.style.setProperty('min-width', '100%', 'important');
          canvas.style.setProperty('min-height', '100%', 'important');

          // If parent container has explicit height (like 110vh), force canvas to match
          const parent = viewer.parentElement;
          if (parent) {
            const computedHeight = parent.style.height || parent.style.minHeight;
            if (computedHeight && (computedHeight.includes('vh') || computedHeight.includes('px'))) {
              canvas.style.setProperty('height', computedHeight, 'important');
              canvas.style.setProperty('min-height', computedHeight, 'important');
            }
          }
        }
      };

      // Apply canvas styles multiple times to ensure they stick
      setTimeout(applyCanvasStyles, 100);
      setTimeout(applyCanvasStyles, 500);
      setTimeout(applyCanvasStyles, 1000);

      // Also try to apply when the viewer loads
      viewer.addEventListener('load', applyCanvasStyles);

      // Set up a periodic check to ensure styles remain applied
      const styleInterval = setInterval(() => {
        applyCanvasStyles();
      }, 2000);

      // Clean up interval when component unmounts
      const cleanup = () => {
        clearInterval(styleInterval);
      };

      // Store cleanup function for later use
      (viewer as any).__cleanup = cleanup;

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
        viewer.removeEventListener('load', applyCanvasStyles);
        // Clean up the style interval
        if ((viewer as any).__cleanup) {
          (viewer as any).__cleanup();
        }
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


  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >


      {bottomFade && (
        <div 
          className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
          style={{
            height: fadeHeight,
            background: `linear-gradient(to bottom, transparent 0%, ${fadeColor}20 30%, ${fadeColor}60 70%, ${fadeColor} 100%)`
          }}
        />
      )}
    </div>
  );
}