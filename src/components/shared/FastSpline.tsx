import React, { useEffect, useRef, useState } from 'react';

interface FastSplineProps {
  url: string;
  className?: string;
  style?: React.CSSProperties;
  preload?: boolean;
}

export function FastSpline({ url, className = '', style, preload = false }: FastSplineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Précharger le script Spline immédiatement
    const preloadScript = () => {
      if (!document.querySelector('script[src*="spline-viewer"]')) {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://unpkg.com/@splinetool/viewer@1.9.28/build/spline-viewer.js';
        script.async = true;
        script.onload = () => setIsReady(true);
        script.onerror = () => setHasError(true);
        document.head.appendChild(script);
      } else {
        setIsReady(true);
      }
    };

    if (preload || 'requestIdleCallback' in window) {
      // Utiliser requestIdleCallback si disponible
      (window as any).requestIdleCallback?.(preloadScript, { timeout: 1000 }) || setTimeout(preloadScript, 100);
    } else {
      setTimeout(preloadScript, 100);
    }
  }, [preload]);

  useEffect(() => {
    if (!isReady || !containerRef.current || hasError) return;

    const container = containerRef.current;
    
    // Timeout de 3 secondes maximum
    const timeout = setTimeout(() => {
      setHasError(true);
    }, 3000);

    const setupViewer = () => {
      try {
        const viewer = document.createElement('spline-viewer');
        viewer.setAttribute('url', url);
        viewer.setAttribute('loading', 'eager'); // Chargement immédiat
        viewer.setAttribute('loading-anim-type', 'none');
        viewer.setAttribute('auto-play', 'true');
        viewer.setAttribute('mouse-controls', 'false');
        viewer.setAttribute('touch-controls', 'false');
        
        // Styles optimisés
        viewer.style.width = '100%';
        viewer.style.height = '100%';
        viewer.style.opacity = '0.85';
        viewer.style.pointerEvents = 'none';
        
        // Nettoyage sécurisé et ajout
        container.textContent = '';
        container.appendChild(viewer);
        
        clearTimeout(timeout);
      } catch (error) {
        // Production: silent error handling
        if (process.env.NODE_ENV === 'development') {
          console.warn('Spline setup failed:', error);
        }
        setHasError(true);
        clearTimeout(timeout);
      }
    };

    if (customElements.get('spline-viewer')) {
      setupViewer();
    } else {
      customElements.whenDefined('spline-viewer').then(setupViewer);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [isReady, url, hasError]);

  return (
    <div 
      ref={containerRef}
      className={className}
      style={style}
    >
      {(!isReady || hasError) && (
        <div className="absolute inset-0" style={{ backgroundColor: '#000000' }} />
      )}
    </div>
  );
}