import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  className = '',
  disabled = false,
  loading = false
}: AnimatedButtonProps) {

  const baseClasses = useMemo(() => `
    relative inline-flex items-center justify-center
    font-medium rounded-xl transition-all duration-75
    focus:outline-none focus-visible:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed
    transform-gpu
  `, []);

  const variantClasses = useMemo(() => ({
    primary: `
      bg-gradient-to-r from-primary-500 to-primary-600 
      hover:from-primary-600 hover:to-primary-700
      text-white 
      hover:shadow-[0_0_25px_rgba(139,92,246,0.6)]
    `,
    secondary: `
      bg-bg-quaternary text-text-primary
      hover:bg-bg-quaternary/80 
      hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]
    `,
    ghost: `
      text-text-secondary hover:text-text-primary
      hover:bg-bg-quaternary/50 
      hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]
    `
  }), []);

  const sizeClasses = useMemo(() => ({
    sm: 'px-3 py-2 text-xs sm:px-4 sm:text-sm gap-2',
    md: 'px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base gap-2 sm:gap-3',
    lg: 'px-5 py-3 text-base sm:px-8 sm:py-4 sm:text-lg gap-3 sm:gap-4'
  }), []);

  const handleClick = useCallback(() => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  }, [disabled, loading, onClick]);

  const motionProps = useMemo(() => ({
    whileHover: {
      y: -0.5,
      scale: 1.005
    },
    whileTap: {
      scale: 0.995,
      y: 0
    },
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
      duration: 0.05
    }
  }), []);

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      style={{ willChange: 'transform' }}
      {...motionProps}
    >
      {/* Icône à gauche */}
      {Icon && iconPosition === 'left' && (
        <motion.div
          initial={{ x: 0 }}
          whileHover={{ x: -1 }}
          transition={{ duration: 0.1 }}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
      )}

      {/* Contenu du bouton */}
      <span className="relative">
        {loading ? (
          <motion.div
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          children
        )}
      </span>

      {/* Icône à droite */}
      {Icon && iconPosition === 'right' && !loading && (
        <motion.div
          initial={{ x: 0 }}
          whileHover={{ x: 1 }}
          transition={{ duration: 0.1 }}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
      )}

      {/* Effet de brillance au hover */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 pointer-events-none"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
        }}
        whileHover={{
          opacity: 1,
          x: ['-100%', '100%']
        }}
        transition={{
          x: { duration: 0.3, ease: "easeInOut" },
          opacity: { duration: 0.1 }
        }}
      />
    </motion.button>
  );
}

// Variantes prédéfinies
export function PrimaryButton(props: Omit<AnimatedButtonProps, 'variant'>) {
  return <AnimatedButton variant="primary" {...props} />;
}

export function SecondaryButton(props: Omit<AnimatedButtonProps, 'variant'>) {
  return <AnimatedButton variant="secondary" {...props} />;
}

export function GhostButton(props: Omit<AnimatedButtonProps, 'variant'>) {
  return <AnimatedButton variant="ghost" {...props} />;
}