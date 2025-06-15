
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Calendar, AlertCircle } from 'lucide-react';

interface PremiumDashboardMetricsProps {
  activeTransactions: number;
  closingThisWeek: number;
  actionRequired: number;
  isLoading: boolean;
}

const PremiumDashboardMetrics = ({
  activeTransactions,
  closingThisWeek,
  actionRequired,
  isLoading
}: PremiumDashboardMetricsProps) => {
  const metrics = [
    {
      title: 'Active Transactions',
      value: activeTransactions,
      icon: FileText,
      color: 'text-brand-charcoal',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Closing This Week',
      value: closingThisWeek,
      icon: Calendar,
      color: 'text-brand-charcoal',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Action Required',
      value: actionRequired,
      icon: AlertCircle,
      color: actionRequired > 0 ? 'text-amber-700' : 'text-brand-charcoal',
      bgColor: actionRequired > 0 ? 'bg-gradient-to-br from-amber-50 to-amber-100/50' : 'bg-gradient-to-br from-gray-50 to-gray-100/50',
      iconBg: actionRequired > 0 ? 'bg-amber-100' : 'bg-gray-100',
      iconColor: actionRequired > 0 ? 'text-amber-600' : 'text-gray-600',
      highlight: actionRequired > 0
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      {metrics.map((metric, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="group"
        >
          <Card
            className={`border-brand-taupe/20 shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-500 overflow-hidden relative ${
              metric.highlight ? 'ring-1 ring-amber-200' : ''
            }`}
          >
            <div className={`absolute inset-0 ${metric.bgColor} opacity-60`} />
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/20 to-transparent rounded-full transform translate-x-8 -translate-y-8" />
            
            <CardContent className="p-10 text-center relative">
              <motion.div 
                className="flex items-center justify-center mb-6"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${metric.iconBg} shadow-sm`}>
                  <metric.icon className={`h-8 w-8 ${metric.iconColor}`} />
                </div>
              </motion.div>
              
              <motion.div 
                className={`text-5xl font-brand-heading font-bold mb-4 ${metric.color}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
              >
                {isLoading ? (
                  <div className="w-12 h-12 mx-auto bg-brand-taupe/20 rounded animate-pulse" />
                ) : (
                  metric.value
                )}
              </motion.div>
              
              <p className="text-brand-charcoal/70 font-brand-heading text-sm uppercase tracking-brand-wide">
                {metric.title}
              </p>
              
              {metric.highlight && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 pt-4 border-t border-amber-200/50"
                >
                  <p className="text-amber-600 text-xs font-brand-body italic">
                    Requires your attention
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default PremiumDashboardMetrics;
