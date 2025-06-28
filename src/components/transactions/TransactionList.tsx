
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, FileText, CheckCircle, Building } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileTransactionCard from './MobileTransactionCard';

type Transaction = Tables<'transactions'> & {
  clients: Tables<'clients'>[];
  tasks: Tables<'tasks'>[];
};

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  onTransactionClick: (id: string) => void;
}

const TransactionList = ({ transactions, isLoading, onTransactionClick }: TransactionListProps) => {
  const isMobile = useIsMobile();

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

  const getServiceTierDisplay = (tier: string | null) => {
    if (!tier) return 'Standard';
    return tier.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {[...Array(6)].map((_, i) => (
          <Card key={i} className={isMobile ? "h-32" : "h-80"}>
            <CardHeader className={isMobile ? "pb-2" : ""}>
              <Skeleton className="h-6 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                {!isMobile && <Skeleton className="h-4 w-1/2" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 md:py-20">
        <div className="max-w-md mx-auto px-4">
          <div className="w-16 md:w-24 h-16 md:h-24 bg-brand-taupe/20 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8">
            <Building className="h-8 md:h-12 w-8 md:w-12 text-brand-taupe" />
          </div>
          <h3 className="text-xl md:text-2xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase mb-3 md:mb-4">
            No Transactions Found
          </h3>
          <p className="text-base md:text-lg font-brand-body text-brand-charcoal/60 mb-6 md:mb-8">
            Create your first transaction to begin coordinating with excellence
          </p>
          <div className="w-12 md:w-16 h-px bg-brand-taupe mx-auto"></div>
        </div>
      </div>
    );
  }

  // Mobile view - single column with compact cards
  if (isMobile) {
    return (
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <MobileTransactionCard
            key={transaction.id}
            transaction={transaction}
            onTransactionClick={onTransactionClick}
          />
        ))}
      </div>
    );
  }

  // Desktop view - grid layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {transactions.map((transaction) => {
        const completedTasks = transaction.tasks?.filter(task => task.is_completed).length || 0;
        const totalTasks = transaction.tasks?.length || 0;
        const primaryClient = transaction.clients?.[0];

        return (
          <Card key={transaction.id} className="hover:shadow-brand-elevation transition-all duration-300 cursor-pointer group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-4">
                <CardTitle className="text-lg font-brand-heading tracking-wide text-brand-charcoal line-clamp-2 uppercase">
                  {transaction.property_address}
                </CardTitle>
              </div>
              <div className="flex flex-wrap gap-3">
                <Badge className={`${getStatusColor(transaction.status)} font-brand-heading tracking-wide text-xs px-3 py-1 border`}>
                  {transaction.status.toUpperCase()}
                </Badge>
                {transaction.transaction_type && (
                  <Badge variant="outline" className="font-brand-heading tracking-wide text-xs px-3 py-1">
                    {transaction.transaction_type.toUpperCase()}
                  </Badge>
                )}
                {transaction.service_tier && (
                  <Badge variant="secondary" className="font-brand-heading tracking-wide text-xs px-3 py-1">
                    {getServiceTierDisplay(transaction.service_tier)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center text-sm text-brand-charcoal/70 font-brand-body">
                <MapPin className="w-4 h-4 mr-3 flex-shrink-0 text-brand-taupe" />
                <span className="truncate">
                  {transaction.city}, {transaction.state} {transaction.zip_code}
                </span>
              </div>

              {primaryClient && (
                <div className="flex items-center text-sm text-brand-charcoal/70 font-brand-body">
                  <User className="w-4 h-4 mr-3 flex-shrink-0 text-brand-taupe" />
                  <span className="truncate">{primaryClient.full_name}</span>
                </div>
              )}

              {transaction.closing_date && (
                <div className="flex items-center text-sm text-brand-charcoal/70 font-brand-body">
                  <Calendar className="w-4 h-4 mr-3 flex-shrink-0 text-brand-taupe" />
                  <span>Closes {new Date(transaction.closing_date).toLocaleDateString()}</span>
                </div>
              )}

              {totalTasks > 0 && (
                <div className="flex items-center text-sm text-brand-charcoal/70 font-brand-body">
                  <CheckCircle className="w-4 h-4 mr-3 flex-shrink-0 text-brand-taupe" />
                  <span>Tasks: {completedTasks}/{totalTasks} completed</span>
                </div>
              )}

              <div className="pt-4">
                <Button 
                  size="sm" 
                  className="w-full font-brand-heading tracking-wide"
                  onClick={() => onTransactionClick(transaction.id)}
                >
                  VIEW DETAILS
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TransactionList;
