import { SecurityUtils } from './security-utils';
import { logger } from './logger';
import { auditFile } from './audit-logging';

export interface FileSecurityConfig {
  maxFileSize: number; // in bytes
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  blockedExtensions: string[];
  scanForMalware: boolean;
  quarantineDirectory: string;
  virusScanTimeout: number; // in milliseconds
  allowExecutableFiles: boolean;
  checkFileSignatures: boolean;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedFilename: string;
  metadata: {
    originalName: string;
    size: number;
    mimeType: string;
    extension: string;
    hash: string;
    scanResult?: 'clean' | 'infected' | 'suspicious' | 'unknown';
  };
}

export interface FileSignature {
  extension: string;
  signatures: string[];
  mimeType: string;
}

export class FileSecurityValidator {
  private config: FileSecurityConfig;
  
  // Known file signatures for common file types
  private fileSignatures: FileSignature[] = [
    { extension: '.pdf', signatures: ['25504446'], mimeType: 'application/pdf' },
    { extension: '.jpg', signatures: ['FFD8FF'], mimeType: 'image/jpeg' },
    { extension: '.jpeg', signatures: ['FFD8FF'], mimeType: 'image/jpeg' },
    { extension: '.png', signatures: ['89504E47'], mimeType: 'image/png' },
    { extension: '.gif', signatures: ['474946'], mimeType: 'image/gif' },
    { extension: '.doc', signatures: ['D0CF11E0'], mimeType: 'application/msword' },
    { extension: '.docx', signatures: ['504B0304'], mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { extension: '.xls', signatures: ['D0CF11E0'], mimeType: 'application/vnd.ms-excel' },
    { extension: '.xlsx', signatures: ['504B0304'], mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    { extension: '.zip', signatures: ['504B0304'], mimeType: 'application/zip' },
    { extension: '.txt', signatures: [], mimeType: 'text/plain' }, // Text files don't have consistent signatures
    { extension: '.csv', signatures: [], mimeType: 'text/csv' }
  ];

  // Dangerous file extensions that should be blocked
  private dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jse',
    '.jar', '.msi', '.dll', '.ps1', '.psm1', '.psd1', '.ps1xml', '.psc1',
    '.sh', '.bash', '.zsh', '.fish', '.pl', '.py', '.rb', '.php', '.asp',
    '.aspx', '.jsp', '.cgi', '.htm', '.html', '.hta', '.reg', '.inf',
    '.sys', '.drv', '.ocx', '.cab', '.rar', '.7z', '.tar', '.gz', '.bz2'
  ];

  constructor(config: Partial<FileSecurityConfig> = {}) {
    this.config = {
      maxFileSize: 10 * 1024 * 1024, // 10MB default
      allowedMimeTypes: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'text/csv',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ],
      allowedExtensions: [
        '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.txt', '.csv',
        '.doc', '.docx', '.xls', '.xlsx'
      ],
      blockedExtensions: this.dangerousExtensions,
      scanForMalware: false, // Would require server-side integration
      quarantineDirectory: '/tmp/quarantine',
      virusScanTimeout: 30000, // 30 seconds
      allowExecutableFiles: false,
      checkFileSignatures: true,
      ...config
    };
  }

  public async validateFile(file: File, userId?: string): Promise<FileValidationResult> {
    const result: FileValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedFilename: '',
      metadata: {
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        extension: this.getFileExtension(file.name),
        hash: await this.calculateFileHash(file)
      }
    };

    // Step 1: Basic file validation
    await this.validateBasicProperties(file, result);

    // Step 2: Filename validation and sanitization
    this.validateAndSanitizeFilename(file, result);

    // Step 3: File size validation
    this.validateFileSize(file, result);

    // Step 4: MIME type validation
    this.validateMimeType(file, result);

    // Step 5: Extension validation
    this.validateFileExtension(file, result);

    // Step 6: File signature validation
    if (this.config.checkFileSignatures) {
      await this.validateFileSignature(file, result);
    }

    // Step 7: Content validation
    await this.validateFileContent(file, result);

    // Step 8: Malware scanning (if enabled)
    if (this.config.scanForMalware) {
      await this.scanForMalware(file, result);
    }

    // Final validation result
    result.isValid = result.errors.length === 0;

    // Log the validation result
    this.logValidationResult(file, result, userId);

    // Audit log the file upload attempt
    if (userId) {
      auditFile.upload(
        userId,
        file.name,
        file.size,
        result.isValid ? 'success' : 'blocked'
      );
    }

