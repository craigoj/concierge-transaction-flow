
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Search } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AgentSelectorProps {
  selectedAgentId?: string | null;
  onAgentSelect: (agentId: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  currentUserId?: string;
  showCurrentUserFirst?: boolean;
}

export const AgentSelector = ({
  selectedAgentId,
  onAgentSelect,
  label = "Assigned Agent",
  placeholder = "Select an agent...",
  disabled = false,
  allowClear = false,
  currentUserId,
  showCurrentUserFirst = true
}: AgentSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents', searchTerm],
    queryFn: async (): Promise<Profile[]> => {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'agent')
        .order('first_name', { ascending: true });

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Sort to show current user first if requested
      if (showCurrentUserFirst && currentUserId) {
        return data?.sort((a, b) => {
          if (a.id === currentUserId) return -1;
          if (b.id === currentUserId) return 1;
          return 0;
        }) || [];
      }

      return data || [];
    },
  });

  const selectedAgent = agents?.find(agent => agent.id === selectedAgentId);

  const formatAgentName = (agent: Profile) => {
    const name = `${agent.first_name || ''} ${agent.last_name || ''}`.trim();
    const display = name || agent.email || 'Unknown Agent';
    
    if (agent.id === currentUserId) {
      return `${display} (You)`;
    }
    return display;
  };

  const formatAgentDetails = (agent: Profile) => {
    const parts = [];
    if (agent.email) parts.push(agent.email);
    if (agent.brokerage) parts.push(agent.brokerage);
    return parts.join(' • ');
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      <Select 
        value={selectedAgentId || ''} 
        onValueChange={onAgentSelect}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder}>
            {selectedAgent && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col text-left">
                  <span className="font-medium">
                    {formatAgentName(selectedAgent)}
                  </span>
                  {formatAgentDetails(selectedAgent) && (
                    <span className="text-xs text-muted-foreground">
                      {formatAgentDetails(selectedAgent)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent>
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          {allowClear && selectedAgentId && (
            <SelectItem value="">
              <span className="text-muted-foreground">Clear selection</span>
            </SelectItem>
          )}
          
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading agents...
            </div>
          ) : agents && agents.length > 0 ? (
            agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                <div className="flex items-center gap-3 w-full">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium truncate">
                      {formatAgentName(agent)}
                    </span>
                    {formatAgentDetails(agent) && (
                      <span className="text-xs text-muted-foreground truncate">
                        {formatAgentDetails(agent)}
                      </span>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              {searchTerm ? 'No agents found matching search' : 'No agents available'}
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
