
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CreateAgentDialog } from './CreateAgentDialog';
import type { AgentData, AgentListError } from '@/types';

export const AgentsList = () => {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AgentListError | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setAgents(data as AgentData[]);
    } catch (err) {
      console.error('Error fetching agents:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch agents';
      
      setError({
        message: errorMessage,
        type: err instanceof Error && err.message.includes('network') ? 'network_error' : 'fetch_error',
        details: { timestamp: new Date().toISOString() }
      });
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies needed for this callback

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]); // Added fetchAgents to dependencies

  const handleAgentCreated = useCallback(() => {
    setShowCreateDialog(false);
    fetchAgents();
  }, [fetchAgents]); // Added fetchAgents to dependencies

  const getInitials = (firstName?: string, lastName?: string): string => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || '?';
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'coordinator':
        return 'bg-blue-100 text-blue-800';
      case 'agent':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600 mb-4">Error: {error.message}</p>
          <Button onClick={fetchAgents} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-brand-charcoal">Agents</h2>
          <p className="text-brand-charcoal/60">Manage your team members and their access</p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-brand-charcoal hover:bg-brand-charcoal/90"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Agent
        </Button>
      </div>

      {agents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No agents yet</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first team member</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              Add Agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={agent.profile_image_url} />
                      <AvatarFallback className="bg-brand-taupe text-brand-charcoal">
                        {getInitials(agent.first_name, agent.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {agent.first_name} {agent.last_name}
                      </CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge className={getRoleColor(agent.role)}>
                          {agent.role}
                        </Badge>
                        {agent.invitation_status && (
                          <Badge className={getStatusColor(agent.invitation_status)}>
                            {agent.invitation_status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {agent.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{agent.email}</span>
                  </div>
                )}
                
                {agent.phone_number && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{agent.phone_number}</span>
                  </div>
                )}
                
                {agent.brokerage && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{agent.brokerage}</span>
                  </div>
                )}
                
                {agent.years_experience && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{agent.years_experience} years experience</span>
                  </div>
                )}

                {agent.specialties && agent.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {agent.specialties.slice(0, 3).map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {agent.specialties.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{agent.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateAgentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onAgentCreated={handleAgentCreated}
      />
    </div>
  );
};
