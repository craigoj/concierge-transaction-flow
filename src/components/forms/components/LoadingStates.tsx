
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Wifi, WifiOff, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Auto-save Status Indicator
interface AutoSaveStatusProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  className?: string;
}

export const AutoSaveStatus = ({ status, className }: AutoSaveStatusProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: 'Saving...',
          color: 'text-yellow-600'
        };
      case 'saved':
        return {
          icon: <Check className="h-3 w-3" />,
          text: 'Saved',
          color: 'text-green-600'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: 'Save failed',
          color: 'text-red-600'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={cn("flex items-center gap-1 text-xs", config.color, className)}
    >
      {config.icon}
      <span>{config.text}</span>
    </motion.div>
  );
};

// Connection Status Indicator
interface ConnectionStatusProps {
  isConnected: boolean;
  className?: string;
}

export const ConnectionStatus = ({ isConnected, className }: ConnectionStatusProps) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ duration: 0.2 }}
    className={cn(
      "flex items-center gap-1 text-xs",
      isConnected ? "text-green-600" : "text-red-600",
      className
    )}
  >
    {isConnected ? (
      <>
        <Wifi className="h-3 w-3" />
        <span>Connected</span>
      </>
    ) : (
      <>
        <WifiOff className="h-3 w-3" />
        <span>Disconnected</span>
      </>
    )}
  </motion.div>
);

// Loading Button
interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export const LoadingButton = ({
  isLoading,
  children,
  loadingText = 'Loading...',
  onClick,
  disabled,
  variant = 'default',
  className
}: LoadingButtonProps) => (
  <Button
    onClick={onClick}
    disabled={disabled || isLoading}
    variant={variant}
    className={cn("relative overflow-hidden", className)}
  >
    <motion.div
      animate={{ opacity: isLoading ? 0 : 1 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2"
    >
      {children}
    </motion.div>
    
    {isLoading && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        {loadingText}
      </motion.div>
    )}
  </Button>
);

// Form Submission Loading Overlay
interface FormLoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
}

export const FormLoadingOverlay = ({ isVisible, message = 'Processing...', progress }: FormLoadingOverlayProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: isVisible ? 1 : 0 }}
    transition={{ duration: 0.3 }}
    className={cn(
      "fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center",
      !isVisible && "pointer-events-none"
    )}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-white rounded-lg p-6 shadow-brand-elevation max-w-sm mx-4"
    >
      <div className="text-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-brand-charcoal border-t-transparent rounded-full mx-auto"
        />
        
        <div>
          <p className="font-brand-heading tracking-wide uppercase text-brand-charcoal">
            {message}
          </p>
          
          {progress !== undefined && (
            <div className="mt-3 space-y-2">
              <div className="w-full bg-brand-taupe/20 rounded-full h-2">
                <motion.div
                  className="h-full bg-brand-charcoal rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-brand-charcoal/60">{Math.round(progress)}% complete</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// Skeleton Form Field
interface SkeletonFieldProps {
  label?: boolean;
  input?: boolean;
  className?: string;
}

export const SkeletonField = ({ label = true, input = true, className }: SkeletonFieldProps) => (
  <div className={cn("space-y-2", className)}>
    {label && (
      <motion.div
        className="h-4 w-24 bg-brand-taupe/20 rounded"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    )}
    {input && (
      <motion.div
        className="h-10 w-full bg-brand-taupe/20 rounded-md"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
      />
    )}
  </div>
);

// Pulsing Dot Indicator
interface PulsingDotProps {
  color?: 'green' | 'yellow' | 'red';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PulsingDot = ({ color = 'green', size = 'md', className }: PulsingDotProps) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <motion.div
      className={cn(
        "rounded-full",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};
