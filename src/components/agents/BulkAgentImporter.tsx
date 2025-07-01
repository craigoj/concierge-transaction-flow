
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, FileText, Loader2 } from "lucide-react";

interface BulkAgentImporterProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkAgentImporter = ({ open, onClose, onSuccess }: BulkAgentImporterProps) => {
  const [importMethod, setImportMethod] = useState<'csv' | 'manual'>('csv');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [manualData, setManualData] = useState('');
  const [setupMethod, setSetupMethod] = useState<'email_invitation' | 'manual_creation'>('email_invitation');
  const [sendEmails, setSendEmails] = useState(true);
  const [defaultPassword, setDefaultPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const template = `firstName,lastName,email,phoneNumber,brokerage
John,Doe,john.doe@example.com,555-0123,ABC Realty
Jane,Smith,jane.smith@example.com,555-0124,XYZ Properties`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agent-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCsv = (text: string) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const agent: any = {};
      
      headers.forEach((header, index) => {
        agent[header] = values[index] || '';
      });
      
      return agent;
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
          const parsed = parseCsv(text);
          setCsvData(parsed);
        } catch (error) {
          toast({
            variant: "destructive",
            title: "CSV Parse Error",
            description: "Failed to parse CSV file. Please check the format.",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleManualDataChange = (value: string) => {
    setManualData(value);
    try {
      const parsed = parseCsv(value);
      setCsvData(parsed);
    } catch (error) {
      setCsvData([]);
    }
  };

  const validateAgentData = (agents: any[]) => {
    const errors = [];
    
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      if (!agent.firstName || !agent.lastName || !agent.email) {
        errors.push(`Row ${i + 2}: Missing required fields (firstName, lastName, email)`);
      }
      
      if (agent.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(agent.email)) {
        errors.push(`Row ${i + 2}: Invalid email format`);
      }
    }
    
    return errors;
  };

  const handleImport = async () => {
    if (csvData.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to import",
        description: "Please upload a CSV file or enter manual data.",
      });
      return;
    }

    const validationErrors = validateAgentData(csvData);
    if (validationErrors.length > 0) {
      toast({
        variant: "destructive",
        title: "Validation Errors",
        description: validationErrors.join('\n'),
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-agent-creation', {
        body: {
          agents: csvData.map(agent => ({
            firstName: agent.firstName,
            lastName: agent.lastName,
            email: agent.email,
            phoneNumber: agent.phoneNumber || '',
            brokerage: agent.brokerage || '',
            setupMethod,
          })),
          sendEmails,
          defaultPassword: setupMethod === 'manual_creation' ? defaultPassword : undefined,
        },
      });

      if (error) throw error;

      setImportResults(data);
      
      toast({
        title: "Import completed",
        description: `Successfully imported ${data.summary.successful} agents, ${data.summary.failed} failed.`,
      });

      if (data.summary.successful > 0) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Import failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCsvFile(null);
    setCsvData([]);
    setManualData('');
    setImportResults(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Agent Import</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Import Method Selection */}
          <div className="space-y-3">
            <Label>Import Method</Label>
            <div className="flex space-x-4">
              <Button
                variant={importMethod === 'csv' ? 'default' : 'outline'}
                onClick={() => setImportMethod('csv')}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                CSV Upload
              </Button>
              <Button
                variant={importMethod === 'manual' ? 'default' : 'outline'}
                onClick={() => setImportMethod('manual')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Manual Entry
              </Button>
            </div>
          </div>

          {/* CSV Template Download */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">CSV Template</h4>
                <p className="text-sm text-gray-600">
                  Download the template to ensure proper formatting
                </p>
              </div>
              <Button onClick={downloadTemplate} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>

          {/* Data Input */}
          {importMethod === 'csv' ? (
            <div className="space-y-3">
              <Label htmlFor="csvFile">Upload CSV File</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <Label htmlFor="manualData">Manual CSV Data</Label>
              <Textarea
                id="manualData"
                value={manualData}
                onChange={(e) => handleManualDataChange(e.target.value)}
                placeholder="firstName,lastName,email,phoneNumber,brokerage
John,Doe,john.doe@example.com,555-0123,ABC Realty"
                rows={8}
              />
            </div>
          )}

          {/* Preview */}
          {csvData.length > 0 && (
            <div className="space-y-3">
              <Label>Preview ({csvData.length} agents)</Label>
              <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
                {csvData.slice(0, 5).map((agent, index) => (
                  <div key={index} className="text-sm">
                    {agent.firstName} {agent.lastName} - {agent.email}
                  </div>
                ))}
                {csvData.length > 5 && (
                  <div className="text-sm text-gray-500">
                    ... and {csvData.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Setup Options */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <Label className="text-base font-medium">Setup Options</Label>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="setupMethod">Setup Method</Label>
                <Select value={setupMethod} onValueChange={(value: any) => setSetupMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email_invitation">Email Invitation</SelectItem>
                    <SelectItem value="manual_creation">Manual Creation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="sendEmails"
                  checked={sendEmails}
                  onCheckedChange={setSendEmails}
                />
                <Label htmlFor="sendEmails">Send welcome emails</Label>
              </div>

              {setupMethod === 'manual_creation' && (
                <div>
                  <Label htmlFor="defaultPassword">Default Password (optional)</Label>
                  <Input
                    id="defaultPassword"
                    type="password"
                    value={defaultPassword}
                    onChange={(e) => setDefaultPassword(e.target.value)}
                    placeholder="Leave empty to auto-generate"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Import Results */}
          {importResults && (
            <div className="space-y-3">
              <Label>Import Results</Label>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {importResults.summary.successful}
                    </div>
                    <div className="text-sm text-gray-600">Successful</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600">
                      {importResults.summary.failed}
                    </div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {importResults.summary.total}
                    </div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={resetForm} variant="outline">
              Reset
            </Button>
            <Button
              onClick={handleImport}
              disabled={isLoading || csvData.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                `Import ${csvData.length} Agents`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
