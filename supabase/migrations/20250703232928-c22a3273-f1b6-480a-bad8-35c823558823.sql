
-- Clean up and consolidate RLS policies for transactions table
-- Remove redundant policies first
DROP POLICY IF EXISTS "Agents can manage their assigned transactions" ON public.transactions;
DROP POLICY IF EXISTS "Coordinators can manage all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Coordinators can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Coordinators have full access to all transactions" ON public.transactions;

-- Create clean, non-overlapping policies
CREATE POLICY "Agents can access their assigned transactions" ON public.transactions
  FOR ALL 
  USING (
    agent_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'agent')
  )
  WITH CHECK (
    agent_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'agent')
  );

CREATE POLICY "Coordinators have full access to all transactions" ON public.transactions
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );
