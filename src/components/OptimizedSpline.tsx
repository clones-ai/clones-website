// OptimizedSpline is now deprecated - use UnifiedSpline directly
// This file maintains backward compatibility

import React from 'react';
import { UnifiedSpline } from './shared/UnifiedSpline';

interface OptimizedSplineProps {
  url: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackGradient?: string;
}

const OptimizedSpline: React.FC<OptimizedSplineProps> = ({
  url,
  className,
  style,
  fallbackGradient
}) => {
  return (
    <UnifiedSpline
      url={url}
      className={className}
      style={style}
      fallbackGradient={fallbackGradient}
      loading="lazy"
    />
  );
};

export default OptimizedSpline;