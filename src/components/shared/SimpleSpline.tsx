import Spline from '@splinetool/react-spline';
import { useDeviceCapabilities } from '../../hooks/useDeviceCapabilities';

interface SimpleSplineProps {
  url: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  enableInteraction?: boolean;
  bottomFade?: boolean;
  fadeHeight?: string;
  fadeColor?: string;
  mobileZoom?: number; // Mobile zoom level (0.1 - 1.0)
}

export function SimpleSpline({
  url,
  className = '',
  style = {},
  loading = 'lazy',
  enableInteraction = false,
  bottomFade = false,
  fadeHeight = '120px',
  fadeColor = 'rgba(0, 0, 0, 1)',
  mobileZoom = 0.6
}: SimpleSplineProps) {
  const { canRender3D, isLowEndDevice, prefersReducedMotion } = useDeviceCapabilities();

  // Don't render on low-end devices or if user prefers reduced motion
  if (!canRender3D || prefersReducedMotion) {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        style={{ ...style, backgroundColor: 'black' }}
      />
    );
  }

  function onLoad(spline: any) {
    // Simple responsive zoom based on screen size
    const isMobile = window.innerWidth < 768;
    const zoom = isMobile ? mobileZoom : 1.0;
    spline.setZoom(zoom);
  }

  const splineStyle = {
    ...style,
    opacity: isLowEndDevice ? 0.7 : (style.opacity || 0.85),
    pointerEvents: enableInteraction ? 'auto' : 'none'
  } as React.CSSProperties;

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      <Spline
        onLoad={onLoad}
        scene={url}
        style={splineStyle}
      />

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