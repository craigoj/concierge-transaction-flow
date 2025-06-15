
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface ImportHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ImportRecord {
  id: string;
  filename: string;
  import_status: string;
  templates_imported: number;
  tasks_imported: number;
  emails_imported: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

const ImportHistoryDialog = ({ open, onOpenChange }: ImportHistoryDialogProps) => {
  const { data: imports, isLoading } = useQuery({
    queryKey: ['xml-template-imports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xml_template_imports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ImportRecord[];
    },
    enabled: open
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Template Import History</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                <p className="text-sm text-muted-foreground">Loading import history...</p>
              </div>
            </div>
          ) : imports && imports.length > 0 ? (
            <div className="space-y-4">
              {imports.map((importRecord) => (
                <div
                  key={importRecord.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{importRecord.filename}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(importRecord.import_status)}
                      {getStatusBadge(importRecord.import_status)}
                    </div>
                  </div>

                  {importRecord.import_status === 'completed' && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-lg font-bold text-blue-600">
                          {importRecord.templates_imported}
                        </div>
                        <div className="text-xs text-blue-600">Templates</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-600">
                          {importRecord.tasks_imported}
                        </div>
                        <div className="text-xs text-green-600">Tasks</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="text-lg font-bold text-purple-600">
                          {importRecord.emails_imported}
                        </div>
                        <div className="text-xs text-purple-600">Emails</div>
                      </div>
                    </div>
                  )}

                  {importRecord.error_message && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      {importRecord.error_message}
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Started: {format(new Date(importRecord.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                    {importRecord.completed_at && (
                      <span>
                        Completed: {format(new Date(importRecord.completed_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No import history found.</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ImportHistoryDialog;
