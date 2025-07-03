
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';
import { UserX } from 'lucide-react';
import { TransactionReassignDialog } from './TransactionReassignDialog';
import { Database } from '@/integrations/supabase/types';

type Transaction = Database['public']['Tables']['transactions']['Row'];

interface TransactionReassignButtonProps {
  transaction: Transaction;
  onReassignSuccess?: () => void;
}

const TransactionReassignButton = ({
  transaction,
  onReassignSuccess
}: TransactionReassignButtonProps) => {
  const { role } = useUserRole();
  const [showDialog, setShowDialog] = useState(false);

  // Only coordinators can reassign transactions
  if (role !== 'coordinator') {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="flex items-center space-x-1"
      >
        <UserX className="h-4 w-4" />
        <span>Reassign</span>
      </Button>

      <TransactionReassignDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        transaction={transaction}
        onSuccess={() => {
          setShowDialog(false);
          onReassignSuccess?.();
        }}
      />
    </>
  );
};

export default TransactionReassignButton;
