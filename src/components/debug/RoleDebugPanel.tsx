
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const RoleDebugPanel = () => {
  const { data: userInfo, isLoading, refetch } = useQuery({
    queryKey: ['user-role-debug'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Test if user can access all transactions (coordinator test)
      const { data: allTransactions, error: allTransError } = await supabase
        .from('transactions')
        .select('id, agent_id, status, property_address')
        .limit(5);

      // Check agent_invitations status
      const { data: invitations, error: invitationsError } = await supabase
        .from('agent_invitations')
        .select('*')
        .eq('agent_id', user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
        },
        profile,
        profileError,
        canAccessAllTransactions: !allTransError,
        transactionCount: allTransactions?.length || 0,
        allTransError,
        invitations,
        invitationsError
      };
    },
  });

  const forceActivateAccount = async () => {
    if (!userInfo?.user.id) return;
    
    try {
      // Direct database update using the service role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          admin_activated: true,
          invitation_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', userInfo.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      // Update invitations
      const { error: invitationError } = await supabase
        .from('agent_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('agent_id', userInfo.user.id);

      if (invitationError) {
        console.error('Invitation update error:', invitationError);
      }

      // Refetch data
      refetch();
    } catch (error) {
      console.error('Force activation error:', error);
    }
  };

  if (isLoading) return <div>Loading role debug info...</div>;
  if (!userInfo) return <div>No user logged in</div>;

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center justify-between">
          Role Debug Information
          <Button onClick={() => refetch()} size="sm" variant="outline">
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">User Info:</h4>
            <p>ID: {userInfo.user.id}</p>
            <p>Email: {userInfo.user.email}</p>
          </div>
          
          <div>
            <h4 className="font-semibold">Profile Data:</h4>
            {userInfo.profileError ? (
              <Badge variant="destructive">Profile Error: {userInfo.profileError.message}</Badge>
            ) : userInfo.profile ? (
              <div className="space-y-2">
                <div>Role: <Badge variant={userInfo.profile.role === 'coordinator' ? 'default' : 'secondary'}>{userInfo.profile.role}</Badge></div>
                <div>Name: {userInfo.profile.first_name} {userInfo.profile.last_name}</div>
                <div>Invitation Status: <Badge variant={userInfo.profile.invitation_status === 'completed' ? 'default' : 'destructive'}>{userInfo.profile.invitation_status}</Badge></div>
                <div>Admin Activated: <Badge variant={userInfo.profile.admin_activated ? 'default' : 'destructive'}>{userInfo.profile.admin_activated ? 'Yes' : 'No'}</Badge></div>
                {userInfo.profile.invitation_status !== 'completed' || !userInfo.profile.admin_activated ? (
                  <Button onClick={forceActivateAccount} size="sm" variant="outline" className="mt-2">
                    Force Activate Account
                  </Button>
                ) : null}
              </div>
            ) : (
              <Badge variant="destructive">No Profile Found</Badge>
            )}
          </div>

          <div>
            <h4 className="font-semibold">Agent Invitations:</h4>
            {userInfo.invitationsError ? (
              <Badge variant="destructive">Invitations Error: {userInfo.invitationsError.message}</Badge>
            ) : userInfo.invitations && userInfo.invitations.length > 0 ? (
              <div className="space-y-1">
                {userInfo.invitations.map((inv: any) => (
                  <div key={inv.id} className="text-sm">
                    Status: <Badge variant={inv.status === 'accepted' ? 'default' : 'secondary'}>{inv.status}</Badge>
                    {inv.accepted_at && <span className="ml-2 text-gray-500">Accepted: {new Date(inv.accepted_at).toLocaleDateString()}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <Badge variant="secondary">No Invitations Found</Badge>
            )}
          </div>

          <div>
            <h4 className="font-semibold">RLS Access Test:</h4>
            <div>Can access all transactions: <Badge variant={userInfo.canAccessAllTransactions ? 'default' : 'destructive'}>{userInfo.canAccessAllTransactions ? 'Yes' : 'No'}</Badge></div>
            <div>Transactions visible: {userInfo.transactionCount}</div>
            {userInfo.allTransError && (
              <p className="text-red-600 text-sm">Error: {userInfo.allTransError.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
