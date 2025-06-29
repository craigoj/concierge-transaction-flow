
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  title: string;
  children: React.ReactNode;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  hasError?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const AnimatedCard = ({
  title,
  children,
  isCollapsible = false,
  defaultExpanded = true,
  icon,
  badge,
  hasError = false,
  isLoading = false,
  className
}: AnimatedCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    if (isCollapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ 
        scale: 1.01,
        boxShadow: "0 8px 32px rgba(60, 60, 60, 0.15)"
      }}
      className={className}
    >
      <Card className={cn(
        "transition-all duration-300",
        hasError && "border-red-300 bg-red-50/30",
        isLoading && "animate-pulse"
      )}>
        <CardHeader 
          className={cn(
            "transition-colors duration-200",
            isCollapsible && "cursor-pointer hover:bg-brand-taupe/10"
          )}
          onClick={toggleExpanded}
        >
          <CardTitle className="flex items-center justify-between text-lg font-brand-heading tracking-wide uppercase text-brand-charcoal">
            <div className="flex items-center gap-3">
              {icon && (
                <motion.div
                  animate={{ rotate: isLoading ? 360 : 0 }}
                  transition={{ 
                    duration: isLoading ? 1 : 0.3, 
                    repeat: isLoading ? Infinity : 0,
                    ease: isLoading ? "linear" : "easeOut"
                  }}
                >
                  {icon}
                </motion.div>
              )}
              {title}
              {badge}
            </div>
            
            {isCollapsible && (
              <motion.div
                animate={{ rotate: isExpanded ? 0 : 180 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            )}
          </CardTitle>
        </CardHeader>
        
        <AnimatePresence>
          {(!isCollapsible || isExpanded) && (
            <motion.div
              initial={isCollapsible ? { height: 0, opacity: 0 } : false}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ 
                duration: 0.3, 
                ease: "easeOut",
                opacity: { duration: 0.2 }
              }}
              style={{ overflow: "hidden" }}
            >
              <CardContent className="space-y-4">
                <motion.div
                  initial={isCollapsible ? { y: -20 } : false}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                >
                  {children}
                </motion.div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};
