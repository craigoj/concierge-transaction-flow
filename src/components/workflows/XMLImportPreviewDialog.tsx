
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, FileText, Mail, Calendar } from 'lucide-react';

interface ParsedTemplate {
  name: string;
  type: string;
  description: string;
  folderName: string;
  tasks: ParsedTask[];
  emails: ParsedEmail[];
}

interface ParsedTask {
  subject: string;
  taskType: string;
  dueDateRule: any;
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

interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  location?: string;
}

interface XMLImportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parsedData: ParsedTemplate[] | null;
  validationIssues: ValidationIssue[];
  onConfirmImport: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

const XMLImportPreviewDialog = ({
  open,
  onOpenChange,
  parsedData,
  validationIssues,
  onConfirmImport,
  onCancel,
  isProcessing
}: XMLImportPreviewDialogProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ParsedTemplate | null>(null);

  const errorCount = validationIssues.filter(issue => issue.type === 'error').length;
  const warningCount = validationIssues.filter(issue => issue.type === 'warning').length;
  const canImport = errorCount === 0;

  const totalTemplates = parsedData?.length || 0;
  const totalTasks = parsedData?.reduce((sum, template) => sum + template.tasks.length, 0) || 0;
  const totalEmails = parsedData?.reduce((sum, template) => sum + template.emails.length, 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Preview XML Import</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{totalTemplates}</div>
                <div className="text-sm text-muted-foreground">Templates</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{totalTasks}</div>
                <div className="text-sm text-muted-foreground">Tasks</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{totalEmails}</div>
                <div className="text-sm text-muted-foreground">Email Templates</div>
              </CardContent>
            </Card>
          </div>

          {/* Validation Issues */}
          {validationIssues.length > 0 && (
            <Alert className={errorCount > 0 ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">
                  Found {errorCount} error(s) and {warningCount} warning(s)
                </div>
                <ScrollArea className="max-h-32">
                  <div className="space-y-1">
                    {validationIssues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Badge variant={issue.type === 'error' ? 'destructive' : 'secondary'}>
                          {issue.type}
                        </Badge>
                        <span>{issue.message}</span>
                        {issue.location && (
                          <span className="text-muted-foreground">({issue.location})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="templates" className="space-y-4">
            <TabsList>
              <TabsTrigger value="templates">Templates ({totalTemplates})</TabsTrigger>
              <TabsTrigger value="details">Template Details</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              <ScrollArea className="max-h-96">
                <div className="space-y-3">
                  {parsedData?.map((template, index) => (
                    <Card 
                      key={index}
                      className={`cursor-pointer transition-colors ${
                        selectedTemplate === template ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <Badge variant="outline">{template.type}</Badge>
                        </div>
                        {template.description && (
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {template.tasks.length} tasks
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {template.emails.length} emails
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {template.folderName}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              {selectedTemplate ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedTemplate.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedTemplate.description || 'No description provided'}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="tasks">
                        <TabsList>
                          <TabsTrigger value="tasks">
                            Tasks ({selectedTemplate.tasks.length})
                          </TabsTrigger>
                          <TabsTrigger value="emails">
                            Emails ({selectedTemplate.emails.length})
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="tasks" className="mt-4">
                          <ScrollArea className="max-h-64">
                            <div className="space-y-2">
                              {selectedTemplate.tasks.map((task, index) => (
                                <div key={index} className="p-3 border rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">{task.subject}</span>
                                    <div className="flex gap-2">
                                      <Badge variant="outline">{task.taskType}</Badge>
                                      {task.hasEmail && (
                                        <Badge variant="secondary">
                                          <Mail className="h-3 w-3 mr-1" />
                                          Email
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Sort: {task.sortOrder} | Agent Visible: {task.isAgentVisible ? 'Yes' : 'No'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="emails" className="mt-4">
                          <ScrollArea className="max-h-64">
                            <div className="space-y-2">
                              {selectedTemplate.emails.map((email, index) => (
                                <div key={index} className="p-3 border rounded-lg">
                                  <div className="font-medium mb-1">{email.name}</div>
                                  <div className="text-sm text-muted-foreground mb-2">
                                    Subject: {email.subject}
                                  </div>
                                  <div className="text-xs text-muted-foreground space-y-1">
                                    {email.to && <div>To: {email.to}</div>}
                                    {email.cc && <div>CC: {email.cc}</div>}
                                    {email.bcc && <div>BCC: {email.bcc}</div>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  Select a template from the list to view details
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={onConfirmImport} 
              disabled={!canImport || isProcessing}
              className="min-w-32"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Importing...
                </div>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Import Templates
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default XMLImportPreviewDialog;