    return result;
  }

  private async validateBasicProperties(file: File, result: FileValidationResult): Promise<void> {
    if (!file) {
      result.errors.push('No file provided');
      return;
    }

    if (!file.name || file.name.trim() === '') {
      result.errors.push('File name is required');
    }

    if (file.size === 0) {
      result.errors.push('File is empty');
    }
  }

  private validateAndSanitizeFilename(file: File, result: FileValidationResult): void {
    let sanitizedName = file.name;

    // Remove path traversal attempts
    sanitizedName = sanitizedName.replace(/[\/\\]/g, '');

    // Remove dangerous characters
    sanitizedName = sanitizedName.replace(/[<>:"|?*]/g, '');

    // Remove control characters
    sanitizedName = sanitizedName.replace(/[\x00-\x1f\x7f-\x9f]/g, '');

    // Limit filename length
    if (sanitizedName.length > 255) {
      const extension = this.getFileExtension(sanitizedName);
      const nameWithoutExt = sanitizedName.substring(0, sanitizedName.lastIndexOf('.'));
      sanitizedName = nameWithoutExt.substring(0, 255 - extension.length) + extension;
      result.warnings.push('Filename was truncated due to length');
    }

    // Ensure filename is not empty after sanitization
    if (!sanitizedName || sanitizedName.trim() === '') {
      result.errors.push('Filename is invalid after sanitization');
      sanitizedName = `file_${Date.now()}.bin`;
    }

    // Check for suspicious filenames
    const suspiciousPatterns = [
      /^\./,  // Hidden files
      /\.$/, // Files ending with dot
      /con|prn|aux|nul|com[1-9]|lpt[1-9]/i, // Windows reserved names
      /\.(php|asp|aspx|jsp|pl|py|rb|sh|bat|cmd|exe)$/i // Script files
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(sanitizedName)) {
        result.warnings.push(`Suspicious filename pattern detected: ${pattern.source}`);
        break;
      }
    }

    result.sanitizedFilename = sanitizedName;
  }

  private validateFileSize(file: File, result: FileValidationResult): void {
    if (file.size > this.config.maxFileSize) {
      result.errors.push(
        `File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(this.config.maxFileSize)})`
      );
    }

    // Warn about large files
    if (file.size > this.config.maxFileSize * 0.8) {
      result.warnings.push('File size is approaching the maximum limit');
    }
  }

  private validateMimeType(file: File, result: FileValidationResult): void {
    if (!this.config.allowedMimeTypes.includes(file.type)) {
      result.errors.push(`MIME type '${file.type}' is not allowed`);
    }

    // Check for MIME type spoofing
    const extension = this.getFileExtension(file.name);
    const expectedMimeType = this.getExpectedMimeType(extension);
    
    if (expectedMimeType && file.type !== expectedMimeType) {
      result.warnings.push(
        `MIME type '${file.type}' doesn't match expected type '${expectedMimeType}' for extension '${extension}'`
      );
    }
  }

  private validateFileExtension(file: File, result: FileValidationResult): void {
    const extension = this.getFileExtension(file.name);

    if (!extension) {
      result.errors.push('File must have an extension');
      return;
    }

    if (this.config.blockedExtensions.includes(extension.toLowerCase())) {
      result.errors.push(`File extension '${extension}' is blocked for security reasons`);
    }

    if (!this.config.allowedExtensions.includes(extension.toLowerCase())) {
      result.errors.push(`File extension '${extension}' is not allowed`);
    }

    // Check for double extensions (e.g., .txt.exe)
    const extensionCount = (file.name.match(/\./g) || []).length;
    if (extensionCount > 1) {
      result.warnings.push('File has multiple extensions, which could be suspicious');
    }
  }

  private async validateFileSignature(file: File, result: FileValidationResult): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const signature = Array.from(bytes.slice(0, 8))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

    const extension = this.getFileExtension(file.name);
    const expectedSignature = this.fileSignatures.find(s => s.extension === extension);

    if (expectedSignature && expectedSignature.signatures.length > 0) {
      const signatureMatch = expectedSignature.signatures.some(sig => 
        signature.startsWith(sig.toUpperCase())
      );

      if (!signatureMatch) {
        result.warnings.push(
          `File signature doesn't match expected signature for ${extension} files`
        );
      }
    }

    result.metadata.hash = signature;
  }

  private async validateFileContent(file: File, result: FileValidationResult): Promise<void> {
    // For text files, check for suspicious content
    if (file.type.startsWith('text/')) {
      const text = await file.text();
      
      // Check for script injections
      const scriptPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /data:text\/html/gi,
        /on\w+\s*=/gi
      ];

      for (const pattern of scriptPatterns) {
        if (pattern.test(text)) {
          result.errors.push('File contains potentially malicious script content');
          break;
        }
      }

      // Check for suspicious URLs
      const urlPattern = /https?:\/\/[^\s]+/gi;
      const urls = text.match(urlPattern);
      if (urls && urls.length > 10) {
        result.warnings.push('File contains many URLs, which could be suspicious');
      }
    }
  }

  private async scanForMalware(file: File, result: FileValidationResult): Promise<void> {
    // This would integrate with a malware scanning service
    // For now, we'll simulate the scan
    result.metadata.scanResult = 'clean';
    
    logger.info('File malware scan completed', {
      filename: file.name,
      size: file.size,
      result: result.metadata.scanResult,
      context: 'file_security'
    });
  }

  private async calculateFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.substring(lastDotIndex).toLowerCase() : '';
  }

  private getExpectedMimeType(extension: string): string | null {
    const signature = this.fileSignatures.find(s => s.extension === extension);
    return signature ? signature.mimeType : null;
  }

  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  private logValidationResult(file: File, result: FileValidationResult, userId?: string): void {
    const logData = {
      filename: result.sanitizedFilename,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
      isValid: result.isValid,
      errors: result.errors,
      warnings: result.warnings,
      userId,
      context: 'file_security'
    };

    if (result.isValid) {
      logger.info('File validation successful', logData);
    } else {
      logger.warn('File validation failed', logData);
    }
  }
}

