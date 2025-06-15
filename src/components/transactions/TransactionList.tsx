
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, FileText, CheckCircle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { Skeleton } from '@/components/ui/skeleton';

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
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'intake':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceTierDisplay = (tier: string | null) => {
    if (!tier) return 'Standard';
    return tier.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-64">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No transactions found</h3>
        <p className="text-muted-foreground">Create your first transaction to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {transactions.map((transaction) => {
        const completedTasks = transaction.tasks?.filter(task => task.is_completed).length || 0;
        const totalTasks = transaction.tasks?.length || 0;
        const primaryClient = transaction.clients?.[0];

        return (
          <Card key={transaction.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
                  {transaction.property_address}
                </CardTitle>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className={getStatusColor(transaction.status)}>
                  {transaction.status.toUpperCase()}
                </Badge>
                {transaction.transaction_type && (
                  <Badge variant="outline">
                    {transaction.transaction_type.toUpperCase()}
                  </Badge>
                )}
                {transaction.service_tier && (
                  <Badge variant="secondary" className="text-xs">
                    {getServiceTierDisplay(transaction.service_tier)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  {transaction.city}, {transaction.state} {transaction.zip_code}
                </span>
              </div>

              {primaryClient && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{primaryClient.full_name}</span>
                </div>
              )}

              {transaction.closing_date && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Closes {new Date(transaction.closing_date).toLocaleDateString()}</span>
                </div>
              )}

              {totalTasks > 0 && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Tasks: {completedTasks}/{totalTasks} completed</span>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onTransactionClick(transaction.id)}
                >
                  View Details
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
