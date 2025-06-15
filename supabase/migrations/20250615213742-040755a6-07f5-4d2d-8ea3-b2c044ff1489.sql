
-- Enable Row Level Security on calendar_integrations table
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own calendar integrations
CREATE POLICY "Users can view their own calendar integrations" 
  ON public.calendar_integrations 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own calendar integrations
CREATE POLICY "Users can create their own calendar integrations" 
  ON public.calendar_integrations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to update their own calendar integrations
CREATE POLICY "Users can update their own calendar integrations" 
  ON public.calendar_integrations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to delete their own calendar integrations
CREATE POLICY "Users can delete their own calendar integrations" 
  ON public.calendar_integrations 
  FOR DELETE 
  USING (auth.uid() = user_id);
