
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';

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

interface XMLImportProgressDialogProps {
  open: boolean;
  progress: ImportProgress;
}

const XMLImportProgressDialog = ({ open, progress }: XMLImportProgressDialogProps) => {
  const getStageIcon = (stage: string, isActive: boolean, isCompleted: boolean) => {
    if (stage === 'error') {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (isCompleted) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (isActive) {
      return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
    }
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'parsing': return 'Parsing XML';
      case 'validating': return 'Validating Data';
      case 'importing': return 'Importing Templates';
      case 'completed': return 'Import Complete';
      case 'error': return 'Import Failed';
      default: return stage;
    }
  };

  const stages = ['parsing', 'validating', 'importing', 'completed'];
  const currentStageIndex = stages.indexOf(progress.stage);

  const getOverallProgress = () => {
    if (progress.stage === 'error') return 0;
    if (progress.stage === 'completed') return 100;
    if (progress.stage === 'parsing') return 10;
    if (progress.stage === 'validating') return 25;
    
    // During importing, calculate based on actual progress
    const templateProgress = progress.totalTemplates > 0 
      ? (progress.templatesProcessed / progress.totalTemplates) * 100 
      : 0;
    return 25 + (templateProgress * 0.75); // 25% base + 75% for importing
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Importing XML Templates</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(getOverallProgress())}%</span>
            </div>
            <Progress value={getOverallProgress()} className="w-full" />
          </div>

          {/* Current Stage */}
          <div className="space-y-3">
            <div className="font-medium">Current Stage</div>
            {stages.map((stage, index) => (
              <div
                key={stage}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  stage === progress.stage 
                    ? 'bg-blue-50 border border-blue-200' 
                    : index < currentStageIndex 
                    ? 'bg-green-50' 
                    : 'bg-gray-50'
                }`}
              >
                {getStageIcon(
                  stage,
                  stage === progress.stage,
                  index < currentStageIndex || progress.stage === 'completed'
                )}
                <span className={`${
                  stage === progress.stage ? 'font-medium' : ''
                }`}>
                  {getStageLabel(stage)}
                </span>
                {stage === progress.stage && (
                  <Badge variant="secondary" className="ml-auto">
                    Active
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {/* Detailed Progress */}
          {progress.stage === 'importing' && (
            <div className="space-y-4">
              <div className="font-medium">Import Progress</div>
              
              {progress.currentTemplate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Processing: {progress.currentTemplate}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-lg font-bold text-blue-600">
                    {progress.templatesProcessed}/{progress.totalTemplates}
                  </div>
                  <div className="text-xs text-muted-foreground">Templates</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-green-600">
                    {progress.tasksProcessed}/{progress.totalTasks}
                  </div>
                  <div className="text-xs text-muted-foreground">Tasks</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-purple-600">
                    {progress.emailsProcessed}/{progress.totalEmails}
                  </div>
                  <div className="text-xs text-muted-foreground">Emails</div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {progress.stage === 'error' && progress.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                <AlertCircle className="h-4 w-4" />
                Import Failed
              </div>
              <div className="text-sm text-red-600">{progress.error}</div>
            </div>
          )}

          {/* Success Display */}
          {progress.stage === 'completed' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="font-medium text-green-700 mb-1">Import Successful!</div>
              <div className="text-sm text-green-600">
                Imported {progress.templatesProcessed} templates with {progress.tasksProcessed} tasks and {progress.emailsProcessed} email templates.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default XMLImportProgressDialog;
