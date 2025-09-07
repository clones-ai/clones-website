// DesktopSpline is now deprecated - use UnifiedSpline directly
// This file maintains backward compatibility

import React from 'react';
import { UnifiedSpline } from '../shared/UnifiedSpline';

type Props = {
  url: string;
  className?: string;
  style?: React.CSSProperties;
};

export const DesktopSpline: React.FC<Props> = ({ url, className = '', style }) => {
  return (
    <UnifiedSpline
      url={url}
      className={className}
      style={style}
      loading="lazy"
      enableInteraction={true}
    />
  );
};