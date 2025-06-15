
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Calendar, AlertCircle } from 'lucide-react';

interface AgentDashboardMetricsProps {
  activeTransactions: number;
  closingThisWeek: number;
  actionRequired: number;
  isLoading: boolean;
}

const AgentDashboardMetrics = ({
  activeTransactions,
  closingThisWeek,
  actionRequired,
  isLoading
}: AgentDashboardMetricsProps) => {
  const metrics = [
    {
      title: 'Active Transactions',
      value: activeTransactions,
      icon: FileText,
      color: 'text-brand-charcoal'
    },
    {
      title: 'Closing This Week',
      value: closingThisWeek,
      icon: Calendar,
      color: 'text-brand-charcoal'
    },
    {
      title: 'Action Required',
      value: actionRequired,
      icon: AlertCircle,
      color: actionRequired > 0 ? 'text-amber-600' : 'text-brand-charcoal',
      highlight: actionRequired > 0
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <Card
          key={index}
          className={`border-brand-taupe/20 shadow-brand-subtle transition-all duration-300 ${
            metric.highlight ? 'ring-2 ring-amber-200 bg-amber-50/30' : 'bg-white'
          }`}
        >
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                metric.highlight ? 'bg-amber-100' : 'bg-brand-cream'
              }`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
            <div className={`text-4xl font-brand-heading font-bold mb-2 ${metric.color}`}>
              {isLoading ? '-' : metric.value}
            </div>
            <p className="text-brand-charcoal/60 font-brand-body text-sm uppercase tracking-wide">
              {metric.title}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AgentDashboardMetrics;
