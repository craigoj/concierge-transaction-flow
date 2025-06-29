
-- Enhance template_tasks table to support all XML properties
ALTER TABLE template_tasks 
ADD COLUMN IF NOT EXISTS task_type text DEFAULT 'TODO',
ADD COLUMN IF NOT EXISTS auto_fill_with_role text,
ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_on_calendar boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS is_milestone boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_set boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_delta integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS reminder_time_minutes integer DEFAULT 540,
ADD COLUMN IF NOT EXISTS color text,
ADD COLUMN IF NOT EXISTS expense numeric,
ADD COLUMN IF NOT EXISTS xaction_side_buyer boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS xaction_side_seller boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS xaction_side_dual boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS buyer_seller_visible boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_prospecting boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS due_time_minutes integer,
ADD COLUMN IF NOT EXISTS recurring_frequency text,
ADD COLUMN IF NOT EXISTS recurring_separation_count integer,
ADD COLUMN IF NOT EXISTS recurring_count integer,
ADD COLUMN IF NOT EXISTS recurring_day_of_week integer,
ADD COLUMN IF NOT EXISTS recurring_day_of_month integer,
ADD COLUMN IF NOT EXISTS recurring_month_of_year integer;

-- Create xml_template_imports table to track import history
CREATE TABLE IF NOT EXISTS xml_template_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  imported_by uuid REFERENCES profiles(id) NOT NULL,
  import_status text DEFAULT 'processing',
  templates_imported integer DEFAULT 0,
  tasks_imported integer DEFAULT 0,
  emails_imported integer DEFAULT 0,
  error_message text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Create imported_email_templates table to link imported emails to their original XML data
CREATE TABLE IF NOT EXISTS imported_email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_template_id uuid REFERENCES email_templates(id) NOT NULL,
  original_xml_id text,
  folder_name text,
  email_to text,
  email_cc text,
  email_bcc text,
  is_system_template boolean DEFAULT false,
  template_type text,
  import_id uuid REFERENCES xml_template_imports(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Add index for faster lookups during import processing
CREATE INDEX IF NOT EXISTS idx_template_tasks_template_id ON template_tasks(template_id);
CREATE INDEX IF NOT EXISTS idx_xml_imports_status ON xml_template_imports(import_status);

-- Enable RLS on new tables
ALTER TABLE xml_template_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_email_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for xml_template_imports
CREATE POLICY "Coordinators can view import history" ON xml_template_imports
  FOR SELECT USING (get_user_role() = 'coordinator');

CREATE POLICY "Coordinators can create imports" ON xml_template_imports
  FOR INSERT WITH CHECK (get_user_role() = 'coordinator');

CREATE POLICY "Coordinators can update imports" ON xml_template_imports
  FOR UPDATE USING (get_user_role() = 'coordinator');

-- Create RLS policies for imported_email_templates
CREATE POLICY "Coordinators can view imported email templates" ON imported_email_templates
  FOR SELECT USING (get_user_role() = 'coordinator');

CREATE POLICY "Coordinators can create imported email templates" ON imported_email_templates
  FOR INSERT WITH CHECK (get_user_role() = 'coordinator');
