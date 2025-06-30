
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';

interface ValidationMetrics {
  totalValidations: number;
  successRate: number;
  averageValidationTime: number;
  errorsByField: Record<string, number>;
  validationsByHour: Array<{ hour: number; count: number }>;
  securityEvents: number;
  rateLimitEvents: number;
  cacheHitRate: number;
}

interface FormAnalytics {
  formId: string;
  formName: string;
  completionRate: number;
  averageCompletionTime: number;
  dropOffPoints: Array<{ field: string; dropOffRate: number }>;
  popularErrors: Array<{ error: string; count: number }>;
}

export const ValidationAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ValidationMetrics | null>(null);
  const [formAnalytics, setFormAnalytics] = useState<FormAnalytics[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics();
    }
  }, [user?.id, selectedTimeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // This would connect to actual analytics tables in a real implementation
      // For now, we'll use mock data to demonstrate the UI
      const mockMetrics: ValidationMetrics = {
        totalValidations: 1247,
        successRate: 0.87,
        averageValidationTime: 340,
        errorsByField: {
          'email': 45,
          'phone': 32,
          'purchase_price': 28,
          'property_address': 19,
          'closing_date': 15
        },
        validationsByHour: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: Math.floor(Math.random() * 50) + 10
        })),
        securityEvents: 8,
        rateLimitEvents: 12,
        cacheHitRate: 0.78
      };

      const mockFormAnalytics: FormAnalytics[] = [
        {
          formId: 'offer-drafting',
          formName: 'Offer Drafting',
          completionRate: 0.82,
          averageCompletionTime: 420000, // 7 minutes
          dropOffPoints: [
            { field: 'purchase_price', dropOffRate: 0.15 },
            { field: 'closing_date', dropOffRate: 0.12 },
            { field: 'financing_details', dropOffRate: 0.08 }
          ],
          popularErrors: [
            { error: 'Invalid email format', count: 34 },
            { error: 'Purchase price required', count: 28 },
            { error: 'Future date required', count: 22 }
          ]
        },
        {
          formId: 'agent-intake',
          formName: 'Agent Intake',
          completionRate: 0.94,
          averageCompletionTime: 680000, // 11 minutes
          dropOffPoints: [
            { field: 'vendor_preferences', dropOffRate: 0.08 },
            { field: 'branding_preferences', dropOffRate: 0.05 }
          ],
          popularErrors: [
            { error: 'Company name required', count: 18 },
            { error: 'Invalid phone format', count: 15 }
          ]
        }
      ];

      setMetrics(mockMetrics);
      setFormAnalytics(mockFormAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  if (loading || !metrics) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider uppercase">
          Validation Analytics
        </h1>
        <div className="flex gap-2">
          {['1h', '24h', '7d', '30d'].map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Validations</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalValidations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(metrics.successRate)}</div>
            <Progress value={metrics.successRate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(metrics.averageValidationTime)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1 text-green-500" />
              -8% improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(metrics.cacheHitRate)}</div>
            <Badge variant="outline" className="mt-2">
              {metrics.securityEvents} security events
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
          <TabsTrigger value="forms">Form Performance</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Validations by Hour</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.validationsByHour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Errors by Field</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(metrics.errorsByField).map(([field, count]) => ({ field, count }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="field" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ff7300" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forms" className="space-y-4">
          <div className="grid gap-6">
            {formAnalytics.map((form) => (
              <Card key={form.formId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {form.formName}
                    <Badge variant={form.completionRate > 0.8 ? 'default' : 'secondary'}>
                      {formatPercent(form.completionRate)} completion
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Drop-off Points</h4>
                      <div className="space-y-2">
                        {form.dropOffPoints.map((point) => (
                          <div key={point.field} className="flex items-center justify-between">
                            <span className="text-sm">{point.field}</span>
                            <Badge variant="outline">{formatPercent(point.dropOffRate)}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Popular Errors</h4>
                      <div className="space-y-2">
                        {form.popularErrors.map((error) => (
                          <div key={error.error} className="flex items-center justify-between">
                            <span className="text-sm">{error.error}</span>
                            <Badge variant="outline">{error.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Rate Limit Violations</span>
                    <Badge variant="destructive">{metrics.rateLimitEvents}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Suspicious Patterns</span>
                    <Badge variant="secondary">{metrics.securityEvents}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Failed Authentication</span>
                    <Badge variant="outline">3</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Validation Security Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">94</div>
                  <p className="text-sm text-muted-foreground">Overall Security Score</p>
                  <Progress value={94} className="mt-4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
