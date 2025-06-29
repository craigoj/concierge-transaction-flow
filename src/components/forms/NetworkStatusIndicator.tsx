
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFormStateContext } from './FormStateProvider';
import { cn } from '@/lib/utils';

export const NetworkStatusIndicator = () => {
  const { 
    networkError, 
    isOnline, 
    retryConnection, 
    state,
    hasUnsavedChanges 
  } = useFormStateContext();

  if (!networkError && isOnline && state.autoSaveStatus !== 'error') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3 }}
        className="fixed top-4 right-4 z-50 max-w-md"
      >
        <Alert variant={networkError ? "destructive" : "default"}>
          <div className="flex items-center gap-2">
            {networkError ? (
              <WifiOff className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription className="flex-1">
              {networkError || 'Auto-save failed. Your changes may not be saved.'}
            </AlertDescription>
            <Button
              size="sm"
              variant="outline"
              onClick={retryConnection}
              className="ml-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        </Alert>

        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200"
          >
            You have unsaved changes
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export const FormStatusBar = ({ className }: { className?: string }) => {
  const { state, isOnline, hasUnsavedChanges, forceSave } = useFormStateContext();

  const getStatusIndicator = () => {
    if (!isOnline) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm">Offline</span>
        </div>
      );
    }

    switch (state.autoSaveStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="h-4 w-4" />
            </motion.div>
            <span className="text-sm">Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <Wifi className="h-4 w-4" />
            <span className="text-sm">Saved</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Save failed</span>
            <Button size="sm" variant="outline" onClick={forceSave}>
              Retry
            </Button>
          </div>
        );
      default:
        return isOnline ? (
          <div className="flex items-center gap-2 text-gray-600">
            <Wifi className="h-4 w-4" />
            <span className="text-sm">Connected</span>
          </div>
        ) : null;
    }
  };

  return (
    <div className={cn("flex items-center justify-between p-2 bg-gray-50 border-t", className)}>
      <div className="flex items-center gap-4">
        {getStatusIndicator()}
        {hasUnsavedChanges && (
          <span className="text-xs text-amber-600">
            Unsaved changes
          </span>
        )}
      </div>
    </div>
  );
};
