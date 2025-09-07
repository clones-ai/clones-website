import React, { useRef, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltIntensity?: number;
  springConfig?: {
    stiffness: number;
    damping: number;
  };
  glowOnHover?: boolean;
  liftOnHover?: boolean;
}

export function TiltCard({
  children,
  className = '',
  tiltIntensity = 1.5,
  glowOnHover = true,
  liftOnHover = true
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Motion values pour la position de la souris
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transformations avec spring pour la fluidité
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [tiltIntensity * 0.5, -tiltIntensity * 0.5]), // Reduced intensity
    { stiffness: 400, damping: 40 } // Faster spring
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-tiltIntensity * 0.5, tiltIntensity * 0.5]), // Reduced intensity
    { stiffness: 400, damping: 40 } // Faster spring
  );

  // Gestion des événements de souris
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseXPercent = (e.clientX - centerX) / (rect.width / 2);
    const mouseYPercent = (e.clientY - centerY) / (rect.height / 2);

    // Direct updates for better responsiveness
    mouseX.set(mouseXPercent * 0.8); // Reduced sensitivity
    mouseY.set(mouseYPercent * 0.8);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const baseClasses = useMemo(() => `
    relative 
    transform-gpu 
    transition-transform 
    duration-150 
    ease-out
    ${liftOnHover ? 'hover:-translate-y-2' : ''}
    ${glowOnHover ? 'hover:shadow-glow-hover' : ''}
    ${className}
  `, [liftOnHover, glowOnHover, className]);

  const motionProps = useMemo(() => ({
    whileHover: { scale: 1.01 },
    whileTap: { scale: 0.99 },
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      duration: 0.15
    }
  }), []);

  return (
    <motion.div
      ref={ref}
      className={baseClasses}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        willChange: 'transform'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...motionProps}
    >
      {/* Gradient overlay qui apparaît au hover */}
      {glowOnHover && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-inherit opacity-0"
          style={{
            background: 'var(--border-gradient-primary)',
            mixBlendMode: 'overlay',
          }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        />
      )}

      {/* Contenu de la carte */}
      <div style={{ transform: 'translateZ(10px)' }}>
        {children}
      </div>
    </motion.div>
  );
}

// Variante simplifiée pour les cas où on veut juste l'effet de lift
export function LiftCard({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {

  return (
    <motion.div
      className={`motion-hover-lift ${className}`}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }}
    >
      {children}
    </motion.div>
  );
}