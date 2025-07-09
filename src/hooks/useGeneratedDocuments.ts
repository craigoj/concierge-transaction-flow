import { useState, useEffect } from 'react';
import {
  documentGenerator,
  type GeneratedDocument,
} from '@/lib/document-generation/document-generator';
import { logger } from '@/lib/logger';

export const useGeneratedDocuments = (transactionId: string) => {
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await documentGenerator.getDocumentsByTransaction(transactionId);
      setDocuments(docs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch documents';
      setError(errorMessage);
      logger.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transactionId) {
      fetchDocuments();
    }
  }, [transactionId]);

  const removeDocument = (documentId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  };

  const addDocument = (document: GeneratedDocument) => {
    setDocuments((prev) => [document, ...prev]);
  };

  const refetch = () => {
    fetchDocuments();
  };

  return {
    documents,
    loading,
    error,
    refetch,
    removeDocument,
    addDocument,
  };
};
