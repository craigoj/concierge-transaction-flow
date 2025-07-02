
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Archive, CheckCircle, Users, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { BulkReassignDialog } from './BulkReassignDialog';
import { Database } from '@/integrations/supabase/types';

type TransactionStatus = Database['public']['Enums']['transaction_status'];

interface BulkActionBarProps {
  selectedTransactionIds: string[];
  onSuccess: () => void;
  onClearSelection: () => void;
}

const BulkActionBar = ({ selectedTransactionIds, onSuccess, onClearSelection }: BulkActionBarProps) => {
  const [loading, setLoading] = useState(false);
  const [bulkReassignOpen, setBulkReassignOpen] = useState(false);
  const { toast } = useToast();
  const { role } = useUserRole();

  const isCoordinator = role === 'coordinator';

  const handleBulkStatusUpdate = async (newStatus: TransactionStatus) => {
    if (!isCoordinator) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only coordinators can perform bulk status updates.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('bulk_update_transaction_status', {
        transaction_ids: selectedTransactionIds,
        new_status: newStatus
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Updated ${selectedTransactionIds.length} transactions to ${newStatus}.`,
      });

      onSuccess();
      onClearSelection();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (selectedTransactionIds.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="mb-6 border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                {selectedTransactionIds.length} transaction{selectedTransactionIds.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {isCoordinator && (
                <>
                  {/* Status Update */}
                  <Select onValueChange={handleBulkStatusUpdate} disabled={loading}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="intake">Set to Intake</SelectItem>
                      <SelectItem value="active">Set to Active</SelectItem>
                      <SelectItem value="closed">Set to Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Bulk Reassign */}
                  <Button
                    variant="outline"
                    onClick={() => setBulkReassignOpen(true)}
                    disabled={loading}
                    className="gap-2"
                  >
                    <UserX className="h-4 w-4" />
                    Reassign
                  </Button>
                </>
              )}

              {/* Clear Selection */}
              <Button
                variant="outline"
                onClick={onClearSelection}
                disabled={loading}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <BulkReassignDialog
        open={bulkReassignOpen}
        onOpenChange={setBulkReassignOpen}
        selectedTransactionIds={selectedTransactionIds}
        onSuccess={() => {
          onSuccess();
          onClearSelection();
        }}
      />
    </>
  );
};

export default BulkActionBar;
