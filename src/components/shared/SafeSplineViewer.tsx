import React, { useEffect, useRef, useState } from 'react';

interface SafeSplineViewerProps {
  url: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  fallbackGradient?: string;
}

export function SafeSplineViewer({
  url,
  className = "",
  style = {},
  loading = "lazy",
  fallbackGradient = "bg-gradient-to-br from-black via-gray-900 to-black"
}: SafeSplineViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setDimensions({ width: offsetWidth, height: offsetHeight });
      }
    };

    // Initial dimension check
    updateDimensions();

    // Monitor dimension changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    // Preload Spline script for faster loading
    if (typeof window !== 'undefined' && !document.querySelector('script[type="module"][src*="spline"]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@splinetool/viewer@1.9.28/build/spline-viewer.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // Only load Spline if we have valid dimensions and no errors
    if (dimensions.width > 0 && dimensions.height > 0 && !hasError && containerRef.current) {
      setIsLoading(true);

      const loadSplineViewer = () => {
        const splineViewer = document.createElement('spline-viewer');
        splineViewer.setAttribute('url', url);
        splineViewer.setAttribute('loading', loading);
        splineViewer.setAttribute('loading-anim-type', 'spinner-small-dark');
        splineViewer.setAttribute('auto-play', 'true');
        splineViewer.setAttribute('mouse-controls', 'false');
        splineViewer.setAttribute('touch-controls', 'false');
        splineViewer.setAttribute('interaction', 'false');
        splineViewer.setAttribute('camera-controls', 'false');
        splineViewer.style.pointerEvents = 'none';

        // Set explicit dimensions to prevent WebGL errors
        splineViewer.style.width = '100%';
        splineViewer.style.height = '100%';
        splineViewer.style.minWidth = `${dimensions.width}px`;
        splineViewer.style.minHeight = `${dimensions.height}px`;

        // Error handling with timeout
        const handleError = () => {
          console.warn('Spline viewer failed to load, using fallback');
          setHasError(true);
          setIsLoading(false);
        };

        const handleLoad = () => {
          setIsLoaded(true);
          setIsLoading(false);
        };

        // Timeout after 10 seconds
        const timeout = setTimeout(() => {
          console.warn('Spline viewer timeout, using fallback');
          setHasError(true);
          setIsLoading(false);
        }, 10000);

        splineViewer.addEventListener('error', handleError);
        splineViewer.addEventListener('load', () => {
          clearTimeout(timeout);
          handleLoad();
        });

        // Clear container securely and add viewer
        if (containerRef.current) {
          containerRef.current.textContent = '';
          containerRef.current.appendChild(splineViewer);
        }

        return () => {
          clearTimeout(timeout);
          splineViewer.removeEventListener('error', handleError);
          splineViewer.removeEventListener('load', handleLoad);
          // Cleanup handled by React
        };
      };

      // Check if spline-viewer is already loaded
      if (customElements.get('spline-viewer')) {
        return loadSplineViewer();
      } else {
        // Wait for the custom element to be defined
        customElements.whenDefined('spline-viewer').then(loadSplineViewer);
      }
    }
  }, [url, loading, dimensions, hasError]);

  // Show fallback if dimensions are invalid or error occurred
  const showFallback = hasError || dimensions.width === 0 || dimensions.height === 0;

  return (
    <div
      ref={containerRef}
      className={`${className} ${showFallback ? fallbackGradient : ''}`}
      style={{
        ...style,
        minWidth: '100px', // Prevent zero dimensions
        minHeight: '100px'
      }}
      aria-label={showFallback ? "3D Scene (Fallback)" : "Interactive 3D Scene"}
    >
      {(showFallback || isLoading) && (
        <div className="absolute inset-0 flex items-center justify-center text-text-secondary">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm opacity-60">
              {isLoading ? 'Loading 3D Scene...' : hasError ? '3D Scene Failed to Load' : 'Preparing 3D Scene...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}