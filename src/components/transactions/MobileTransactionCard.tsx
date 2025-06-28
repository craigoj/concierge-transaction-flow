
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, CheckCircle, ChevronRight } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Transaction = Tables<'transactions'> & {
  clients: Tables<'clients'>[];
  tasks: Tables<'tasks'>[];
};

interface MobileTransactionCardProps {
  transaction: Transaction;
  onTransactionClick: (id: string) => void;
}

const MobileTransactionCard = ({ transaction, onTransactionClick }: MobileTransactionCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'intake':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const completedTasks = transaction.tasks?.filter(task => task.is_completed).length || 0;
  const totalTasks = transaction.tasks?.length || 0;
  const primaryClient = transaction.clients?.[0];
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
      onClick={() => onTransactionClick(transaction.id)}
    >
      <CardContent className="p-4">
        {/* Header with Address and Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-3">
            <h3 className="font-semibold text-base leading-tight mb-1 truncate">
              {transaction.property_address}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {transaction.city}, {transaction.state}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className={`${getStatusColor(transaction.status)} text-xs px-2 py-1`}>
              {transaction.status.toUpperCase()}
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Client and Price Row */}
        <div className="flex items-center justify-between mb-3">
          {primaryClient && (
            <div className="flex items-center text-sm text-muted-foreground min-w-0 flex-1 mr-3">
              <User className="w-3 h-3 mr-2 flex-shrink-0" />
              <span className="truncate">{primaryClient.full_name}</span>
            </div>
          )}
          {transaction.purchase_price && (
            <div className="text-sm font-medium flex-shrink-0">
              ${transaction.purchase_price.toLocaleString()}
            </div>
          )}
        </div>

        {/* Progress Bar and Tasks */}
        {totalTasks > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{completedTasks}/{totalTasks} tasks</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Closing Date */}
        {transaction.closing_date && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 mr-2" />
            <span>Closes {new Date(transaction.closing_date).toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileTransactionCard;
