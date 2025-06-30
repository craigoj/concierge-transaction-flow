
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Animation variants for different transition types
export const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0
  })
};

export const fadeVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

// Step Transition Wrapper
interface StepTransitionProps {
  children: React.ReactNode;
  currentStep: number;
  direction: number;
  className?: string;
}

export const StepTransition = ({ children, currentStep, direction, className }: StepTransitionProps) => (
  <motion.div
    key={currentStep}
    custom={direction}
    variants={slideVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }}
    className={cn("w-full", className)}
  >
    {children}
  </motion.div>
);

// Field Focus Animation
interface AnimatedFieldProps {
  children: React.ReactNode;
  isFocused: boolean;
  hasError?: boolean;
  isValid?: boolean;
  className?: string;
}

export const AnimatedField = ({ children, isFocused, hasError, isValid, className }: AnimatedFieldProps) => (
  <motion.div
    animate={{
      scale: isFocused ? 1.02 : 1,
      boxShadow: isFocused 
        ? "0 0 0 3px rgba(60, 60, 60, 0.1)" 
        : "0 0 0 0px rgba(60, 60, 60, 0)",
    }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className={cn(
      "transition-all duration-200",
      hasError && "animate-pulse",
      className
    )}
  >
    {children}
  </motion.div>
);

// Error Message Animation
interface ErrorMessageProps {
  message: string;
  isVisible: boolean;
}

export const ErrorMessage = ({ message, isVisible }: ErrorMessageProps) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, height: 0, y: -10 }}
        animate={{ 
          opacity: 1, 
          height: "auto", 
          y: 0,
          x: [-10, 10, -10, 10, 0],
          transition: { 
            opacity: { duration: 0.3, ease: "easeOut" },
            height: { duration: 0.3, ease: "easeOut" },
            y: { duration: 0.3, ease: "easeOut" },
            x: { duration: 0.5, ease: "easeInOut" }
          }
        }}
        exit={{ 
          opacity: 0, 
          height: 0, 
          y: -10,
          transition: { duration: 0.2, ease: "easeIn" }
        }}
        className="text-sm text-red-600 flex items-center gap-1 overflow-hidden"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          ⚠️
        </motion.span>
        {message}
      </motion.div>
    )}
  </AnimatePresence>
);

// Success Message Animation
interface SuccessMessageProps {
  message: string;
  isVisible: boolean;
}

export const SuccessMessage = ({ message, isVisible }: SuccessMessageProps) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ 
          opacity: 1, 
          scale: [0.8, 1.2, 1], 
          y: 0,
          rotate: [0, 10, -10, 0],
          transition: { 
            opacity: { duration: 0.4, ease: "easeOut" },
            scale: { duration: 0.6, ease: "easeInOut" },
            y: { duration: 0.4, ease: "easeOut" },
            rotate: { duration: 0.6, ease: "easeInOut" }
          }
        }}
        exit={{ 
          opacity: 0, 
          scale: 0.8, 
          y: 10,
          transition: { duration: 0.2 }
        }}
        className="text-sm text-green-600 flex items-center gap-1"
      >
        <motion.span
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          ✅
        </motion.span>
        {message}
      </motion.div>
    )}
  </AnimatePresence>
);

// Loading Skeleton
interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton = ({ className, lines = 1 }: SkeletonProps) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <motion.div
        key={i}
        className="h-4 bg-brand-taupe/20 rounded"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: i * 0.1,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

// Progress Indicator Animation
interface AnimatedProgressProps {
  progress: number;
  className?: string;
}

export const AnimatedProgress = ({ progress, className }: AnimatedProgressProps) => (
  <div className={cn("w-full bg-brand-taupe/20 rounded-full h-2 overflow-hidden", className)}>
    <motion.div
      className="h-full bg-brand-charcoal rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    />
  </div>
);

// Conditional Field Animation
interface ConditionalFieldProps {
  children: React.ReactNode;
  isVisible: boolean;
  className?: string;
}

export const ConditionalField = ({ children, isVisible, className }: ConditionalFieldProps) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, height: 0, marginTop: 0 }}
        animate={{ 
          opacity: 1, 
          height: "auto", 
          marginTop: "1rem",
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        exit={{ 
          opacity: 0, 
          height: 0, 
          marginTop: 0,
          transition: { duration: 0.2, ease: "easeIn" }
        }}
        className={cn("overflow-hidden", className)}
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
