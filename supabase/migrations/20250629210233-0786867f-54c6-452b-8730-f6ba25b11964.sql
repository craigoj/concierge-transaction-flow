
-- Create transaction_service_details table
CREATE TABLE public.transaction_service_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  selected_features JSONB NOT NULL DEFAULT '[]'::jsonb,
  base_service_fee NUMERIC NOT NULL DEFAULT 0,
  total_service_cost NUMERIC NOT NULL DEFAULT 0,
  add_ons JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure only one service details record per transaction
  CONSTRAINT unique_transaction_service_details UNIQUE (transaction_id)
);

-- Add Row Level Security
ALTER TABLE public.transaction_service_details ENABLE ROW LEVEL SECURITY;

-- Create policies for transaction service details
CREATE POLICY "Users can view service details for their transactions" 
  ON public.transaction_service_details 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE transactions.id = transaction_service_details.transaction_id 
      AND transactions.agent_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage service details for their transactions" 
  ON public.transaction_service_details 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE transactions.id = transaction_service_details.transaction_id 
      AND transactions.agent_id = auth.uid()
    )
  );

-- Allow coordinators to view and manage all service details
CREATE POLICY "Coordinators can view all service details" 
  ON public.transaction_service_details 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'coordinator'
    )
  );

CREATE POLICY "Coordinators can manage all service details" 
  ON public.transaction_service_details 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'coordinator'
    )
  );

-- Create indexes for efficient queries
CREATE INDEX idx_transaction_service_details_transaction_id ON public.transaction_service_details (transaction_id);
CREATE INDEX idx_transaction_service_details_created_at ON public.transaction_service_details (created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_transaction_service_details_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_transaction_service_details_updated_at
  BEFORE UPDATE ON public.transaction_service_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_transaction_service_details_updated_at();
