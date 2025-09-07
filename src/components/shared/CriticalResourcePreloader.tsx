import { useEffect } from 'react';

interface CriticalResourcePreloaderProps {
    fonts?: string[];
    images?: string[];
    scripts?: string[];
}

export function CriticalResourcePreloader({
    fonts = [],
    images = [],
    scripts = []
}: CriticalResourcePreloaderProps) {

    useEffect(() => {
        // Preload critical fonts
        fonts.forEach(fontUrl => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.type = 'font/woff2';
            link.crossOrigin = 'anonymous';
            link.href = fontUrl;
            document.head.appendChild(link);
        });

        // Preload critical images with intersection-based loading
        images.forEach(imageUrl => {
            // Only preload if image is likely to be used immediately
            if (imageUrl.includes('logo') || imageUrl.includes('hero')) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = imageUrl;
                document.head.appendChild(link);
            } else {
                // For non-critical images, use prefetch instead
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.as = 'image';
                link.href = imageUrl;
                document.head.appendChild(link);
            }
        });

        // Preload critical scripts
        scripts.forEach(scriptUrl => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'script';
            link.href = scriptUrl;
            document.head.appendChild(link);
        });

        // DNS prefetch for external domains
        const domains = ['fonts.googleapis.com', 'fonts.gstatic.com'];
        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = `//${domain}`;
            document.head.appendChild(link);
        });

    }, [fonts, images, scripts]);

    return null; // This component doesn't render anything
}

// Hook for performance monitoring
export function usePerformanceMonitoring() {
    useEffect(() => {
        // Monitor Core Web Vitals
        if ('web-vital' in window) return;

        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                // Log performance metrics in development
                if (process.env.NODE_ENV === 'development') {
                    console.log(`Performance: ${entry.name} = ${(entry as any).value || entry.duration}ms`);
                }

                // In production, send to analytics
                if (process.env.NODE_ENV === 'production') {
                    // TODO: Send to analytics service
                    // analytics.track('performance_metric', {
                    //   name: entry.name,
                    //   value: entry.value,
                    //   page: window.location.pathname
                    // });
                }
            }
        });

        // Observe various performance metrics
        try {
            observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
        } catch {
            // Fallback for older browsers
            console.warn('Performance Observer not supported');
        }

        return () => observer.disconnect();
    }, []);
}

// Critical CSS inlining component
export function CriticalCSS({ css }: { css: string }) {
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = css;
        style.setAttribute('data-critical', 'true');
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, [css]);

    return null;
}
