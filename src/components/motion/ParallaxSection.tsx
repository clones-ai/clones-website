import React, { useEffect, useRef, useState } from 'react';

interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number; // Parallax speed multiplier (0.1 to 1.0)
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  offset?: number; // Initial offset
}

export function ParallaxSection({
  children,
  speed = 0.5,
  direction = 'up',
  className = '',
  offset = 0
}: ParallaxSectionProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('translate3d(0, 0, 0)');

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;

      const scrolled = window.pageYOffset;
      const rate = scrolled * -speed;

      let translateX = 0;
      let translateY = 0;

      switch (direction) {
        case 'up':
          translateY = rate + offset;
          break;
        case 'down':
          translateY = -rate + offset;
          break;
        case 'left':
          translateX = rate + offset;
          break;
        case 'right':
          translateX = -rate + offset;
          break;
      }

      setTransform(`translate3d(${translateX}px, ${translateY}px, 0)`);
    };

    // Use requestAnimationFrame for smoother performance
    let ticking = false;
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestTick, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', requestTick);
  }, [speed, direction, offset]);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        transform,
        willChange: 'transform'
      }}
    >
      {children}
    </div>
  );
}

interface ParallaxTransitionProps {
  className?: string;
  variant?: 'orbs' | 'lines' | 'gradient' | 'geometric';
  colors?: string[];
  intensity?: 'subtle' | 'medium' | 'strong';
}

export function ParallaxTransition({
  className = '',
  variant = 'orbs',
  colors = ['primary-500', 'primary-600', 'primary-700'],
  intensity = 'medium'
}: ParallaxTransitionProps) {
  const intensityMap = {
    subtle: { speed: 0.2, opacity: 0.1, blur: 'blur-2xl' },
    medium: { speed: 0.4, opacity: 0.15, blur: 'blur-3xl' },
    strong: { speed: 0.6, opacity: 0.2, blur: 'blur-3xl' }
  };

  const config = intensityMap[intensity];

  const renderOrbs = () => {
    const opacityMain = Math.round(config.opacity * 100);
    const opacitySecond = Math.round(config.opacity * 80);
    const opacityThird = Math.round(config.opacity * 60);

    return (
      <>
        <ParallaxSection speed={config.speed} direction="up" className="absolute top-20 left-1/4">
          <div
            className={`w-96 h-96 rounded-full ${config.blur} animate-pulse`}
            style={{
              backgroundColor: `rgb(var(--color-primary-500) / ${opacityMain}%)`
            }}
          ></div>
        </ParallaxSection>
        <ParallaxSection speed={config.speed * 1.2} direction="down" className="absolute top-40 right-1/3">
          <div
            className={`w-80 h-80 rounded-full ${config.blur} animate-pulse`}
            style={{
              backgroundColor: `rgb(var(--color-primary-600) / ${opacitySecond}%)`,
              animationDelay: '1000ms'
            }}
          ></div>
        </ParallaxSection>
        <ParallaxSection speed={config.speed * 0.8} direction="left" className="absolute bottom-20 left-1/3">
          <div
            className={`w-72 h-72 rounded-full ${config.blur} animate-pulse`}
            style={{
              backgroundColor: `rgb(var(--color-primary-700) / ${opacityThird}%)`,
              animationDelay: '2000ms'
            }}
          ></div>
        </ParallaxSection>
      </>
    );
  };

  const renderLines = () => (
    <>
      <ParallaxSection speed={config.speed} direction="right" className="absolute top-1/4 left-0 w-full">
        <div
          className="h-px"
          style={{
            background: `linear-gradient(to right, transparent, rgba(var(--color-primary-500), ${config.opacity}), transparent)`
          }}
        ></div>
      </ParallaxSection>
      <ParallaxSection speed={config.speed * 1.5} direction="left" className="absolute bottom-1/3 left-0 w-full">
        <div
          className="h-px"
          style={{
            background: `linear-gradient(to right, transparent, rgba(var(--color-primary-600), ${config.opacity * 0.8}), transparent)`
          }}
        ></div>
      </ParallaxSection>
    </>
  );

  const renderGradient = () => (
    <ParallaxSection speed={config.speed} direction="up" className="absolute inset-0">
      <div className={`h-full bg-gradient-to-b from-${colors[0]}/${Math.round(config.opacity * 50)} via-transparent to-${colors[2]}/${Math.round(config.opacity * 50)}`}></div>
    </ParallaxSection>
  );

  const renderGeometric = () => (
    <>
      <ParallaxSection speed={config.speed} direction="up" className="absolute top-20 right-20">
        <div className={`w-24 h-24 border border-${colors[0]}/${Math.round(config.opacity * 100)} rotate-45 animate-pulse`}></div>
      </ParallaxSection>
      <ParallaxSection speed={config.speed * 1.3} direction="down" className="absolute bottom-32 left-16">
        <div className={`w-16 h-32 bg-${colors[1]}/${Math.round(config.opacity * 60)} skew-x-12 animate-pulse delay-1500`}></div>
      </ParallaxSection>
    </>
  );

  const renderVariant = () => {
    switch (variant) {
      case 'orbs': return renderOrbs();
      case 'lines': return renderLines();
      case 'gradient': return renderGradient();
      case 'geometric': return renderGeometric();
      default: return renderOrbs();
    }
  };

  return (
    <div className={`relative h-32 overflow-hidden ${className}`}>
      {renderVariant()}
      {/* Static background for fallback */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/20"></div>
    </div>
  );
}