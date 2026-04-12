import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { storageService } from '@/lib/storage';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'purchase_agreement' | 'offer_letter' | 'disclosure' | 'custom';
  content: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface DocumentGenerationData {
  templateId: string;
  transactionId: string;
  variables: Record<string, any>;
  fileName?: string;
  metadata?: Record<string, any>;
}

export interface GeneratedDocument {
  id: string;
  fileName: string;
  filePath: string;
  url: string;
  size: number;
  type: string;
  transactionId: string;
  templateId: string;
  createdAt: string;
}

export class DocumentGenerator {
  private static instance: DocumentGenerator;

  private constructor() {}

  public static getInstance(): DocumentGenerator {
    if (!DocumentGenerator.instance) {
      DocumentGenerator.instance = new DocumentGenerator();
    }
    return DocumentGenerator.instance;
  }

  /**
   * Generate a PDF document from template and data
   */
  async generateDocument(data: DocumentGenerationData): Promise<{
    success: boolean;
    document?: GeneratedDocument;
    error?: string;
  }> {
    try {
      // Get template
      const template = await this.getTemplate(data.templateId);
      if (!template) {
        return {
          success: false,
          error: 'Template not found',
        };
      }

      // Substitute variables in template
      const processedContent = this.substituteVariables(template.content, data.variables);

      // Generate PDF from processed content
      const pdfBlob = await this.generatePDF(processedContent, template.name);

      // Generate file path
      const fileName = data.fileName || `${template.name}_${Date.now()}.pdf`;
      const filePath = storageService.generateFilePath(
        data.transactionId,
        fileName,
        'generated-documents'
      );

      // Upload to storage
      const uploadResult = await storageService.uploadFile(
        new File([pdfBlob], fileName, { type: 'application/pdf' }),
        filePath,
        {
          metadata: {
            templateId: data.templateId,
            transactionId: data.transactionId,
            generatedAt: new Date().toISOString(),
            ...data.metadata,
          },
        }
      );

      if (!uploadResult.success) {
        return {
          success: false,
          error: `Upload failed: ${uploadResult.error}`,
        };
      }

      // Save document record to database
      const documentRecord = await this.saveDocumentRecord({
        fileName,
        filePath: uploadResult.filePath!,
        url: uploadResult.url!,
        size: pdfBlob.size,
        type: 'application/pdf',
        transactionId: data.transactionId,
        templateId: data.templateId,
      });

      if (!documentRecord) {
        return {
          success: false,
          error: 'Failed to save document record',
        };
      }

      logger.info(`Document generated successfully: ${fileName}`);
      return {
        success: true,
        document: documentRecord,
      };
    } catch (error) {
      logger.error('Document generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate PDF from HTML content using @react-pdf/renderer
   */
  private async generatePDF(htmlContent: string, templateName: string): Promise<Blob> {
    const DocumentPDF = () => (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.title}>{templateName}</Text>
            <View style={styles.content}>{this.parseHTMLToReactPDF(htmlContent)}</View>
          </View>
        </Page>
      </Document>
    );

    return await pdf(<DocumentPDF />).toBlob();
  }

  /**
   * Parse HTML content to React PDF components
   */
  private parseHTMLToReactPDF(htmlContent: string): React.ReactElement[] {
    // Simple HTML to React PDF conversion
    // In a real implementation, you'd use a proper HTML parser
    const lines = htmlContent.split('\n');
    return lines.map((line, index) => {
      const cleanLine = line.replace(/<[^>]*>/g, ''); // Remove HTML tags
      return (
        <Text key={index} style={styles.text}>
          {cleanLine}
        </Text>
      );
    });
  }

  /**
   * Substitute variables in template content
   */
  private substituteVariables(content: string, variables: Record<string, any>): string {
    let processedContent = content;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedContent = processedContent.replace(regex, String(value || ''));
    });

    return processedContent;
  }

  /**
   * Get template by ID
   */
  private async getTemplate(templateId: string): Promise<DocumentTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) {
        logger.error('Error fetching template:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Get template error:', error);
      return null;
    }
  }

  /**
   * Save document record to database
   */
  private async saveDocumentRecord(
    document: Omit<GeneratedDocument, 'id' | 'createdAt'>
  ): Promise<GeneratedDocument | null> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: document.fileName,
          file_path: document.filePath,
          file_size: document.size,
          mime_type: document.type,
          transaction_id: document.transactionId,
          template_id: document.templateId,
          url: document.url,
        })
        .select()
        .single();

      if (error) {
        logger.error('Error saving document record:', error);
        return null;
      }

      return {
        id: data.id,
        fileName: data.title,
        filePath: data.file_path,
        url: data.url,
        size: data.file_size,
        type: data.mime_type,
        transactionId: data.transaction_id,
        templateId: data.template_id,
        createdAt: data.created_at,
      };
    } catch (error) {
      logger.error('Save document record error:', error);
      return null;
    }
  }

  /**
   * Get generated documents for a transaction
   */
  async getDocumentsByTransaction(transactionId: string): Promise<GeneratedDocument[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching documents:', error);
        return [];
      }

      return data.map((doc) => ({
        id: doc.id,
        fileName: doc.title,
        filePath: doc.file_path,
        url: doc.url,
        size: doc.file_size,
        type: doc.mime_type,
        transactionId: doc.transaction_id,
        templateId: doc.template_id,
        createdAt: doc.created_at,
      }));
    } catch (error) {
      logger.error('Get documents by transaction error:', error);
      return [];
    }
  }

  /**
   * Delete a generated document
   */
  async deleteDocument(documentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get document record
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        return {
          success: false,
          error: fetchError.message,
        };
      }

      // Delete from storage
      const storageResult = await storageService.deleteFile(document.file_path);
      if (!storageResult.success) {
        logger.warn(`Failed to delete file from storage: ${storageResult.error}`);
      }

      // Delete from database
      const { error: deleteError } = await supabase.from('documents').delete().eq('id', documentId);

      if (deleteError) {
        return {
          success: false,
          error: deleteError.message,
        };
      }

      logger.info(`Document deleted successfully: ${documentId}`);
      return { success: true };
    } catch (error) {
      logger.error('Delete document error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// PDF styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 12,
    lineHeight: 1.5,
  },
  text: {
    marginBottom: 5,
  },
});

// Export singleton instance
export const documentGenerator = DocumentGenerator.getInstance();
