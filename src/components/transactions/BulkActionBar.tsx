
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Users, Workflow, Download, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type TransactionStatus = Database['public']['Enums']['transaction_status'];

interface BulkActionBarProps {
  selectedTransactionIds: string[];
  onClearSelection: () => void;
}

export const BulkActionBar = ({ selectedTransactionIds, onClearSelection }: BulkActionBarProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bulkStatusUpdateMutation = useMutation({
    mutationFn: async ({ status }: { status: TransactionStatus }) => {
      const { data, error } = await supabase.rpc('bulk_update_transaction_status', {
        transaction_ids: selectedTransactionIds,
        new_status: status
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (updatedCount) => {
      toast({
        title: "Bulk Update Successful",
        description: `Updated ${updatedCount} transactions`,
      });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      onClearSelection();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Bulk Update Failed",
        description: error.message,
      });
    }
  });

  const handleStatusUpdate = (status: string) => {
    bulkStatusUpdateMutation.mutate({ status: status as TransactionStatus });
  };

  if (selectedTransactionIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white border border-brand-taupe/30 rounded-2xl shadow-brand-elevation p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-brand-charcoal text-white">
              {selectedTransactionIds.length} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-brand-taupe/30" />

          <div className="flex items-center gap-2">
            <Select onValueChange={handleStatusUpdate}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intake">Set to Intake</SelectItem>
                <SelectItem value="active">Set to Active</SelectItem>
                <SelectItem value="closed">Set to Closed</SelectItem>
                <SelectItem value="cancelled">Set to Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Implement bulk agent assignment
                toast({
                  title: "Coming Soon",
                  description: "Bulk agent assignment will be available soon",
                });
              }}
            >
              <Users className="h-4 w-4 mr-2" />
              Assign Agent
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Implement bulk workflow application
                toast({
                  title: "Coming Soon",
                  description: "Bulk workflow application will be available soon",
                });
              }}
            >
              <Workflow className="h-4 w-4 mr-2" />
              Apply Workflow
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Implement bulk export
                toast({
                  title: "Coming Soon",
                  description: "Bulk export will be available soon",
                });
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
