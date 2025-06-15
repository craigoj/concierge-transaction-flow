
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, Progress } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Transaction = Tables<'transactions'> & {
  clients: Tables<'clients'>[];
  tasks: Tables<'tasks'>[];
};

interface LuxuryTransactionCardProps {
  transaction: Transaction;
  onClick: () => void;
}

const LuxuryTransactionCard = ({ transaction, onClick }: LuxuryTransactionCardProps) => {
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
    <Card 
      className="cursor-pointer transition-all duration-300 hover:shadow-brand-elevation hover:-translate-y-1 border-brand-taupe/20 bg-white"
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header with Status Badge */}
        <div className="flex justify-between items-start mb-4">
          <Badge className={`${getStatusColor(transaction.status)} font-brand-heading text-xs px-3 py-1 border`}>
            {transaction.status.toUpperCase()}
          </Badge>
          {transaction.purchase_price && (
            <span className="text-brand-charcoal/60 font-brand-body text-sm">
              ${transaction.purchase_price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Primary Address */}
        <h3 className="text-xl font-brand-heading font-semibold text-brand-charcoal mb-2 leading-tight">
          {transaction.property_address}
        </h3>

        {/* Client Name */}
        {primaryClient && (
          <p className="text-brand-charcoal/70 font-brand-serif text-base mb-4">
            {primaryClient.full_name}
          </p>
        )}

        {/* Key Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-brand-charcoal/60">
            <MapPin className="w-4 h-4 mr-3 text-brand-taupe" />
            <span className="font-brand-body">
              {transaction.city}, {transaction.state} {transaction.zip_code}
            </span>
          </div>

          {transaction.closing_date && (
            <div className="flex items-center text-sm text-brand-charcoal/60">
              <Calendar className="w-4 h-4 mr-3 text-brand-taupe" />
              <span className="font-brand-body">
                Closes {new Date(transaction.closing_date).toLocaleDateString()}
              </span>
            </div>
          )}

          {totalTasks > 0 && (
            <div className="flex items-center text-sm text-brand-charcoal/60">
              <Progress className="w-4 h-4 mr-3 text-brand-taupe" />
              <span className="font-brand-body">
                {completedTasks} of {totalTasks} tasks complete
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-brand-body text-brand-charcoal/50 uppercase tracking-wide">
              Progress
            </span>
            <span className="text-xs font-brand-body text-brand-charcoal/70">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-brand-cream/50 rounded-full h-2">
            <div
              className="bg-brand-taupe h-2 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LuxuryTransactionCard;
