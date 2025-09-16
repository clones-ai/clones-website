import { useState, useEffect } from 'react';

interface DeviceCapabilities {
  canRender3D: boolean;
  isLowEndDevice: boolean;
  isMobile: boolean;
  isSlowConnection: boolean;
  prefersReducedMotion: boolean;
  screenSize: 'mobile' | 'tablet' | 'desktop';
}

export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    canRender3D: false,
    isLowEndDevice: false,
    isMobile: false,
    isSlowConnection: false,
    prefersReducedMotion: false,
    screenSize: 'mobile'
  });

  useEffect(() => {
    const detectCapabilities = () => {
      // Hardware detection
      const hardwareConcurrency = navigator.hardwareConcurrency || 2;
      const isLowEndDevice = hardwareConcurrency <= 4;

      // Device memory detection (if available)
      const deviceMemory = (navigator as any).deviceMemory || 4;
      const hasLowMemory = deviceMemory < 4;

      // Mobile detection
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      // Screen size detection
      const screenWidth = window.innerWidth;
      const screenSize = screenWidth < 768 ? 'mobile' :
        screenWidth < 1024 ? 'tablet' : 'desktop';

      // Connection speed detection
      const connection = (navigator as any).connection;
      const isSlowConnection = connection &&
        (connection.effectiveType === 'slow-2g' ||
          connection.effectiveType === '2g' ||
          connection.saveData === true);

      // Motion preferences
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      // GPU detection (basic)
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const hasWebGL = !!gl;

      // More aggressive mobile 3D restrictions for better performance
      const veryLowMemory = deviceMemory < 3; // Stricter memory requirement
      const verySlowConnection = connection && 
        (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
      
      // Only disable 3D on very low-end devices
      const shouldDisable3DOnMobile = isMobile && (
        veryLowMemory || // Only disable if memory < 3GB
        verySlowConnection // Only disable on very slow connections
      );

      const canRender3D = hasWebGL &&
        !shouldDisable3DOnMobile &&
        !prefersReducedMotion;

      setCapabilities({
        canRender3D,
        isLowEndDevice: isLowEndDevice || hasLowMemory,
        isMobile,
        isSlowConnection: isSlowConnection || false,
        prefersReducedMotion,
        screenSize
      });
    };

    // Initial detection
    detectCapabilities();

    // Re-detect on resize
    const handleResize = () => detectCapabilities();
    window.addEventListener('resize', handleResize);

    // Re-detect on connection change
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', detectCapabilities);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', detectCapabilities);
      }
    };
  }, []);

  return capabilities;
}