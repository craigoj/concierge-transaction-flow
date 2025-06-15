
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface XMLTemplateImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ImportResult {
  success: boolean;
  templatesImported: number;
  tasksImported: number;
  emailsImported: number;
  importId: string;
  error?: string;
}

const XMLTemplateImportDialog = ({ open, onOpenChange }: XMLTemplateImportDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (file: File): Promise<ImportResult> => {
      const xmlContent = await file.text();
      
      const { data, error } = await supabase.functions.invoke('xml-template-import', {
        body: {
          xmlContent,
          filename: file.name
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (result) => {
      setImportResult(result);
      queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
      toast.success(`Successfully imported ${result.templatesImported} templates!`);
    },
    onError: (error: any) => {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        templatesImported: 0,
        tasksImported: 0,
        emailsImported: 0,
        importId: '',
        error: error.message
      });
      toast.error('Failed to import templates');
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/xml' || file.name.endsWith('.xml')) {
        setSelectedFile(file);
        setImportResult(null);
      } else {
        toast.error('Please select an XML file');
      }
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      importMutation.mutate(selectedFile);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import XML Templates</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!importResult && (
            <>
              <div className="space-y-2">
                <Label htmlFor="xml-file">Select XML Template File</Label>
                <Input
                  id="xml-file"
                  type="file"
                  accept=".xml"
                  onChange={handleFileChange}
                  disabled={importMutation.isPending}
                />
              </div>

              {selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{selectedFile.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}

              {importMutation.isPending && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">Processing XML file...</span>
                  </div>
                  <Progress value={undefined} className="w-full" />
                </div>
              )}

              <Alert>
                <AlertDescription>
                  This will import workflow templates from your XML file. Each template
                  will be created with all its tasks and associated email templates.
                </AlertDescription>
              </Alert>
            </>
          )}

          {importResult && (
            <div className="space-y-4">
              {importResult.success ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Import Successful!</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {importResult.templatesImported}
                      </div>
                      <div className="text-xs text-blue-600">Templates</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {importResult.tasksImported}
                      </div>
                      <div className="text-xs text-green-600">Tasks</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {importResult.emailsImported}
                      </div>
                      <div className="text-xs text-purple-600">Emails</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Import Failed</span>
                  </div>
                  
                  <Alert>
                    <AlertDescription>
                      {importResult.error || 'An unexpected error occurred during import.'}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              {importResult ? 'Close' : 'Cancel'}
            </Button>
            {!importResult && (
              <Button
                onClick={handleImport}
                disabled={!selectedFile || importMutation.isPending}
              >
                {importMutation.isPending ? 'Importing...' : 'Import Templates'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default XMLTemplateImportDialog;
