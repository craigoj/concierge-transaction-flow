
-- Fix Transaction Access Policies by removing duplicates and ensuring coordinator access
DROP POLICY IF EXISTS "Coordinators can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Coordinators can manage all transactions" ON public.transactions;

CREATE POLICY "Coordinators can view all transactions" ON public.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

CREATE POLICY "Coordinators can manage all transactions" ON public.transactions  
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

-- Add Bulk Operation Functions
CREATE OR REPLACE FUNCTION public.bulk_update_transaction_status(
    transaction_ids UUID[],
    new_status transaction_status,
    updated_by UUID DEFAULT auth.uid()
)
RETURNS INTEGER AS $$
DECLARE
    update_count INTEGER;
BEGIN
    -- Check if user is coordinator
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = updated_by AND role = 'coordinator'
    ) THEN
        RAISE EXCEPTION 'Only coordinators can perform bulk updates';
    END IF;
    
    UPDATE public.transactions 
    SET status = new_status, updated_at = NOW()
    WHERE id = ANY(transaction_ids);
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
    
    -- Log the bulk operation
    INSERT INTO public.enhanced_activity_logs (
        user_id, action, category, description, entity_type, entity_id, metadata
    ) VALUES (
        updated_by, 'bulk_status_update', 'transaction_management',
        'Bulk updated ' || update_count || ' transactions to ' || new_status,
        'transaction', updated_by,
        jsonb_build_object('transaction_ids', transaction_ids, 'new_status', new_status)
    );
    
    RETURN update_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Transaction reassignment function  
CREATE OR REPLACE FUNCTION public.reassign_transaction(
    transaction_id UUID,
    new_agent_id UUID,
    reassigned_by UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is coordinator
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = reassigned_by AND role = 'coordinator'
    ) THEN
        RAISE EXCEPTION 'Only coordinators can reassign transactions';
    END IF;
    
    UPDATE public.transactions 
    SET agent_id = new_agent_id, updated_at = NOW()
    WHERE id = transaction_id;
    
    -- Log the reassignment
    INSERT INTO public.enhanced_activity_logs (
        user_id, target_user_id, action, category, description, entity_type, entity_id
    ) VALUES (
        reassigned_by, new_agent_id, 'transaction_reassignment', 'transaction_management',
        'Transaction reassigned to new agent', 'transaction', transaction_id
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix clients table access by removing duplicates and ensuring coordinator access
DROP POLICY IF EXISTS "Coordinators can view all clients" ON public.clients;
CREATE POLICY "Coordinators can view all clients" ON public.clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

-- Fix tasks table access by removing duplicates and ensuring coordinator access  
DROP POLICY IF EXISTS "Coordinators can view all tasks" ON public.tasks;
CREATE POLICY "Coordinators can view all tasks" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

-- Fix documents table access by removing duplicates and ensuring coordinator access
DROP POLICY IF EXISTS "Coordinators can view all documents" ON public.documents;
CREATE POLICY "Coordinators can view all documents" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );
