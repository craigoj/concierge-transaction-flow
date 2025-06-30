
import React from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ConflictResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (strategy: 'keepLocal' | 'useRemote' | 'merge') => void;
  localChanges?: string[];
  remoteChanges?: string[];
}

export const ConflictResolutionDialog = ({
  isOpen,
  onClose,
  onResolve,
  localChanges = [],
  remoteChanges = []
}: ConflictResolutionDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Conflicting Changes Detected
          </DialogTitle>
          <DialogDescription>
            Your form data has been modified elsewhere. Choose how to resolve the conflict.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <RefreshCw className="h-4 w-4" />
            <AlertDescription>
              This can happen when the same form is open in multiple tabs or by multiple users.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Local Changes */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="border rounded-lg p-4"
            >
              <h4 className="font-medium text-sm mb-2 text-green-700">
                Your Local Changes
              </h4>
              <div className="space-y-1 text-sm text-gray-600 max-h-32 overflow-y-auto">
                {localChanges.length > 0 ? (
                  localChanges.map((change, index) => (
                    <div key={index} className="p-2 bg-green-50 rounded text-xs">
                      {change}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 italic">No local changes</div>
                )}
              </div>
            </motion.div>

            {/* Remote Changes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="border rounded-lg p-4"
            >
              <h4 className="font-medium text-sm mb-2 text-blue-700">
                Remote Changes
              </h4>
              <div className="space-y-1 text-sm text-gray-600 max-h-32 overflow-y-auto">
                {remoteChanges.length > 0 ? (
                  remoteChanges.map((change, index) => (
                    <div key={index} className="p-2 bg-blue-50 rounded text-xs">
                      {change}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 italic">No remote changes</div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onResolve('useRemote')}
            className="flex-1"
          >
            Use Remote Version
            <span className="text-xs text-gray-500 ml-2">(Discard local changes)</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => onResolve('keepLocal')}
            className="flex-1"
          >
            Keep Local Version
            <span className="text-xs text-gray-500 ml-2">(Override remote)</span>
          </Button>
          <Button
            onClick={() => onResolve('merge')}
            className="flex-1"
          >
            Auto-Merge
            <span className="text-xs text-gray-300 ml-2">(Attempt merge)</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
