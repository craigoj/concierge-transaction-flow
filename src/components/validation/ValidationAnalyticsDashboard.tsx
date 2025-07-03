import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  FileText,
  Clock,
  Target,
  BarChart3
} from 'lucide-react';

interface ValidationResult {
  total: number;
  passed: number;
  failed: number;
  pending: number;
}

const ValidationAnalyticsDashboard = () => {
  const { user } = useAuth();

  const { data: transactionValidation, isLoading: isTransactionLoading } = useQuery({
    queryKey: ['transaction-validation-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('transactions')
        .select('id, validation_status');

      if (error) {
        console.error('Error fetching transaction validation data:', error);
        throw new Error('Failed to load transaction validation data');
      }

      const total = data.length;
      const passed = data.filter(t => t.validation_status === 'passed').length;
      const failed = data.filter(t => t.validation_status === 'failed').length;
      const pending = data.filter(t => t.validation_status === 'pending').length;

      return { total, passed, failed, pending } as ValidationResult;
    },
    enabled: !!user?.id,
  });

  const { data: documentValidation, isLoading: isDocumentLoading } = useQuery({
    queryKey: ['document-validation-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('documents')
        .select('id, validation_status');

      if (error) {
        console.error('Error fetching document validation data:', error);
        throw new Error('Failed to load document validation data');
      }

      const total = data.length;
      const passed = data.filter(d => d.validation_status === 'passed').length;
      const failed = data.filter(d => d.validation_status === 'failed').length;
      const pending = data.filter(d => d.validation_status === 'pending').length;

      return { total, passed, failed, pending } as ValidationResult;
    },
    enabled: !!user?.id,
  });

  const overallTransactionProgress = transactionValidation ? (transactionValidation.passed / transactionValidation.total) * 100 : 0;
  const overallDocumentProgress = documentValidation ? (documentValidation.passed / documentValidation.total) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Validation Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList>
            <TabsTrigger value="transactions" className="data-[state=active]:text-primary">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:text-primary">
              Documents
            </TabsTrigger>
          </TabsList>
          <TabsContent value="transactions" className="space-y-4">
            {isTransactionLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading transaction validation data...</div>
            ) : transactionValidation ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-white border-border/50 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{transactionValidation.total}</div>
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <FileText className="h-3 w-3" />
                        Total number of transactions
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-border/50 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Passed Validations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{transactionValidation.passed}</div>
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Transactions passing all checks
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-border/50 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Failed Validations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{transactionValidation.failed}</div>
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        Transactions with validation failures
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-border/50 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Pending Validations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{transactionValidation.pending}</div>
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3 text-orange-500" />
                        Transactions awaiting validation
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Overall Transaction Validation Progress</div>
                  <Progress value={overallTransactionProgress} />
                  <div className="text-xs text-muted-foreground">
                    {overallTransactionProgress.toFixed(1)}% of transactions have passed all validations.
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">No transaction validation data available.</div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            {isDocumentLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading document validation data...</div>
            ) : documentValidation ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-white border-border/50 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{documentValidation.total}</div>
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <FileText className="h-3 w-3" />
                        Total number of documents
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-border/50 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Passed Validations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{documentValidation.passed}</div>
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Documents passing all checks
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-border/50 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Failed Validations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{documentValidation.failed}</div>
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        Documents with validation failures
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-border/50 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Pending Validations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{documentValidation.pending}</div>
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3 text-orange-500" />
                        Documents awaiting validation
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Overall Document Validation Progress</div>
                  <Progress value={overallDocumentProgress} />
                  <div className="text-xs text-muted-foreground">
                    {overallDocumentProgress.toFixed(1)}% of documents have passed all validations.
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">No document validation data available.</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ValidationAnalyticsDashboard;
