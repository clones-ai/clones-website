import React, { useEffect, useRef, useState } from 'react';

interface SimpleParallaxTransitionProps {
  className?: string;
  variant?: 'orbs' | 'lines' | 'gradient';
  height?: string;
}

export function SimpleParallaxTransition({
  className = '',
  variant = 'orbs',
  height = 'h-32'
}: SimpleParallaxTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

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
    return () => window.removeEventListener('scroll', requestTick);
  }, []);

  const parallaxOffset1 = scrollY * 0.3;
  const parallaxOffset2 = scrollY * 0.5;
  const parallaxOffset3 = scrollY * 0.2;

  const renderOrbs = () => (
    <>
      <div
        className="absolute w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse"
        style={{
          top: '20px',
          left: '25%',
          transform: `translateY(${parallaxOffset1}px)`
        }}
      />
      <div
        className="absolute w-80 h-80 bg-primary-600/8 rounded-full blur-3xl animate-pulse"
        style={{
          top: '40px',
          right: '33%',
          transform: `translateY(${-parallaxOffset2}px)`,
          animationDelay: '1000ms'
        }}
      />
      <div
        className="absolute w-72 h-72 bg-primary-700/6 rounded-full blur-3xl animate-pulse"
        style={{
          bottom: '20px',
          left: '33%',
          transform: `translateX(${parallaxOffset3}px)`,
          animationDelay: '2000ms'
        }}
      />
    </>
  );

  const renderLines = () => (
    <>
      <div
        className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/15 to-transparent"
        style={{
          transform: `translateX(${parallaxOffset1}px)`
        }}
      />
      <div
        className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-600/12 to-transparent"
        style={{
          transform: `translateX(${-parallaxOffset2}px)`
        }}
      />
    </>
  );

  const renderGradient = () => (
    <div
      className="absolute inset-0 bg-gradient-to-b from-primary-500/8 via-transparent to-primary-700/8"
      style={{
        transform: `translateY(${parallaxOffset1}px)`
      }}
    />
  );

  return (
    <div ref={containerRef} className={`relative ${height} overflow-hidden ${className}`}>
      {variant === 'orbs' && renderOrbs()}
      {variant === 'lines' && renderLines()}
      {variant === 'gradient' && renderGradient()}

    </div>
  );
}