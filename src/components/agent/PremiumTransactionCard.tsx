
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, BarChart3, ArrowRight } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Transaction = Tables<'transactions'> & {
  clients: Tables<'clients'>[];
  tasks: Tables<'tasks'>[];
};

interface PremiumTransactionCardProps {
  transaction: Transaction;
  onClick: () => void;
}

const PremiumTransactionCard = ({ transaction, onClick }: PremiumTransactionCardProps) => {
  const completedTasks = transaction.tasks?.filter(task => task.is_completed).length || 0;
  const totalTasks = transaction.tasks?.length || 0;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const primaryClient = transaction.clients?.[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'intake':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'active':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group"
    >
      <Card 
        className="cursor-pointer transition-all duration-300 ease-out hover:shadow-brand-elevation border-brand-taupe/20 bg-white/90 backdrop-blur-sm overflow-hidden"
        onClick={onClick}
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-cream/0 to-brand-taupe/0 group-hover:from-brand-cream/10 group-hover:to-brand-taupe/5 transition-all duration-500 pointer-events-none" />
        
        <CardContent className="p-8 relative">
          {/* Header with Status Badge */}
          <div className="flex justify-between items-start mb-6">
            <Badge className={`${getStatusColor(transaction.status)} font-brand-heading text-xs px-3 py-1.5 border tracking-brand-wide uppercase transition-all duration-300`}>
              {transaction.status}
            </Badge>
            {transaction.purchase_price && (
              <span className="text-brand-charcoal/60 font-brand-body text-sm">
                ${transaction.purchase_price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Primary Address */}
          <h3 className="text-xl font-brand-heading font-semibold text-brand-charcoal mb-3 leading-tight tracking-wide">
            {transaction.property_address}
          </h3>

          {/* Client Name */}
          {primaryClient && (
            <p className="text-brand-charcoal/70 font-brand-body text-base mb-6 leading-relaxed">
              {primaryClient.full_name}
            </p>
          )}

          {/* Key Details */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center text-sm text-brand-charcoal/60">
              <MapPin className="w-4 h-4 mr-4 text-brand-taupe flex-shrink-0" />
              <span className="font-brand-body">
                {transaction.city}, {transaction.state} {transaction.zip_code}
              </span>
            </div>

            {transaction.closing_date && (
              <div className="flex items-center text-sm text-brand-charcoal/60">
                <Calendar className="w-4 h-4 mr-4 text-brand-taupe flex-shrink-0" />
                <span className="font-brand-body">
                  Closes {new Date(transaction.closing_date).toLocaleDateString()}
                </span>
              </div>
            )}

            {totalTasks > 0 && (
              <div className="flex items-center text-sm text-brand-charcoal/60">
                <BarChart3 className="w-4 h-4 mr-4 text-brand-taupe flex-shrink-0" />
                <span className="font-brand-body">
                  {completedTasks} of {totalTasks} tasks complete
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-brand-heading text-brand-charcoal/50 uppercase tracking-brand-wide">
                Progress
              </span>
              <span className="text-xs font-brand-body text-brand-charcoal/70 font-medium">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-brand-cream/50 rounded-full h-2.5 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-brand-taupe to-brand-taupe-dark h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Hover Action */}
          <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="text-xs font-brand-heading text-brand-taupe uppercase tracking-brand-wide mr-2">
              View Details
            </span>
            <ArrowRight className="w-4 h-4 text-brand-taupe transform group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PremiumTransactionCard;
