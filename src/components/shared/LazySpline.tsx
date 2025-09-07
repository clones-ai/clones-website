// LazySpline is now deprecated - use UnifiedSpline directly
// This file maintains backward compatibility

import React from 'react';
import { UnifiedSpline } from './UnifiedSpline';

interface LazySplineProps {
    scene: string;
    className?: string;
    fallback?: React.ReactNode;
}

export function LazySpline({ scene, className }: LazySplineProps) {
    return (
        <UnifiedSpline 
            url={scene} 
            className={className}
            loading="lazy"
            fallbackGradient="bg-gradient-to-br from-primary-500/10 to-primary-700/5"
        />
    );
}

// Hook to detect if 3D should be loaded - now handled by useDeviceCapabilities
export function useShould3DLoad() {
    // This is now handled automatically by UnifiedSpline
    return true;
}

// Conditional 3D loader component - now simplified
export function ConditionalSpline({ scene, className, staticFallback }: LazySplineProps & { staticFallback?: React.ReactNode }) {
    return <LazySpline scene={scene} className={className} fallback={staticFallback} />;
}