
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ErrorMessage, SuccessMessage, AnimatedField } from './FormTransitions';

interface AnimatedInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  error?: string;
  success?: string;
  isValidating?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}

export const AnimatedInput = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
  error,
  success,
  isValidating = false,
  required = false,
  className,
  id
}: AnimatedInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    setIsFocused(true);
    setHasInteracted(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setHasInteracted(true);
  };

  const hasError = !!error && hasInteracted;
  const hasSuccess = !!success && hasInteracted && !error;
  const showValidation = hasInteracted && !isFocused;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <motion.div
          initial={{ opacity: 0.7 }}
          animate={{ 
            opacity: isFocused ? 1 : 0.7,
            scale: isFocused ? 1.02 : 1
          }}
          transition={{ duration: 0.2 }}
        >
          <Label 
            htmlFor={id}
            className="font-brand-heading text-sm tracking-wide uppercase text-brand-charcoal"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        </motion.div>
      )}

      <AnimatedField 
        isFocused={isFocused} 
        hasError={hasError}
        isValid={hasSuccess}
        className="relative"
      >
        <div className="relative">
          <Input
            ref={inputRef}
            id={id}
            type={type}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={cn(
              "pr-10 transition-all duration-200",
              hasError && "border-red-300 focus:border-red-500 focus:ring-red-500",
              hasSuccess && "border-green-300 focus:border-green-500 focus:ring-green-500",
              isFocused && "shadow-brand-subtle"
            )}
            aria-describedby={
              hasError ? `${id}-error` : 
              hasSuccess ? `${id}-success` : undefined
            }
            aria-invalid={hasError}
          />

          {/* Status Icons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <AnimatePresence mode="wait">
              {isValidating && (
                <motion.div
                  key="validating"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border border-brand-charcoal border-t-transparent rounded-full"
                  />
                </motion.div>
              )}
              
              {!isValidating && hasSuccess && showValidation && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Check className="h-4 w-4 text-green-600" />
                </motion.div>
              )}
              
              {!isValidating && hasError && showValidation && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </AnimatedField>

      {/* Validation Messages */}
      <div className="min-h-[20px]">
        <ErrorMessage 
          message={error || ''} 
          isVisible={hasError && showValidation} 
        />
        <SuccessMessage 
          message={success || ''} 
          isVisible={hasSuccess && showValidation} 
        />
      </div>
    </div>
  );
};
