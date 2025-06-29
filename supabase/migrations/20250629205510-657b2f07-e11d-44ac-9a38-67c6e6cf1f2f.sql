
-- Create offer_requests table (fixed version)
CREATE TABLE public.offer_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  
  -- Property & Buyer Info
  property_address TEXT NOT NULL,
  buyer_names TEXT NOT NULL,
  buyer_contacts JSONB NOT NULL DEFAULT '{"phones": [], "emails": []}',
  
  -- Financial Details
  purchase_price NUMERIC NOT NULL,
  loan_type TEXT NOT NULL,
  lending_company TEXT NOT NULL,
  emd_amount NUMERIC NOT NULL,
  exchange_fee NUMERIC NOT NULL,
  
  -- Settlement Information
  settlement_company TEXT NOT NULL,
  closing_cost_assistance TEXT,
  projected_closing_date DATE NOT NULL,
  
  -- Inspection Details
  wdi_inspection_details JSONB DEFAULT '{"period": null, "provider": null, "notes": ""}',
  fica_details JSONB DEFAULT '{"required": false, "inspection_period": null}',
  
  -- Additional Terms
  extras TEXT,
  lead_eifs_survey TEXT,
  occupancy_notes TEXT,
  
  -- Status and metadata
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'processed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.offer_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for agents to manage their own offer requests
CREATE POLICY "Agents can view their own offer requests" 
  ON public.offer_requests 
  FOR SELECT 
  USING (auth.uid() = agent_id);

CREATE POLICY "Agents can insert their own offer requests" 
  ON public.offer_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update their own offer requests" 
  ON public.offer_requests 
  FOR UPDATE 
  USING (auth.uid() = agent_id);

-- Allow coordinators to view and update all offer requests
CREATE POLICY "Coordinators can view all offer requests" 
  ON public.offer_requests 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'coordinator'
    )
  );

CREATE POLICY "Coordinators can update all offer requests" 
  ON public.offer_requests 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'coordinator'
    )
  );

-- Create indexes for efficient queries
CREATE INDEX idx_offer_requests_agent_id ON public.offer_requests (agent_id);
CREATE INDEX idx_offer_requests_status ON public.offer_requests (status);
CREATE INDEX idx_offer_requests_created_at ON public.offer_requests (created_at);
CREATE INDEX idx_offer_requests_transaction_id ON public.offer_requests (transaction_id);

-- Add check constraints for validation (using trigger instead of check constraint for date)
ALTER TABLE public.offer_requests 
  ADD CONSTRAINT check_positive_amounts 
  CHECK (purchase_price > 0 AND emd_amount >= 0 AND exchange_fee >= 0);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_offer_requests_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_offer_requests_updated_at
  BEFORE UPDATE ON public.offer_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_offer_requests_updated_at();

-- Create trigger to validate future dates
CREATE OR REPLACE FUNCTION public.validate_offer_request_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.projected_closing_date <= CURRENT_DATE THEN
    RAISE EXCEPTION 'Projected closing date must be in the future';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_offer_request_date_trigger
  BEFORE INSERT OR UPDATE ON public.offer_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_offer_request_date();
