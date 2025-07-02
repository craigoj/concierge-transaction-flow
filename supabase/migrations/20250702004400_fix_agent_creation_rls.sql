
-- Fix RLS policies for agent creation and deletion

-- Update profiles table policies to allow coordinators to create agent profiles
DROP POLICY IF EXISTS "Coordinators can create new agent profiles" ON public.profiles;

CREATE POLICY "Coordinators can manage agent profiles" 
ON public.profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'coordinator'
  )
  OR auth.uid() = id
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'coordinator'
  )
  OR auth.uid() = id
);

-- Allow service role to bypass RLS for agent creation
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Create a simpler RLS policy for service role operations
CREATE POLICY "Service role can manage all profiles"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Update agent_invitations policies
DROP POLICY IF EXISTS "Coordinators can manage agent invitations" ON public.agent_invitations;

CREATE POLICY "Coordinators and service role can manage agent invitations"
ON public.agent_invitations
FOR ALL
TO authenticated, service_role
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'coordinator'
  )
  OR agent_id = auth.uid()
  OR auth.role() = 'service_role'
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'coordinator'
  )
  OR agent_id = auth.uid()
  OR auth.role() = 'service_role'
);

-- Ensure enhanced_activity_logs allows service role
CREATE POLICY IF NOT EXISTS "Service role can insert activity logs"
ON public.enhanced_activity_logs
FOR INSERT
TO service_role
WITH CHECK (true);
