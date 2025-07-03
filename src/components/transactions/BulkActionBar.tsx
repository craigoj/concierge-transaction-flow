
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/useUserRole';
import { Trash2, UserX, RefreshCw, Archive } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onBulkStatusUpdate: (status: string) => void;
  onBulkReassign: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

const BulkActionBar = ({
  selectedCount,
  onBulkStatusUpdate,
  onBulkReassign,
  onBulkDelete,
  onClearSelection
}: BulkActionBarProps) => {
  const { role } = useUserRole();
  const isCoordinator = role === 'coordinator';

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {selectedCount} selected
          </Badge>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Bulk Actions:</span>
            
            <Select onValueChange={onBulkStatusUpdate}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intake">Move to Intake</SelectItem>
                <SelectItem value="active">Move to Active</SelectItem>
                <SelectItem value="pending">Move to Pending</SelectItem>
                <SelectItem value="closed">Move to Closed</SelectItem>
              </SelectContent>
            </Select>
            
            {isCoordinator && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBulkReassign}
                  className="flex items-center space-x-1"
                >
                  <UserX className="h-4 w-4" />
                  <span>Reassign</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBulkDelete}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-gray-500 hover:text-gray-700"
        >
          Clear Selection
        </Button>
      </div>
    </div>
  );
};

export default BulkActionBar;
