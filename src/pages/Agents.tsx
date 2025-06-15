
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserCheck, Search, Mail, Phone, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Agents = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          transactions!transactions_agent_id_fkey (count)
        `)
        .eq('role', 'agent')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredAgents = agents?.filter(agent =>
    `${agent.first_name} ${agent.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.brokerage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getRoleColor = (role: string) => {
    return role === 'agent' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Agents</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UserCheck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Agent Network</h1>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgents?.map((agent) => (
          <Card key={agent.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/agents/${agent.id}`)}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={agent.profile_image_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {getInitials(agent.first_name, agent.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {agent.first_name} {agent.last_name}
                  </h3>
                  <Badge className={getRoleColor(agent.role)}>
                    {agent.role}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {agent.email && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{agent.email}</span>
                  </div>
                )}
                {agent.phone_number && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{agent.phone_number}</span>
                  </div>
                )}
                {agent.brokerage && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{agent.brokerage}</span>
                  </div>
                )}
              </div>

              {agent.specialties && agent.specialties.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Specialties:</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.specialties.slice(0, 3).map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {agent.specialties.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{agent.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Transactions</span>
                  <span className="font-medium">
                    {Array.isArray(agent.transactions) ? agent.transactions.length : 0}
                  </span>
                </div>
                {agent.years_experience && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-medium">{agent.years_experience} years</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAgents?.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'No agents in the network yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Agents;
