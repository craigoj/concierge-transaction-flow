
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Calendar, 
  DollarSign, 
  User, 
  MapPin,
  Phone,
  Mail,
  Edit
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { TransactionReassignButton } from './TransactionReassignButton';

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  clients?: Database['public']['Tables']['clients']['Row'][];
};

interface TransactionOverviewProps {
  transaction: Transaction;
}

const TransactionOverview = ({ transaction }: TransactionOverviewProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'intake': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceTierDisplay = (tier: string | null) => {
    if (!tier) return 'Not Selected';
    
    const tierMap: Record<string, string> = {
      'buyer_core': 'Core Buyer Service',
      'buyer_elite': 'Elite Buyer Service',
      'white_glove_buyer': 'White Glove Buyer',
      'listing_core': 'Core Listing Service',
      'listing_elite': 'Elite Listing Service',
      'white_glove_listing': 'White Glove Listing'
    };
    
    return tierMap[tier] || tier;
  };

  return (
    <div className="space-y-6">
      {/* Property Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Property Details
          </CardTitle>
          <div className="flex gap-2">
            <TransactionReassignButton 
              transaction={transaction}
              onSuccess={() => window.location.reload()}
            />
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Address</h4>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p>{transaction.property_address}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.city}, {transaction.state} {transaction.zip_code}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Transaction Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize">{transaction.transaction_type || 'Not Set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Tier:</span>
                    <span>{getServiceTierDisplay(transaction.service_tier)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Purchase Price</h4>
              <p className="text-2xl font-bold">
                {transaction.purchase_price 
                  ? `$${transaction.purchase_price.toLocaleString()}`
                  : 'TBD'
                }
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Commission Rate</h4>
              <p className="text-2xl font-bold">
                {transaction.commission_rate 
                  ? `${transaction.commission_rate}%`
                  : 'TBD'
                }
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Closing Date</h4>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {transaction.closing_date 
                    ? new Date(transaction.closing_date).toLocaleDateString()
                    : 'TBD'
                  }
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Information */}
      {transaction.clients && transaction.clients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transaction.clients.map((client) => (
                <div key={client.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold">{client.full_name}</h4>
                    <Badge variant="outline">
                      {client.type?.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{client.email}</span>
                      </div>
                    )}
                    
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  {client.notes && (
                    <div className="mt-3">
                      <h5 className="font-medium mb-1">Notes:</h5>
                      <p className="text-sm text-muted-foreground">{client.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TransactionOverview;
