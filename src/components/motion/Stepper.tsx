import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  onStepClick?: (stepIndex: number) => void;
  animated?: boolean;
}

export function Stepper({
  steps,
  currentStep,
  orientation = 'horizontal',
  className = '',
  onStepClick,
  animated = true
}: StepperProps) {
  
  const isHorizontal = orientation === 'horizontal';
  
  const containerClasses = `
    ${isHorizontal ? 'flex items-center' : 'flex flex-col'}
    ${className}
  `;

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className={containerClasses}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isClickable = onStepClick && index <= currentStep;
        
        return (
          <div
            key={step.id}
            className={`
              flex items-center
              ${isHorizontal ? 'flex-row' : 'flex-col'}
              ${isClickable ? 'cursor-pointer' : ''}
            `}
          >
            {/* Step Circle */}
            <motion.div
              className={`
                relative flex items-center justify-center
                w-12 h-12 rounded-full border-2 transition-all duration-300
                ${status === 'completed' 
                  ? 'bg-primary-500 border-primary-500 text-white' 
                  : status === 'current'
                  ? 'bg-primary-500/20 border-primary-500 text-primary-500'
                  : 'bg-bg-quaternary border-white/20 text-text-muted'
                }
              `}
              onClick={() => isClickable && onStepClick(index)}
              whileHover={isClickable ? { scale: 1.05 } : {}}
              whileTap={isClickable ? { scale: 0.95 } : {}}
              initial={animated ? { scale: 0, opacity: 0 } : {}}
              animate={animated ? { scale: 1, opacity: 1 } : {}}
              transition={{ 
                delay: index * 0.1,
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              {status === 'completed' ? (
                <Check className="w-6 h-6" />
              ) : step.icon ? (
                step.icon
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}

              {/* Glow effect pour l'étape courante */}
              {status === 'current' && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary-500/30"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.div>

            {/* Step Content */}
            <motion.div
              className={`
                ${isHorizontal ? 'ml-4' : 'mt-2 text-center'}
                ${isHorizontal && index < steps.length - 1 ? 'mr-8' : ''}
              `}
              initial={animated ? { opacity: 0, y: 10 } : {}}
              animate={animated ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 + 0.1 }}
            >
              <h4 className={`
                font-medium transition-colors duration-300
                ${status === 'current' 
                  ? 'text-primary-500' 
                  : status === 'completed'
                  ? 'text-text-primary'
                  : 'text-text-muted'
                }
              `}>
                {step.title}
              </h4>
              {step.description && (
                <p className="text-sm text-text-secondary mt-1">
                  {step.description}
                </p>
              )}
            </motion.div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <motion.div
                className={`
                  ${isHorizontal 
                    ? 'flex-1 h-px mx-4' 
                    : 'w-px h-8 mx-auto my-2'
                  }
                  bg-gradient-to-r from-white/20 to-white/20
                  ${index < currentStep ? 'from-primary-500 to-primary-500' : ''}
                `}
                initial={animated ? { scaleX: isHorizontal ? 0 : 1, scaleY: isHorizontal ? 1 : 0 } : {}}
                animate={animated ? { scaleX: 1, scaleY: 1 } : {}}
                transition={{ 
                  delay: index * 0.1 + 0.2,
                  duration: 0.5
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Variante simplifiée pour les cas d'usage courants
export function SimpleProgress({ 
  steps, 
  currentStep 
}: { 
  steps: string[]; 
  currentStep: number; 
}) {
  const formattedSteps = steps.map((title, index) => ({
    id: `step-${index}`,
    title
  }));

  return (
    <Stepper 
      steps={formattedSteps} 
      currentStep={currentStep}
      orientation="horizontal"
    />
  );
}