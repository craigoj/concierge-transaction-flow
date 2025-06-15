
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AgentDocumentsListProps {
  transactionId: string;
}

const AgentDocumentsList = ({ transactionId }: AgentDocumentsListProps) => {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['agent-documents', transactionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('transaction_id', transactionId)
        .eq('is_agent_visible', true) // Only fetch documents marked as agent-visible
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-brand-heading tracking-wide">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-brand-taupe/40 mx-auto mb-4" />
            <p className="text-brand-charcoal/60 font-brand-body">
              No documents are currently shared with you for this transaction.
            </p>
            <p className="text-sm text-brand-charcoal/40 font-brand-body mt-2">
              Your transaction coordinator will share relevant documents as they become available.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return <FileText className="h-8 w-8 text-brand-taupe" />;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-brand-heading tracking-wide">
          <FileText className="h-5 w-5" />
          Shared Documents ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {documents.map((document) => (
          <div key={document.id} className="flex items-center gap-4 p-4 border border-brand-taupe/20 rounded-lg hover:shadow-md transition-shadow bg-white">
            <div className="flex-shrink-0">
              {getFileIcon(document.file_name)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-brand-charcoal font-brand-heading truncate">
                {document.file_name}
              </h4>
              <div className="flex items-center gap-4 mt-1 text-sm text-brand-charcoal/60">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(document.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
                Shared
              </Badge>
              
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AgentDocumentsList;
