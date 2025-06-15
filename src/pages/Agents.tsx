
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
import AppHeader from '@/components/AppHeader';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import Breadcrumb from '@/components/navigation/Breadcrumb';

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
    return role === 'agent' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-purple-100 text-purple-800 border-purple-200';
  };

  if (isLoading) {
    return (
      <>
        <AppSidebar />
        <SidebarInset className="flex-1">
          <AppHeader />
          <main className="p-8">
            <div className="mb-8">
              <Breadcrumb />
            </div>
            <div className="mb-12">
              <div className="animate-pulse space-y-6">
                <div className="h-12 bg-brand-taupe/20 rounded-xl w-1/3"></div>
                <div className="h-6 bg-brand-taupe/20 rounded-lg w-2/3"></div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </>
    );
  }

  return (
    <>
      <AppSidebar />
      <SidebarInset className="flex-1">
        <AppHeader />
        
        <main className="p-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-8">
            <Breadcrumb />
          </div>

          {/* Premium Header Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-brand-heading font-bold text-brand-charcoal tracking-brand-wider uppercase mb-4">
                  Agent Network
                </h1>
                <p className="text-lg font-brand-body text-brand-charcoal/70 max-w-2xl">
                  Connect with excellence through our professional agent community
                </p>
              </div>
            </div>
            <div className="w-24 h-px bg-brand-taupe"></div>
          </div>

          {/* Search Section */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-taupe h-4 w-4" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur-sm border-brand-taupe/30 rounded-xl"
              />
            </div>
          </div>

          {/* Agents Grid */}
          {filteredAgents && filteredAgents.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredAgents.map((agent) => (
                <Card key={agent.id} className="hover:shadow-brand-elevation transition-all duration-300 cursor-pointer group" onClick={() => navigate(`/agents/${agent.id}`)}>
                  <CardContent className="p-8">
                    <div className="flex items-center space-x-4 mb-6">
                      <Avatar className="h-20 w-20 shadow-brand-subtle">
                        <AvatarImage src={agent.profile_image_url} />
                        <AvatarFallback className="bg-brand-charcoal text-brand-background text-xl font-brand-heading">
                          {getInitials(agent.first_name, agent.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-lg font-brand-heading font-semibold text-brand-charcoal tracking-wide uppercase mb-2">
                          {agent.first_name} {agent.last_name}
                        </h3>
                        <Badge className={`${getRoleColor(agent.role)} font-brand-heading tracking-wide text-xs px-3 py-1 border`}>
                          {agent.role.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm font-brand-body mb-6">
                      {agent.email && (
                        <div className="flex items-center space-x-3 text-brand-charcoal/70">
                          <Mail className="h-4 w-4 text-brand-taupe" />
                          <span>{agent.email}</span>
                        </div>
                      )}
                      {agent.phone_number && (
                        <div className="flex items-center space-x-3 text-brand-charcoal/70">
                          <Phone className="h-4 w-4 text-brand-taupe" />
                          <span>{agent.phone_number}</span>
                        </div>
                      )}
                      {agent.brokerage && (
                        <div className="flex items-center space-x-3 text-brand-charcoal/70">
                          <Building className="h-4 w-4 text-brand-taupe" />
                          <span>{agent.brokerage}</span>
                        </div>
                      )}
                    </div>

                    {agent.specialties && agent.specialties.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm font-brand-heading font-medium text-brand-charcoal tracking-wide uppercase mb-3">Specialties:</p>
                        <div className="flex flex-wrap gap-2">
                          {agent.specialties.slice(0, 3).map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="text-xs font-brand-body">
                              {specialty}
                            </Badge>
                          ))}
                          {agent.specialties.length > 3 && (
                            <Badge variant="secondary" className="text-xs font-brand-body">
                              +{agent.specialties.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-6 border-t border-brand-taupe/30">
                      <div className="flex justify-between text-sm font-brand-body">
                        <span className="text-brand-charcoal/60">Active Transactions</span>
                        <span className="font-medium text-brand-charcoal">
                          {Array.isArray(agent.transactions) ? agent.transactions.length : 0}
                        </span>
                      </div>
                      {agent.years_experience && (
                        <div className="flex justify-between text-sm font-brand-body mt-2">
                          <span className="text-brand-charcoal/60">Experience</span>
                          <span className="font-medium text-brand-charcoal">{agent.years_experience} years</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-brand-taupe/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <UserCheck className="h-12 w-12 text-brand-taupe" />
                </div>
                <h3 className="text-2xl font-brand-heading tracking-brand-wide text-brand-charcoal uppercase mb-4">
                  {searchTerm ? 'No Agents Found' : 'No Agents Yet'}
                </h3>
                <p className="text-lg font-brand-body text-brand-charcoal/60 mb-8">
                  {searchTerm ? 'Try adjusting your search terms to find what you\'re looking for' : 'Your agent network will appear here as you build connections'}
                </p>
                <div className="w-16 h-px bg-brand-taupe mx-auto"></div>
              </div>
            </div>
          )}
        </main>
      </SidebarInset>
    </>
  );
};

export default Agents;
