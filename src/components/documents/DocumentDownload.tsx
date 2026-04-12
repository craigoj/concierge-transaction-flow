import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, User, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  documentGenerator,
  type GeneratedDocument,
} from '@/lib/document-generation/document-generator';
import { storageService } from '@/lib/storage';
import { formatDistance } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DocumentDownloadProps {
  transactionId: string;
  documents: GeneratedDocument[];
  onDocumentDeleted?: (documentId: string) => void;
}

export const DocumentDownload: React.FC<DocumentDownloadProps> = ({
  transactionId,
  documents,
  onDocumentDeleted,
}) => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDownload = async (document: GeneratedDocument) => {
    setDownloading(document.id);
    try {
      // Get signed URL for secure download
      const urlResult = await storageService.getSignedUrl(document.filePath, 3600); // 1 hour expiry

      if (!urlResult.success || !urlResult.url) {
        throw new Error(urlResult.error || 'Failed to get download URL');
      }

      // Create download link
      const link = document.createElement('a');
      link.href = urlResult.url;
      link.download = document.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Download Started',
        description: `Downloading ${document.fileName}`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (document: GeneratedDocument) => {
    setDeleting(document.id);
    try {
      const result = await documentGenerator.deleteDocument(document.id);

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete document');
      }

      toast({
        title: 'Document Deleted',
        description: `${document.fileName} has been deleted`,
      });

      onDocumentDeleted?.(document.id);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setDeleting(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (templateId: string): string => {
    // In a real implementation, you would look up the template type
    // For now, return a generic label
    return 'Offer Letter';
  };

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No documents generated yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generated Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">{document.fileName}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistance(new Date(document.createdAt), new Date(), {
                        addSuffix: true,
                      })}
                    </span>
                    <span>{formatFileSize(document.size)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary">{getDocumentTypeLabel(document.templateId)}</Badge>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(document)}
                  disabled={downloading === document.id}
                >
                  {downloading === document.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      disabled={deleting === document.id}
                    >
                      {deleting === document.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Document</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{document.fileName}"? This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(document)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
