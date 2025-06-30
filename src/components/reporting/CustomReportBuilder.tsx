
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Download, 
  Filter, 
  Calendar,
  FileText,
  Settings,
  Play,
  Save
} from 'lucide-react';

interface ReportField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'percentage';
  category: string;
}

const CustomReportBuilder = () => {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [reportName, setReportName] = useState('');
  const [dateRange, setDateRange] = useState('last_30_days');
  const [groupBy, setGroupBy] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});

  const availableFields: ReportField[] = [
    // Transaction fields
    { id: 'property_address', name: 'Property Address', type: 'text', category: 'Transaction' },
    { id: 'purchase_price', name: 'Purchase Price', type: 'currency', category: 'Transaction' },
    { id: 'closing_date', name: 'Closing Date', type: 'date', category: 'Transaction' },
    { id: 'status', name: 'Status', type: 'text', category: 'Transaction' },
    { id: 'service_tier', name: 'Service Tier', type: 'text', category: 'Transaction' },
    { id: 'transaction_type', name: 'Transaction Type', type: 'text', category: 'Transaction' },
    
    // Client fields
    { id: 'client_name', name: 'Client Name', type: 'text', category: 'Client' },
    { id: 'client_type', name: 'Client Type', type: 'text', category: 'Client' },
    { id: 'referral_source', name: 'Referral Source', type: 'text', category: 'Client' },
    
    // Financial fields
    { id: 'commission_rate', name: 'Commission Rate', type: 'percentage', category: 'Financial' },
    { id: 'service_fee', name: 'Service Fee', type: 'currency', category: 'Financial' },
    { id: 'total_commission', name: 'Total Commission', type: 'currency', category: 'Financial' },
    
    // Performance fields
    { id: 'days_to_close', name: 'Days to Close', type: 'number', category: 'Performance' },
    { id: 'task_completion_rate', name: 'Task Completion Rate', type: 'percentage', category: 'Performance' },
    { id: 'client_satisfaction', name: 'Client Satisfaction', type: 'number', category: 'Performance' },
    
    // Geographic fields
    { id: 'city', name: 'City', type: 'text', category: 'Geographic' },
    { id: 'state', name: 'State', type: 'text', category: 'Geographic' },
    { id: 'zip_code', name: 'ZIP Code', type: 'text', category: 'Geographic' },
  ];

  const fieldsByCategory = availableFields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, ReportField[]>);

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const generateReport = () => {
    console.log('Generating report with:', {
      name: reportName,
      fields: selectedFields,
      dateRange,
      groupBy,
      filters
    });
  };

  const saveReport = () => {
    console.log('Saving report template:', reportName);
  };

  const exportReport = (format: 'csv' | 'pdf' | 'excel') => {
    console.log(`Exporting report as ${format}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-charcoal">Custom Report Builder</h2>
          <p className="text-brand-charcoal/60">Create custom reports with your preferred data and formatting</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={saveReport}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
          <Button onClick={generateReport}>
            <Play className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Settings */}
          <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Report Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reportName">Report Name</Label>
                <Input
                  id="reportName"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter report name..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                      <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                      <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                      <SelectItem value="last_year">Last Year</SelectItem>
                      <SelectItem value="year_to_date">Year to Date</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Group By</Label>
                  <Select value={groupBy} onValueChange={setGroupBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grouping..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="quarter">Quarter</SelectItem>
                      <SelectItem value="service_tier">Service Tier</SelectItem>
                      <SelectItem value="city">City</SelectItem>
                      <SelectItem value="transaction_type">Transaction Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Selection */}
          <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Data Fields ({selectedFields.length} selected)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="Transaction" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  {Object.keys(fieldsByCategory).map(category => (
                    <TabsTrigger key={category} value={category} className="text-xs">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(fieldsByCategory).map(([category, fields]) => (
                  <TabsContent key={category} value={category} className="space-y-2">
                    {fields.map(field => (
                      <div key={field.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={field.id}
                          checked={selectedFields.includes(field.id)}
                          onCheckedChange={() => handleFieldToggle(field.id)}
                        />
                        <Label htmlFor={field.id} className="flex-1 text-sm">
                          {field.name}
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {field.type}
                        </Badge>
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview & Actions */}
        <div className="space-y-6">
          {/* Selected Fields Preview */}
          <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
            <CardHeader>
              <CardTitle className="text-sm">Selected Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedFields.length === 0 ? (
                  <p className="text-sm text-gray-500">No fields selected</p>
                ) : (
                  selectedFields.map(fieldId => {
                    const field = availableFields.find(f => f.id === fieldId);
                    return field ? (
                      <div key={fieldId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{field.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleFieldToggle(fieldId)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    ) : null;
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Download className="h-4 w-4" />
                Export Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => exportReport('csv')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => exportReport('excel')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export as Excel
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => exportReport('pdf')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </Button>
            </CardContent>
          </Card>

          {/* Saved Reports */}
          <Card className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
            <CardHeader>
              <CardTitle className="text-sm">Saved Report Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium">Monthly Commission Report</div>
                  <div className="text-xs text-gray-600">Last used: 2 days ago</div>
                </div>
                <div className="p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium">Service Tier Performance</div>
                  <div className="text-xs text-gray-600">Last used: 1 week ago</div>
                </div>
                <div className="p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium">Geographic Analysis</div>
                  <div className="text-xs text-gray-600">Last used: 2 weeks ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomReportBuilder;
