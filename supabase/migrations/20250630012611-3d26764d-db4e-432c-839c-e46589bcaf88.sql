
-- Create transaction templates table
CREATE TABLE public.transaction_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'residential',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  template_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS for transaction templates
ALTER TABLE public.transaction_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for transaction templates
CREATE POLICY "Users can view transaction templates" 
  ON public.transaction_templates 
  FOR SELECT 
  USING (true); -- Templates can be viewed by all authenticated users

CREATE POLICY "Users can create transaction templates" 
  ON public.transaction_templates 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own transaction templates" 
  ON public.transaction_templates 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own transaction templates" 
  ON public.transaction_templates 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Create duplicate detection logs table
CREATE TABLE public.duplicate_detection_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'transaction', 'client', 'property'
  entity_id UUID NOT NULL,
  potential_duplicate_id UUID NOT NULL,
  similarity_score NUMERIC NOT NULL DEFAULT 0,
  detection_method TEXT NOT NULL, -- 'address', 'client_info', 'phone', 'email'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'resolved', 'ignored'
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS for duplicate detection logs
ALTER TABLE public.duplicate_detection_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for duplicate detection logs
CREATE POLICY "Users can view duplicate detection logs" 
  ON public.duplicate_detection_logs 
  FOR SELECT 
  USING (true); -- Can be viewed by all authenticated users

CREATE POLICY "Users can create duplicate detection logs" 
  ON public.duplicate_detection_logs 
  FOR INSERT 
  WITH CHECK (true); -- System can create logs

CREATE POLICY "Users can update duplicate detection logs" 
  ON public.duplicate_detection_logs 
  FOR UPDATE 
  USING (true); -- Users can resolve duplicates

-- Add indexes for efficient duplicate detection
CREATE INDEX idx_transactions_property_address_search 
ON transactions USING gin(to_tsvector('english', property_address));

CREATE INDEX idx_clients_name_search 
ON clients USING gin(to_tsvector('english', full_name));

CREATE INDEX idx_clients_email 
ON clients(email) WHERE email IS NOT NULL;

CREATE INDEX idx_clients_phone 
ON clients(phone) WHERE phone IS NOT NULL;

-- Create function for bulk transaction status updates
CREATE OR REPLACE FUNCTION public.bulk_update_transaction_status(
  transaction_ids UUID[],
  new_status transaction_status,
  updated_by UUID DEFAULT auth.uid()
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Update transactions
  UPDATE public.transactions 
  SET 
    status = new_status,
    updated_at = now()
  WHERE 
    id = ANY(transaction_ids)
    AND agent_id = updated_by; -- Ensure user can only update their own transactions
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- Log the bulk operation
  INSERT INTO public.activity_logs (
    user_id,
    action,
    description,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    updated_by,
    'bulk_status_update',
    'Bulk updated ' || updated_count || ' transactions to ' || new_status,
    'transaction',
    gen_random_uuid(), -- Placeholder for bulk operation
    jsonb_build_object(
      'transaction_ids', transaction_ids,
      'new_status', new_status,
      'updated_count', updated_count
    )
  );
  
  RETURN updated_count;
END;
$$;

-- Create function for duplicate detection
CREATE OR REPLACE FUNCTION public.detect_property_duplicates(
  p_property_address TEXT,
  p_city TEXT,
  p_state TEXT,
  p_zip_code TEXT,
  p_exclude_transaction_id UUID DEFAULT NULL
)
RETURNS TABLE(
  transaction_id UUID,
  property_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  similarity_score NUMERIC,
  status transaction_status
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.property_address,
    t.city,
    t.state,
    t.zip_code,
    -- Simple similarity scoring based on address components
    CASE 
      WHEN LOWER(t.property_address) = LOWER(p_property_address) 
           AND LOWER(t.city) = LOWER(p_city)
           AND LOWER(t.state) = LOWER(p_state)
           AND t.zip_code = p_zip_code
      THEN 1.0
      WHEN similarity(LOWER(t.property_address), LOWER(p_property_address)) > 0.8
           AND LOWER(t.city) = LOWER(p_city)
           AND LOWER(t.state) = LOWER(p_state)
      THEN 0.9
      WHEN similarity(LOWER(t.property_address), LOWER(p_property_address)) > 0.6
           AND LOWER(t.city) = LOWER(p_city)
      THEN 0.7
      ELSE 0.5
    END as similarity_score,
    t.status
  FROM public.transactions t
  WHERE 
    (p_exclude_transaction_id IS NULL OR t.id != p_exclude_transaction_id)
    AND (
      -- Exact match
      (LOWER(t.property_address) = LOWER(p_property_address) 
       AND LOWER(t.city) = LOWER(p_city)
       AND LOWER(t.state) = LOWER(p_state))
      OR
      -- Fuzzy match on address with same city/state
      (similarity(LOWER(t.property_address), LOWER(p_property_address)) > 0.6
       AND LOWER(t.city) = LOWER(p_city)
       AND LOWER(t.state) = LOWER(p_state))
      OR
      -- Same zip code with similar address
      (t.zip_code = p_zip_code 
       AND similarity(LOWER(t.property_address), LOWER(p_property_address)) > 0.5)
    )
  ORDER BY similarity_score DESC
  LIMIT 10;
END;
$$;

-- Enable the pg_trgm extension for similarity functions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
