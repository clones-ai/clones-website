import { useEffect, useState } from 'react';

interface PerformanceMetrics {
    fcp?: number;
    lcp?: number;
    cls?: number;
    fid?: number;
    ttfb?: number;
    scrollFps?: number;
    memoryUsage?: number;
}

/**
 * Hook for programmatic performance monitoring
 */
export function usePerformanceMetrics() {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({});

    useEffect(() => {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
                    setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
                }
                if (entry.entryType === 'largest-contentful-paint') {
                    setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
                }
                if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
                    setMetrics(prev => ({
                        ...prev,
                        cls: (prev.cls || 0) + (entry as any).value
                    }));
                }
            }
        });

        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });

        return () => observer.disconnect();
    }, []);

    return metrics;
}

export type { PerformanceMetrics };
