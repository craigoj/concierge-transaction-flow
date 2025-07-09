import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface StorageConfig {
  bucketName: string;
  maxFileSize: number;
  allowedFileTypes: string[];
}

export interface UploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
  url?: string;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export class StorageService {
  private static instance: StorageService;
  private config: StorageConfig;

  private constructor() {
    this.config = {
      bucketName: 'documents',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
      ],
    };
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(
    file: File,
    filePath: string,
    options?: {
      replace?: boolean;
      metadata?: Record<string, any>;
    }
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validationResult = this.validateFile(file);
      if (!validationResult.valid) {
        return {
          success: false,
          error: validationResult.error,
        };
      }

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.config.bucketName)
        .upload(filePath, file, {
          upsert: options?.replace ?? false,
          metadata: options?.metadata,
        });

      if (error) {
        logger.error('Storage upload error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      // Get public URL for the uploaded file
      const publicUrl = await this.getPublicUrl(data.path);

      logger.info(`File uploaded successfully: ${data.path}`);
      return {
        success: true,
        filePath: data.path,
        url: publicUrl,
      };
    } catch (error) {
      logger.error('Upload file error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Download a file from Supabase Storage
   */
  async downloadFile(filePath: string): Promise<{ success: boolean; data?: Blob; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.config.bucketName)
        .download(filePath);

      if (error) {
        logger.error('Storage download error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error('Download file error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage.from(this.config.bucketName).remove([filePath]);

      if (error) {
        logger.error('Storage delete error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      logger.info(`File deleted successfully: ${filePath}`);
      return { success: true };
    } catch (error) {
      logger.error('Delete file error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get public URL for a file
   */
  async getPublicUrl(filePath: string): Promise<string> {
    const { data } = supabase.storage.from(this.config.bucketName).getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Get signed URL for private file access
   */
  async getSignedUrl(
    filePath: string,
    expiresIn: number = 3600
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.config.bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        logger.error('Storage signed URL error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        url: data.signedUrl,
      };
    } catch (error) {
      logger.error('Get signed URL error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(
    folderPath: string = ''
  ): Promise<{ success: boolean; files?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase.storage.from(this.config.bucketName).list(folderPath);

      if (error) {
        logger.error('Storage list error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        files: data,
      };
    } catch (error) {
      logger.error('List files error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate a file path for organized storage
   */
  generateFilePath(transactionId: string, filename: string, folder: string = 'documents'): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${folder}/${transactionId}/${timestamp}/${sanitizedFilename}`;
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.config.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum limit of ${this.config.maxFileSize / 1024 / 1024}MB`,
      };
    }

    // Check file type
    if (!this.config.allowedFileTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    // Check file name
    if (!file.name || file.name.length > 255) {
      return {
        valid: false,
        error: 'Invalid file name',
      };
    }

    return { valid: true };
  }

  /**
   * Create storage bucket if it doesn't exist
   */
  async initializeBucket(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();

      if (listError) {
        logger.error('Error listing buckets:', listError);
        return {
          success: false,
          error: listError.message,
        };
      }

      const bucketExists = buckets?.some((bucket) => bucket.name === this.config.bucketName);

      if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket(this.config.bucketName, {
          public: false, // Documents should be private by default
          fileSizeLimit: this.config.maxFileSize,
          allowedMimeTypes: this.config.allowedFileTypes,
        });

        if (createError) {
          logger.error('Error creating bucket:', createError);
          return {
            success: false,
            error: createError.message,
          };
        }

        logger.info(`Bucket ${this.config.bucketName} created successfully`);
      }

      return { success: true };
    } catch (error) {
      logger.error('Initialize bucket error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();
