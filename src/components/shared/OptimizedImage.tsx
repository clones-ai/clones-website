import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    sizes?: string;
    placeholder?: 'blur' | 'empty';
    quality?: number;
    onLoad?: () => void;
    onError?: () => void;
}

/**
 * Optimized image component with WebP support, lazy loading, and performance optimizations
 */
export function OptimizedImage({
    src,
    alt,
    width,
    height,
    className = '',
    priority = false,
    sizes = '100vw',
    placeholder = 'empty',
    quality = 85,
    onLoad,
    onError
}: OptimizedImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [imageSrc, setImageSrc] = useState<string>('');
    const imgRef = useRef<HTMLImageElement>(null);

    // Generate responsive image sources
    const generateSources = (originalSrc: string) => {
        const ext = originalSrc.split('.').pop();
        const baseName = originalSrc.replace(`.${ext}`, '');

        // Generate WebP and fallback sources
        const webpSrc = `${baseName}.webp`;
        const fallbackSrc = originalSrc;

        return { webpSrc, fallbackSrc };
    };

    // Check WebP support
    const supportsWebP = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };

    useEffect(() => {
        const { webpSrc, fallbackSrc } = generateSources(src);

        // Use WebP if supported, otherwise fallback
        const finalSrc = supportsWebP() ? webpSrc : fallbackSrc;
        setImageSrc(finalSrc);
    }, [src]);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        // Fallback to original format if WebP fails
        if (imageSrc.includes('.webp')) {
            const { fallbackSrc } = generateSources(src);
            setImageSrc(fallbackSrc);
        } else {
            setHasError(true);
            onError?.();
        }
    };

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (priority || !imgRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target as HTMLImageElement;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                        }
                    }
                });
            },
            {
                rootMargin: '50px', // Start loading 50px before entering viewport
                threshold: 0.01
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [priority, imageSrc]);

    if (hasError) {
        return (
            <div
                className={`bg-gray-200 flex items-center justify-center ${className}`}
                style={{ width, height }}
            >
                <span className="text-gray-500 text-sm">Image failed to load</span>
            </div>
        );
    }

    const imgProps = {
        ref: imgRef,
        alt,
        className: `transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`,
        width,
        height,
        sizes,
        onLoad: handleLoad,
        onError: handleError,
        loading: priority ? 'eager' as const : 'lazy' as const,
        fetchpriority: priority ? 'high' as const : 'auto' as const,
        decoding: 'async' as const,
    };

    return (
        <div className="relative">
            {/* Placeholder */}
            {placeholder === 'blur' && !isLoaded && (
                <div
                    className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}
                    style={{ width, height }}
                />
            )}

            {/* Main image */}
            <img
                {...imgProps}
                {...(priority
                    ? { src: imageSrc }
                    : { 'data-src': imageSrc, src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InRyYW5zcGFyZW50Ii8+PC9zdmc+' }
                )}
            />
        </div>
    );
}

/**
 * Hook to preload critical images
 */
export function useImagePreload(images: string[], priority = true) {
    useEffect(() => {
        if (!priority) return;

        const preloadPromises = images.map(src => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = reject;

                // Try WebP first, fallback to original
                const canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;
                const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;

                const ext = src.split('.').pop();
                const baseName = src.replace(`.${ext}`, '');
                img.src = supportsWebP ? `${baseName}.webp` : src;
            });
        });

        Promise.allSettled(preloadPromises).then(results => {
            const failed = results.filter(r => r.status === 'rejected').length;
            if (failed > 0) {
                console.warn(`Failed to preload ${failed} images`);
            }
        });
    }, [images, priority]);
}

/**
 * Generate responsive image sizes string
 */
export function generateSizes(breakpoints: { [key: string]: string }) {
    return Object.entries(breakpoints)
        .map(([query, size]) => `${query} ${size}`)
        .join(', ');
}

// Example usage:
// const sizes = generateSizes({
//   '(max-width: 768px)': '100vw',
//   '(max-width: 1024px)': '50vw',
//   '': '33vw'
// });