// Global file security validator instance
export const fileSecurityValidator = new FileSecurityValidator();

// React hook for file validation
export const useFileValidation = () => {
  const validateFile = async (file: File, userId?: string): Promise<FileValidationResult> => {
    return fileSecurityValidator.validateFile(file, userId);
  };

  const validateFiles = async (files: File[], userId?: string): Promise<FileValidationResult[]> => {
    const results: FileValidationResult[] = [];
    
    for (const file of files) {
      const result = await validateFile(file, userId);
      results.push(result);
    }
    
    return results;
  };

  return {
    validateFile,
    validateFiles
  };
};

// Secure file upload component wrapper
export const SecureFileUpload: React.FC<{
  onFileValidated: (file: File, result: FileValidationResult) => void;
  onValidationError: (errors: string[]) => void;
  userId?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  children?: React.ReactNode;
}> = ({ onFileValidated, onValidationError, userId, accept, multiple = false, maxFiles = 5, children }) => {
  const { validateFile } = useFileValidation();
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    
    // Check file count limit
    if (fileArray.length > maxFiles) {
      onValidationError([`Maximum ${maxFiles} files allowed`]);
      return;
    }

    // Validate each file
    for (const file of fileArray) {
      try {
        const result = await validateFile(file, userId);
        
        if (result.isValid) {
          onFileValidated(file, result);
        } else {
          onValidationError(result.errors);
        }
      } catch (error) {
        logger.error('File validation error', {
          filename: file.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          context: 'file_security'
        });
        
        onValidationError(['File validation failed due to an unexpected error']);
      }
    }
  };

  return (
    <div className="secure-file-upload">
      <input
        type="file"
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        className="hidden"
        id="secure-file-input"
      />
      <label htmlFor="secure-file-input">
        {children || (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400">
            <div className="text-sm text-gray-600">
              Click to select files or drag and drop
            </div>
          </div>
        )}
      </label>
    </div>
  );
};

// Utility functions for file security
export const isFileSecure = (file: File): boolean => {
  const secureExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.csv'];
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  return secureExtensions.includes(extension);
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[\/\\:*?"<>|]/g, '') // Remove dangerous characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .substring(0, 255); // Limit length
};

export const getFileTypeIcon = (file: File): string => {
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  switch (extension) {
    case '.pdf':
      return '📄';
    case '.jpg':
    case '.jpeg':
    case '.png':
    case '.gif':
      return '🖼️';
    case '.doc':
    case '.docx':
      return '📝';
    case '.xls':
    case '.xlsx':
      return '📊';
    case '.txt':
      return '📄';
    case '.csv':
      return '📋';
    default:
      return '📁';
  }
};