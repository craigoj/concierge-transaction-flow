
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Building,
  MapPin,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/components/navigation/Breadcrumb';

const AgentClients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: clients, isLoading } = useQuery({
    queryKey: ['agent-clients'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          transactions!inner (
            id,
            property_address,
            agent_id,
            status
          )
        `)
        .eq('transactions.agent_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const filteredClients = clients?.filter(client =>
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getClientTypeColor = (type: string) => {
    switch (type) {
      case 'buyer': return 'bg-blue-100 text-blue-800';
      case 'seller': return 'bg-green-100 text-green-800';
      case 'both': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <Breadcrumb />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-brand-taupe/10 rounded-lg animate-pulse" />
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
              My Clients
            </h1>
            <p className="text-brand-charcoal/60 font-brand-body mt-2">
              Manage your client relationships and contact information
            </p>
          </div>
          <Button 
            onClick={() => navigate('/clients/new')}
            className="bg-brand-charcoal hover:bg-brand-taupe-dark text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-charcoal/40" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/clients/${client.id}`)}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-brand-taupe/20 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-brand-charcoal/60" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-brand-heading text-brand-charcoal">
                        {client.full_name}
                      </CardTitle>
                      <Badge className={getClientTypeColor(client.type)}>
                        {client.type?.toUpperCase() || 'CLIENT'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-brand-charcoal/70">
                    <Mail className="h-4 w-4" />
                    <span className="font-brand-body truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-brand-charcoal/70">
                    <Phone className="h-4 w-4" />
                    <span className="font-brand-body">{client.phone}</span>
                  </div>
                )}
                {client.transactions && (
                  <div className="flex items-center gap-2 text-sm text-brand-charcoal/70">
                    <Building className="h-4 w-4" />
                    <span className="font-brand-body truncate">
                      {client.transactions.property_address}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-brand-charcoal/50">
                  <Calendar className="h-4 w-4" />
                  <span className="font-brand-body">
                    Added {new Date(client.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-brand-taupe/40 mx-auto mb-4" />
            <h3 className="text-xl font-brand-heading text-brand-charcoal mb-2">
              No Clients Found
            </h3>
            <p className="text-brand-charcoal/60 font-brand-body mb-6">
              {searchTerm ? 'No clients match your search.' : 'You haven\'t added any clients yet.'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => navigate('/clients/new')}
                className="bg-brand-charcoal hover:bg-brand-taupe-dark text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Client
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentClients;
