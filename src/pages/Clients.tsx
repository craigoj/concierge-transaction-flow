
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users, Phone, Mail, Filter, Download, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Breadcrumb from '@/components/navigation/Breadcrumb';

const Clients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          transactions (
            id,
            property_address,
            status,
            closing_date
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredClients = clients?.filter(client => {
    const matchesSearch = client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || client.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getClientTypeColor = (type: string) => {
    return type === 'buyer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <Breadcrumb />
        </div>
        <div className="mb-12">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-brand-taupe/20 rounded-xl w-1/3"></div>
            <div className="h-6 bg-brand-taupe/20 rounded-lg w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-8">
        <Breadcrumb />
      </div>

      {/* Premium Header Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider uppercase mb-4">
              Clients
            </h1>
            <p className="text-lg font-brand-body text-brand-charcoal/70 max-w-2xl">
              Manage your client relationships with precision and care
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm border-brand-taupe/30 hover:bg-brand-taupe/10 rounded-xl">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white/90 backdrop-blur-sm border-brand-taupe/20 shadow-brand-elevation">
                <DropdownMenuItem onClick={() => navigate('/clients/import')} className="font-brand-body">
                  <Download className="h-4 w-4 mr-2" />
                  Import Clients
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.print()} className="font-brand-body">
                  <Download className="h-4 w-4 mr-2" />
                  Export List
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/clients/bulk-actions')} className="font-brand-body">
                  Bulk Actions
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              onClick={() => navigate('/clients/new')}
              className="bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide px-8 py-4 rounded-xl shadow-brand-subtle hover:shadow-brand-elevation transition-all duration-300 gap-3"
              size="lg"
            >
              <Plus className="h-5 w-5" />
              NEW CLIENT
            </Button>
          </div>
        </div>
        <div className="w-24 h-px bg-brand-taupe"></div>
      </div>

      {/* Enhanced Filters and Search */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-taupe h-4 w-4" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-brand-taupe/30 rounded-xl"
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48 bg-white/80 backdrop-blur-sm border-brand-taupe/30 rounded-xl">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-white/90 backdrop-blur-sm border-brand-taupe/20">
            <SelectItem value="all">All Clients</SelectItem>
            <SelectItem value="buyer">Buyers</SelectItem>
            <SelectItem value="seller">Sellers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Client Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-brand-elevation transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-brand-body text-brand-charcoal/60 mb-2">Total Clients</p>
                <p className="text-3xl font-brand-heading font-bold text-brand-charcoal tracking-wide">{clients?.length || 0}</p>
              </div>
              <div className="w-16 h-16 bg-brand-taupe/20 rounded-2xl flex items-center justify-center">
                <Users className="h-8 w-8 text-brand-taupe" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-brand-elevation transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-brand-body text-brand-charcoal/60 mb-2">Buyers</p>
                <p className="text-3xl font-brand-heading font-bold text-brand-charcoal tracking-wide">
                  {clients?.filter(c => c.type === 'buyer').length || 0}
                </p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Badge className="bg-blue-500 text-white text-lg font-brand-heading">B</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-brand-elevation transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-brand-body text-brand-charcoal/60 mb-2">Sellers</p>
                <p className="text-3xl font-brand-heading font-bold text-brand-charcoal tracking-wide">
                  {clients?.filter(c => c.type === 'seller').length || 0}
                </p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <Badge className="bg-green-500 text-white text-lg font-brand-heading">S</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      {filteredClients && filteredClients.length > 0 ? (
        <div className="grid gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-brand-elevation transition-all duration-300 cursor-pointer group" onClick={() => navigate(`/clients/${client.id}`)}>
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-16 w-16 shadow-brand-subtle">
                      <AvatarFallback className="bg-brand-charcoal text-brand-background text-lg font-brand-heading">
                        {getInitials(client.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-brand-heading font-semibold text-brand-charcoal tracking-wide uppercase mb-2">{client.full_name}</h3>
                      <div className="flex items-center space-x-6 text-sm font-brand-body text-brand-charcoal/70">
                        {client.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-brand-taupe" />
                            <span>{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-brand-taupe" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={`${getClientTypeColor(client.type)} font-brand-heading tracking-wide text-xs px-4 py-2 border`}>
                      {client.type.toUpperCase()}
                    </Badge>
                    {client.transactions && (
                      <div className="text-right">
                        <p className="text-sm font-brand-heading font-medium text-brand-charcoal tracking-wide">
                          {client.transactions.property_address}
                        </p>
                        <p className="text-xs font-brand-body text-brand-charcoal/60 uppercase tracking-wide">
                          Status: {client.transactions.status}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-brand-taupe/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Users className="h-12 w-12 text-brand-taupe" />
            </div>
            <h3 className="text-2xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase mb-4">
              {searchTerm ? 'No Clients Found' : 'No Clients Yet'}
            </h3>
            <p className="text-lg font-brand-body text-brand-charcoal/60 mb-8">
              {searchTerm ? 'Try adjusting your search terms to find what you\'re looking for' : 'Create your first client to begin building exceptional relationships'}
            </p>
            <Button 
              onClick={() => navigate('/clients/new')}
              className="bg-brand-charcoal hover:bg-brand-taupe-dark text-brand-background font-brand-heading tracking-wide px-8 py-3 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              ADD CLIENT
            </Button>
            <div className="w-16 h-px bg-brand-taupe mx-auto mt-8"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
