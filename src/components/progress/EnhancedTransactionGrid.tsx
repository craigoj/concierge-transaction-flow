
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  DollarSign,
  MapPin
} from 'lucide-react';

interface Transaction {
  id: string;
  property_address: string;
  city: string;
  state: string;
  purchase_price: number;
  closing_date: string;
  status: string;
  agent_id: string;
}

interface EnhancedTransactionGridProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
  onView?: (transaction: Transaction) => void;
}

const EnhancedTransactionGrid = ({ 
  transactions = [], 
  onEdit, 
  onDelete, 
  onView 
}: EnhancedTransactionGridProps) => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!transactions.length) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-500">Get started by creating your first transaction.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {transaction.property_address}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {transaction.city}, {transaction.state}
                </p>
              </div>
              <Badge className={`ml-2 ${getStatusColor(transaction.status)}`}>
                {transaction.status}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-2" />
                {formatCurrency(transaction.purchase_price)}
              </div>
              
              {transaction.closing_date && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Closes {formatDate(transaction.closing_date)}
                </div>
              )}
              
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                ID: {transaction.id.slice(0, 8)}...
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView?.(transaction)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                {(role === 'coordinator' || transaction.agent_id === user?.id) && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit?.(transaction)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {role === 'coordinator' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete?.(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
              
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EnhancedTransactionGrid;
