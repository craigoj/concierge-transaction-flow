
-- Add missing retry_count column to workflow_executions table
ALTER TABLE workflow_executions ADD COLUMN IF NOT EXISTS retry_count integer DEFAULT 0;

-- Add missing completed_at column to workflow_executions table  
ALTER TABLE workflow_executions ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

-- Create automation_audit_logs table for tracking automation events
CREATE TABLE IF NOT EXISTS automation_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id uuid NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  action text NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'failed')),
  details jsonb DEFAULT '{}',
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on automation_audit_logs
ALTER TABLE automation_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for automation_audit_logs (accessible by authenticated users)
CREATE POLICY "Users can view automation audit logs" ON automation_audit_logs
  FOR SELECT USING (auth.role() = 'authenticated');
