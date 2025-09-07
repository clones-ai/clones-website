import { useEffect, useState } from 'react';
import type { PerformanceMetrics } from '../../hooks/usePerformanceMetrics';

interface PerformanceMonitorProps {
    showInDev?: boolean;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Real-time performance monitoring component
 * Shows critical metrics during development
 */
export function PerformanceMonitor({
    showInDev = true,
    position = 'bottom-right'
}: PerformanceMonitorProps) {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({});
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show in development or when explicitly enabled
        if (process.env.NODE_ENV !== 'development' && !showInDev) {
            return;
        }

        setIsVisible(true);

        // Core Web Vitals monitoring
        const observeWebVitals = () => {
            // First Contentful Paint
            const fcpObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
                    }
                }
            });
            fcpObserver.observe({ entryTypes: ['paint'] });

            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
                }
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // Cumulative Layout Shift
            const clsObserver = new PerformanceObserver((list) => {
                let clsValue = 0;
                for (const entry of list.getEntries()) {
                    if (!(entry as any).hadRecentInput) {
                        clsValue += (entry as any).value;
                    }
                }
                setMetrics(prev => ({ ...prev, cls: clsValue }));
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });

            return () => {
                fcpObserver.disconnect();
                lcpObserver.disconnect();
                clsObserver.disconnect();
            };
        };

        // Scroll FPS monitoring
        const monitorScrollFps = () => {
            let lastTime = performance.now();
            let frameCount = 0;
            let isScrolling = false;

            const updateFps = () => {
                if (isScrolling) {
                    frameCount++;
                    const currentTime = performance.now();
                    if (currentTime - lastTime >= 1000) {
                        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                        setMetrics(prev => ({ ...prev, scrollFps: fps }));
                        frameCount = 0;
                        lastTime = currentTime;
                    }
                }
                requestAnimationFrame(updateFps);
            };

            let scrollTimeout: NodeJS.Timeout;
            const handleScroll = () => {
                isScrolling = true;
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    isScrolling = false;
                }, 150);
            };

            window.addEventListener('scroll', handleScroll, { passive: true });
            requestAnimationFrame(updateFps);

            return () => {
                window.removeEventListener('scroll', handleScroll);
            };
        };

        // Memory usage monitoring
        const monitorMemory = () => {
            const updateMemory = () => {
                if ('memory' in performance) {
                    const memory = (performance as any).memory;
                    const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
                    setMetrics(prev => ({ ...prev, memoryUsage: usedMB }));
                }
            };

            updateMemory();
            const interval = setInterval(updateMemory, 5000);

            return () => clearInterval(interval);
        };

        // TTFB monitoring
        const monitorTTFB = () => {
            const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            if (navigationEntry) {
                const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
                setMetrics(prev => ({ ...prev, ttfb }));
            }
        };

        const cleanup1 = observeWebVitals();
        const cleanup2 = monitorScrollFps();
        const cleanup3 = monitorMemory();
        monitorTTFB();

        return () => {
            cleanup1?.();
            cleanup2?.();
            cleanup3?.();
        };
    }, [showInDev]);

    const getMetricColor = (metric: keyof PerformanceMetrics, value: number) => {
        const thresholds = {
            fcp: { good: 1800, poor: 3000 },
            lcp: { good: 2500, poor: 4000 },
            cls: { good: 0.1, poor: 0.25 },
            fid: { good: 100, poor: 300 },
            ttfb: { good: 800, poor: 1800 },
            scrollFps: { good: 55, poor: 30 },
            memoryUsage: { good: 50, poor: 100 }
        };

        const threshold = thresholds[metric];
        if (!threshold) return 'text-gray-400';

        if (metric === 'scrollFps') {
            // Higher is better for FPS
            return value >= threshold.good ? 'text-green-400' :
                value >= threshold.poor ? 'text-yellow-400' : 'text-red-400';
        } else {
            // Lower is better for other metrics
            return value <= threshold.good ? 'text-green-400' :
                value <= threshold.poor ? 'text-yellow-400' : 'text-red-400';
        }
    };

    const formatMetric = (metric: keyof PerformanceMetrics, value: number) => {
        switch (metric) {
            case 'fcp':
            case 'lcp':
            case 'fid':
            case 'ttfb':
                return `${Math.round(value)}ms`;
            case 'cls':
                return value.toFixed(3);
            case 'scrollFps':
                return `${value}fps`;
            case 'memoryUsage':
                return `${value}MB`;
            default:
                return value.toString();
        }
    };

    const positionClasses = {
        'top-left': 'top-4 left-4',
        'top-right': 'top-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'bottom-right': 'bottom-4 right-4'
    };

    if (!isVisible || Object.keys(metrics).length === 0) {
        return null;
    }

    return (
        <div className={`fixed ${positionClasses[position]} z-50 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-xs font-mono border border-white/10`}>
            <div className="text-white/60 mb-2 font-semibold">Performance Monitor</div>
            <div className="space-y-1">
                {Object.entries(metrics).map(([key, value]) => {
                    if (value === undefined) return null;
                    const metricKey = key as keyof PerformanceMetrics;
                    return (
                        <div key={key} className="flex justify-between items-center gap-3">
                            <span className="text-white/80 uppercase">{key}:</span>
                            <span className={getMetricColor(metricKey, value)}>
                                {formatMetric(metricKey, value)}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Quick status indicator */}
            <div className="mt-2 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                    <div
                        className={`w-2 h-2 rounded-full ${(metrics.lcp && metrics.lcp > 4000) ||
                            (metrics.cls && metrics.cls > 0.25) ||
                            (metrics.scrollFps && metrics.scrollFps < 30)
                            ? 'bg-red-400'
                            : (metrics.lcp && metrics.lcp > 2500) ||
                                (metrics.cls && metrics.cls > 0.1) ||
                                (metrics.scrollFps && metrics.scrollFps < 55)
                                ? 'bg-yellow-400'
                                : 'bg-green-400'
                            }`}
                    />
                    <span className="text-white/60 text-xs">
                        {(metrics.lcp && metrics.lcp > 4000) ||
                            (metrics.cls && metrics.cls > 0.25) ||
                            (metrics.scrollFps && metrics.scrollFps < 30)
                            ? 'Poor'
                            : (metrics.lcp && metrics.lcp > 2500) ||
                                (metrics.cls && metrics.cls > 0.1) ||
                                (metrics.scrollFps && metrics.scrollFps < 55)
                                ? 'Needs Improvement'
                                : 'Good'
                        }
                    </span>
                </div>
            </div>
        </div>
    );
}

