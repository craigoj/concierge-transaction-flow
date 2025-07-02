
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const RoleDebugPanel = () => {
  const { data: userInfo, isLoading } = useQuery({
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

      // Test if user can update any transaction
      const { data: testUpdate, error: updateError } = await supabase
        .from('transactions')
        .select('id')
        .limit(1);

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
        updateError,
        testTransactionId: testUpdate?.[0]?.id
      };
    },
  });

  if (isLoading) return <div>Loading role debug info...</div>;
  if (!userInfo) return <div>No user logged in</div>;

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="text-blue-800">Role Debug Information</CardTitle>
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
              <div>
                <p>Role: <Badge variant={userInfo.profile.role === 'coordinator' ? 'default' : 'secondary'}>{userInfo.profile.role}</Badge></p>
                <p>Name: {userInfo.profile.first_name} {userInfo.profile.last_name}</p>
                <p>Invitation Status: {userInfo.profile.invitation_status}</p>
                <p>Admin Activated: {userInfo.profile.admin_activated ? 'Yes' : 'No'}</p>
              </div>
            ) : (
              <Badge variant="destructive">No Profile Found</Badge>
            )}
          </div>

          <div>
            <h4 className="font-semibold">RLS Access Test:</h4>
            <p>Can access all transactions: <Badge variant={userInfo.canAccessAllTransactions ? 'default' : 'destructive'}>{userInfo.canAccessAllTransactions ? 'Yes' : 'No'}</Badge></p>
            <p>Transactions visible: {userInfo.transactionCount}</p>
            {userInfo.allTransError && (
              <p className="text-red-600 text-sm">Error: {userInfo.allTransError.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
