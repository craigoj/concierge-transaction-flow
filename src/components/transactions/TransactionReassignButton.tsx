
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserX } from 'lucide-react';
import { TransactionReassignDialog } from './TransactionReassignDialog';
import { Database } from '@/integrations/supabase/types';
import { useUserRole } from '@/hooks/useUserRole';

type Transaction = Database['public']['Tables']['transactions']['Row'];

interface TransactionReassignButtonProps {
  transaction: Transaction;
  onSuccess?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const TransactionReassignButton = ({
  transaction,
  onSuccess,
  variant = 'outline',
  size = 'sm'
}: TransactionReassignButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { role } = useUserRole();

  // Only show for coordinators
  if (role !== 'coordinator') {
    return null;
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setDialogOpen(true)}
        className="gap-2"
      >
        <UserX className="h-4 w-4" />
        Reassign
      </Button>

      <TransactionReassignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={transaction}
        onSuccess={() => {
          onSuccess?.();
          setDialogOpen(false);
        }}
      />
    </>
  );
};
