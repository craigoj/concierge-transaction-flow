import React from 'react';
import { TransactionCreationWizard } from './TransactionCreationWizard';

interface CreateTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateTransactionDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateTransactionDialogProps) => {
  return (
    <TransactionCreationWizard open={open} onOpenChange={onOpenChange} onSuccess={onSuccess} />
  );
};

export default CreateTransactionDialog;
