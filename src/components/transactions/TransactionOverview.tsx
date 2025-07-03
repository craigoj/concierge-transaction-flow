
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, DollarSign, User } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import TransactionReassignButton from './TransactionReassignButton';

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  clients: Database['public']['Tables']['clients']['Row'][];
};

interface TransactionOverviewProps {
  transaction: Transaction;
  onUpdate?: () => void;
}

const TransactionOverview: React.FC<TransactionOverviewProps> = ({ 
  transaction, 
  onUpdate 
}) => {
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

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const primaryClient = transaction.clients?.[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Transaction Overview
          </CardTitle>
          <TransactionReassignButton
            transaction={transaction}
            onReassignSuccess={onUpdate}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Property Information */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Property Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Address</label>
              <p className="font-medium">{transaction.property_address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Location</label>
              <p className="font-medium">
                {transaction.city}, {transaction.state} {transaction.zip_code}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Transaction Status and Type */}
        <div>
          <h3 className="text-lg font-medium mb-3">Status & Type</h3>
          <div className="flex flex-wrap gap-3">
            <Badge className={`${getStatusColor(transaction.status)} font-medium px-3 py-1 border`}>
              {transaction.status.toUpperCase()}
            </Badge>
            {transaction.transaction_type && (
              <Badge variant="outline" className="font-medium px-3 py-1">
                {transaction.transaction_type.toUpperCase()}
              </Badge>
            )}
            {transaction.service_tier && (
              <Badge variant="secondary" className="font-medium px-3 py-1">
                {transaction.service_tier.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Financial Information */}
        {transaction.purchase_price && (
          <>
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Financial Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Purchase Price</label>
                  <p className="font-medium text-lg">
                    {formatCurrency(transaction.purchase_price)}
                  </p>
                </div>
                {transaction.commission_rate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Commission Rate</label>
                    <p className="font-medium">{transaction.commission_rate}%</p>
                  </div>
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Timeline */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Timeline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="font-medium">
                {new Date(transaction.created_at).toLocaleDateString()}
              </p>
            </div>
            {transaction.closing_date && (
              <div>
                <label className="text-sm font-medium text-gray-500">Closing Date</label>
                <p className="font-medium">
                  {new Date(transaction.closing_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Client Information */}
        {primaryClient && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Client Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="font-medium">{primaryClient.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="font-medium capitalize">{primaryClient.type}</p>
                </div>
                {primaryClient.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="font-medium">{primaryClient.email}</p>
                  </div>
                )}
                {primaryClient.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="font-medium">{primaryClient.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionOverview;
