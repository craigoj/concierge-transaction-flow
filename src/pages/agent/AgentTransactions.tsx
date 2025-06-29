
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, Calendar, DollarSign, MapPin, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import Breadcrumb from '@/components/navigation/Breadcrumb';

const AgentTransactions = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['agent-transactions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          clients (*)
        `)
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const filteredTransactions = transactions?.filter(transaction =>
    transaction.property_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.clients?.some(client => 
      client.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'intake': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <Breadcrumb />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-brand-taupe/10 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <Breadcrumb />
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-brand-heading font-bold text-brand-charcoal tracking-wide">
              My Transactions
            </h1>
            <p className="text-brand-charcoal/60 font-brand-body mt-2">
              Manage your active and completed transactions
            </p>
          </div>
          <Button 
            onClick={() => navigate('/transactions/new')}
            className="bg-brand-charcoal hover:bg-brand-taupe-dark text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-charcoal/40" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length > 0 ? (
        <div className="grid gap-6">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/agent/transactions/${transaction.id}`)}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-brand-heading font-semibold text-brand-charcoal flex items-center gap-2">
                          <Building className="h-5 w-5" />
                          {transaction.property_address}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-brand-charcoal/60">
                          <MapPin className="h-4 w-4" />
                          {transaction.city}, {transaction.state} {transaction.zip_code}
                        </div>
                      </div>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-brand-charcoal/50" />
                        <span className="font-brand-body">
                          {transaction.purchase_price 
                            ? `$${transaction.purchase_price.toLocaleString()}` 
                            : 'Price TBD'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-brand-charcoal/50" />
                        <span className="font-brand-body">
                          {transaction.closing_date 
                            ? new Date(transaction.closing_date).toLocaleDateString()
                            : 'Closing TBD'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-brand-body text-brand-charcoal/70">
                          Client: {transaction.clients?.[0]?.full_name || 'TBD'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-16 w-16 text-brand-taupe/40 mx-auto mb-4" />
            <h3 className="text-xl font-brand-heading text-brand-charcoal mb-2">
              No Transactions Found
            </h3>
            <p className="text-brand-charcoal/60 font-brand-body mb-6">
              {searchTerm ? 'No transactions match your search.' : 'You haven\'t created any transactions yet.'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => navigate('/transactions/new')}
                className="bg-brand-charcoal hover:bg-brand-taupe-dark text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Transaction
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentTransactions;
