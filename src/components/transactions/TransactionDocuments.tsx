import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Download, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TransactionDocumentsProps {
  transactionId: string;
}

const TransactionDocuments = ({ transactionId }: TransactionDocumentsProps) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', transactionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', transactionId] });
      toast({ title: "Success", description: "Document deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // For now, we'll just create a document record without actual file storage
      // In a real implementation, you'd upload to Supabase Storage
      const { error } = await supabase
        .from('documents')
        .insert({
          transaction_id: transactionId,
          file_name: selectedFile.name,
          file_path: `/documents/${transactionId}/${selectedFile.name}`, // Mock path
          uploaded_by_id: user.id,
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['documents', transactionId] });
      setUploadDialogOpen(false);
      setSelectedFile(null);
      toast({ title: "Success", description: "Document uploaded successfully" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (document: any) => {
    // In a real implementation, this would download from Supabase Storage
    // For now, we'll simulate a download action
    const link = document.createElement('a');
    link.href = document.file_path || '#';
    link.download = document.file_name;
    
    // Create a mock download for demo purposes
    const blob = new Blob(['Mock file content'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    link.href = url;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    toast({ 
      title: "Download Started", 
      description: `Downloading ${document.file_name}` 
    });
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return <FileText className="h-5 w-5 text-muted-foreground" />;
  };

  const getFileCategory = (fileName: string) => {
    const name = fileName.toLowerCase();
    if (name.includes('contract') || name.includes('agreement')) return 'Contract';
    if (name.includes('inspection')) return 'Inspection';
    if (name.includes('appraisal')) return 'Appraisal';
    if (name.includes('disclosure')) return 'Disclosure';
    return 'General';
  };

  if (isLoading) {
    return <div className="p-4">Loading documents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Documents</h2>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading || !selectedFile} className="flex-1">
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Documents ({documents?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!documents || documents.length === 0 ? (
            <div className="text-center py-8">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No documents uploaded</h3>
              <p className="text-muted-foreground">Upload your first document to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getFileIcon(document.file_name)}
                    <div>
                      <p className="font-medium">{document.file_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Uploaded {new Date(document.created_at).toLocaleDateString()}</span>
                        <Badge variant="outline">{getFileCategory(document.file_name)}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(document)}
                      title="Download document"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteDocumentMutation.mutate(document.id)}
                      disabled={deleteDocumentMutation.isPending}
                      title="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionDocuments;
