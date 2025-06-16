import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import XMLImportPreviewDialog from './XMLImportPreviewDialog';
import XMLImportProgressDialog from './XMLImportProgressDialog';

interface XMLTemplateImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedTask {
  subject: string;
  taskType: string;
  dueDateRule: {
    type: string;
    event?: string;
    days?: number;
  };
  isAgentVisible: boolean;
  hasEmail: boolean;
  sortOrder: number;
}

interface ParsedEmail {
  name: string;
  subject: string;
  to: string;
  cc: string;
  bcc: string;
}

interface ParsedTemplate {
  name: string;
  type: string;
  description: string;
  folderName: string;
  tasks: ParsedTask[];
  emails: ParsedEmail[];
}

interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  location?: string;
}

interface ImportResult {
  success: boolean;
  templatesImported: number;
  tasksImported: number;
  emailsImported: number;
  importId: string;
  error?: string;
}

interface ImportProgress {
  stage: 'parsing' | 'validating' | 'importing' | 'completed' | 'error';
  templatesProcessed: number;
  totalTemplates: number;
  tasksProcessed: number;
  totalTasks: number;
  emailsProcessed: number;
  totalEmails: number;
  currentTemplate?: string;
  error?: string;
}

const XMLTemplateImportDialog = ({ open, onOpenChange }: XMLTemplateImportDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedTemplate[] | null>(null);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    stage: 'parsing',
    templatesProcessed: 0,
    totalTemplates: 0,
    tasksProcessed: 0,
    totalTasks: 0,
    emailsProcessed: 0,
    totalEmails: 0
  });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const queryClient = useQueryClient();

  const validateXMLStructure = (xmlContent: string): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];
    
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
      
      // Check for XML parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        issues.push({
          type: 'error',
          message: 'XML parsing failed: Invalid XML format',
          location: 'Document root'
        });
        return issues;
      }

      const taskTemplates = xmlDoc.querySelectorAll('taskTemplate');
      
      if (taskTemplates.length === 0) {
        issues.push({
          type: 'error',
          message: 'No task templates found in XML file',
          location: 'Document root'
        });
        return issues;
      }

      // Enhanced validation with more comprehensive checks
      taskTemplates.forEach((template, index) => {
        const folderName = template.getAttribute('folderName');
        const name = template.querySelector('name')?.textContent;
        const templateType = template.querySelector('taskTemplateType')?.textContent;
        
        if (!name || name.trim() === '') {
          issues.push({
            type: 'error',
            message: 'Template missing required name',
            location: `Template ${index + 1}${folderName ? ` (${folderName})` : ''}`
          });
        }

        // Validate template type
        if (templateType && !['XACTION', 'BUYER', 'SELLER', 'LISTING', 'GENERAL'].includes(templateType)) {
          issues.push({
            type: 'warning',
            message: `Unknown template type: ${templateType}`,
            location: `Template: ${name}`
          });
        }

        // Check for duplicate template names
        const allNames = Array.from(taskTemplates).map(t => t.querySelector('name')?.textContent).filter(Boolean);
        const duplicateNames = allNames.filter((name, i) => allNames.indexOf(name) !== i);
        if (duplicateNames.includes(name)) {
          issues.push({
            type: 'warning',
            message: `Duplicate template name: ${name}`,
            location: `Template ${index + 1}`
          });
        }

        // Validate task entries with enhanced checks
        const taskEntries = template.querySelectorAll('taskTemplateEntry');
        if (taskEntries.length === 0) {
          issues.push({
            type: 'warning',
            message: 'Template has no task entries',
            location: `Template: ${name}`
          });
        }

        taskEntries.forEach((entry, taskIndex) => {
          const subject = entry.querySelector('subject')?.textContent;
          const taskType = entry.querySelector('taskType')?.textContent;
          const dueDateAdjustType = entry.querySelector('dueDateAdjustType')?.textContent;
          const letterTemplate = entry.querySelector('letterTemplate');
          
          if (!subject || subject.trim() === '') {
            issues.push({
              type: 'error',
              message: 'Task missing required subject',
              location: `Template: ${name}, Task ${taskIndex + 1}`
            });
          }

          // Validate task type
          if (taskType && !['TODO', 'CALL', 'EMAIL', 'APPOINTMENT', 'DOCUMENT', 'REMINDER', 'MILESTONE'].includes(taskType)) {
            issues.push({
              type: 'warning',
              message: `Unknown task type: ${taskType}`,
              location: `Template: ${name}, Task: ${subject}`
            });
          }

          // Validate due date adjust type
          if (dueDateAdjustType && !['TEMPLATE_START_DATE', 'CLOSING_DATE', 'CONTRACT_DATE', 'RATIFIED_DATE', 'INSPECTION_DATE', 'APPRAISAL_DATE', 'FINANCING_DATE'].includes(dueDateAdjustType)) {
            issues.push({
              type: 'warning',
              message: `Unknown due date type: ${dueDateAdjustType}`,
              location: `Template: ${name}, Task: ${subject}`
            });
          }

          // Validate email template if present
          if (letterTemplate) {
            const emailName = letterTemplate.querySelector('name')?.textContent;
            const emailSubject = letterTemplate.querySelector('emailSubject')?.textContent;
            const htmlText = letterTemplate.querySelector('htmlText')?.textContent;
            
            if (!emailName || emailName.trim() === '') {
              issues.push({
                type: 'warning',
                message: 'Email template missing name',
                location: `Template: ${name}, Task: ${subject}`
              });
            }
            
            if (!emailSubject || emailSubject.trim() === '') {
              issues.push({
                type: 'warning',
                message: 'Email template missing subject',
                location: `Template: ${name}, Task: ${subject}`
              });
            }
            
            if (!htmlText || htmlText.trim() === '') {
              issues.push({
                type: 'warning',
                message: 'Email template missing content',
                location: `Template: ${name}, Task: ${subject}`
              });
            }
          }
        });
      });

    } catch (error) {
      issues.push({
        type: 'error',
        message: `Failed to validate XML: ${error instanceof Error ? error.message : 'Unknown error'}`,
        location: 'Document parsing'
      });
    }

    return issues;
  };

  const parseXMLData = (xmlContent: string): ParsedTemplate[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    const taskTemplates = xmlDoc.querySelectorAll('taskTemplate');
    
    return Array.from(taskTemplates).map(templateElement => {
      const folderName = templateElement.getAttribute('folderName') || '';
      const name = templateElement.querySelector('name')?.textContent || '';
      const description = templateElement.querySelector('description')?.textContent || '';
      const templateType = templateElement.querySelector('taskTemplateType')?.textContent || 'XACTION';

      // Enhanced template type mapping
      let mappedType = 'General';
      const nameLower = name.toLowerCase();
      const folderLower = folderName.toLowerCase();
      
      if (nameLower.includes('listing') || nameLower.includes('seller') || 
          folderLower.includes('listing') || folderLower.includes('seller') ||
          templateType === 'SELLER' || templateType === 'LISTING') {
        mappedType = 'Listing';
      } else if (nameLower.includes('buyer') || nameLower.includes('purchase') || 
                 folderLower.includes('buyer') || folderLower.includes('purchase') ||
                 templateType === 'BUYER') {
        mappedType = 'Buyer';
      }

      // Parse tasks with enhanced property mapping
      const templateEntries = templateElement.querySelectorAll('taskTemplateEntry');
      const tasks: ParsedTask[] = Array.from(templateEntries).map((entry, index) => {
        const subject = entry.querySelector('subject')?.textContent || '';
        const taskType = entry.querySelector('taskType')?.textContent || 'TODO';
        const agentVisible = entry.querySelector('agentVisible')?.textContent === 'true';
        const sort = parseInt(entry.querySelector('sort')?.textContent || '0');
        const letterTemplate = entry.querySelector('letterTemplate');
        
        const dueDateAdjustActive = entry.querySelector('dueDateAdjustActive')?.textContent === 'true';
        const dueDateAdjustDelta = parseInt(entry.querySelector('dueDateAdjustDelta')?.textContent || '0');
        const dueDateAdjustType = entry.querySelector('dueDateAdjustType')?.textContent || 'TEMPLATE_START_DATE';

        // Enhanced due date rule mapping
        let dueDateRule: { type: string; event?: string; days?: number } = { type: 'no_due_date' };
        if (dueDateAdjustActive) {
          let event = 'ratified_date'; // Default
          
          switch (dueDateAdjustType) {
            case 'CLOSING_DATE':
            case 'SETTLEMENT_DATE':
              event = 'closing_date';
              break;
            case 'INSPECTION_DATE':
              event = 'inspection_date';
              break;
            case 'APPRAISAL_DATE':
              event = 'appraisal_date';
              break;
            case 'FINANCING_DATE':
              event = 'financing_date';
              break;
            case 'TEMPLATE_START_DATE':
            case 'CONTRACT_DATE':
            case 'RATIFIED_DATE':
            default:
              event = 'ratified_date';
              break;
          }
          
          dueDateRule = {
            type: 'days_from_event',
            event,
            days: dueDateAdjustDelta
          };
        }

        return {
          subject,
          taskType,
          dueDateRule,
          isAgentVisible: agentVisible,
          hasEmail: !!letterTemplate,
          sortOrder: sort
        };
      });

      // Parse email templates with enhanced processing
      const emails: ParsedEmail[] = Array.from(templateEntries)
        .filter(entry => entry.querySelector('letterTemplate'))
        .map(entry => {
          const letterTemplate = entry.querySelector('letterTemplate')!;
          return {
            name: letterTemplate.querySelector('name')?.textContent || '',
            subject: letterTemplate.querySelector('emailSubject')?.textContent || '',
            to: letterTemplate.querySelector('emailTo')?.textContent || '',
            cc: letterTemplate.querySelector('emailCc')?.textContent || '',
            bcc: letterTemplate.querySelector('emailBcc')?.textContent || ''
          };
        });

      return {
        name,
        type: mappedType,
        description: description || `Imported from ${folderName}`,
        folderName,
        tasks,
        emails
      };
    });
  };

  const validateAndPreview = async (file: File) => {
    try {
      setImportProgress({ ...importProgress, stage: 'parsing' });
      const xmlContent = await file.text();
      
      // Validate XML structure
      setImportProgress({ ...importProgress, stage: 'validating' });
      const issues = validateXMLStructure(xmlContent);
      setValidationIssues(issues);

      // Parse data if no critical errors
      const criticalErrors = issues.filter(issue => issue.type === 'error');
      if (criticalErrors.length === 0) {
        const parsed = parseXMLData(xmlContent);
        setParsedData(parsed);
        setShowPreview(true);
      } else {
        toast.error(`XML validation failed with ${criticalErrors.length} error(s)`);
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Failed to validate XML file');
      setValidationIssues([{
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown validation error',
        location: 'File processing'
      }]);
    }
  };

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
      setImportProgress({
        ...importProgress,
        stage: 'completed',
        templatesProcessed: result.templatesImported,
        tasksProcessed: result.tasksImported,
        emailsProcessed: result.emailsImported
      });
      queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
      queryClient.invalidateQueries({ queryKey: ['xml-template-imports'] });
      toast.success(`Successfully imported ${result.templatesImported} templates!`);
      
      setTimeout(() => {
        setShowProgress(false);
        handleClose();
      }, 2000);
    },
    onError: (error: any) => {
      console.error('Import error:', error);
      setImportProgress({
        ...importProgress,
        stage: 'error',
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
        setParsedData(null);
        setValidationIssues([]);
        setImportResult(null);
      } else {
        toast.error('Please select an XML file');
      }
    }
  };

  const handleValidateAndPreview = () => {
    if (selectedFile) {
      validateAndPreview(selectedFile);
    }
  };

  const handleConfirmImport = () => {
    if (selectedFile && parsedData) {
      const totalTasks = parsedData.reduce((sum, template) => sum + template.tasks.length, 0);
      const totalEmails = parsedData.reduce((sum, template) => sum + template.emails.length, 0);
      
      setImportProgress({
        stage: 'importing',
        templatesProcessed: 0,
        totalTemplates: parsedData.length,
        tasksProcessed: 0,
        totalTasks,
        emailsProcessed: 0,
        totalEmails,
        currentTemplate: parsedData[0]?.name
      });
      
      setShowPreview(false);
      setShowProgress(true);
      importMutation.mutate(selectedFile);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setParsedData(null);
    setValidationIssues([]);
    setImportResult(null);
    setShowPreview(false);
    setShowProgress(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open && !showPreview && !showProgress} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import XML Templates</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
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

            {validationIssues.length > 0 && (
              <Alert className={validationIssues.some(i => i.type === 'error') ? 'border-red-200' : 'border-yellow-200'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Validation Issues Found</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {validationIssues.slice(0, 3).map((issue, index) => (
                      <div key={index} className="text-sm">
                        <span className={issue.type === 'error' ? 'text-red-600' : 'text-yellow-600'}>
                          {issue.type.toUpperCase()}:
                        </span>{' '}
                        {issue.message}
                      </div>
                    ))}
                    {validationIssues.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        ...and {validationIssues.length - 3} more issues
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertDescription>
                This will validate and preview your XML templates before import. 
                You'll be able to review all templates, tasks, and email templates 
                before confirming the import.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleValidateAndPreview}
                disabled={!selectedFile}
              >
                <Upload className="h-4 w-4 mr-2" />
                Validate & Preview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <XMLImportPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        parsedData={parsedData}
        validationIssues={validationIssues}
        onConfirmImport={handleConfirmImport}
        onCancel={() => setShowPreview(false)}
        isProcessing={importMutation.isPending}
      />

      <XMLImportProgressDialog
        open={showProgress}
        progress={importProgress}
      />
    </>
  );
};

export default XMLTemplateImportDialog;
