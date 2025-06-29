
-- Create email templates (using coordinator role instead of admin)
INSERT INTO email_templates (name, subject, body_html, category, created_by) 
VALUES 
(
  'agent-welcome',
  'Welcome to The Agent Concierge Co. Portal',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: "Libre Baskerville", serif; color: #2D2D2D; background-color: #F8F6F3; margin: 0; padding: 40px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #C9B79C 0%, #A69080 100%); padding: 40px; text-align: center; }
    .header h1 { color: white; font-family: "Montserrat", sans-serif; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
    .content { padding: 40px; }
    .content h2 { font-family: "Montserrat", sans-serif; color: #2D2D2D; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }
    .btn { display: inline-block; background: #2D2D2D; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-family: "Montserrat", sans-serif; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0; }
    .footer { background: #F8F6F3; padding: 30px; text-align: center; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>The Agent Concierge Co.</h1>
    </div>
    <div class="content">
      <h2>Welcome, {{agent_name}}!</h2>
      <p>Your portal is now ready. We''ve designed this platform to provide you with the calm, clarity, and confidence you need to excel in your real estate practice.</p>
      <p>Your personalized dashboard awaits, complete with transaction management, automated workflows, and premium support.</p>
      <a href="{{portal_url}}" class="btn">Access Your Portal</a>
      <p>If you have any questions, our concierge team is here to help.</p>
    </div>
    <div class="footer">
      <p>© 2024 The Agent Concierge Co. | Premium Real Estate Services</p>
    </div>
  </div>
</body>
</html>',
  'onboarding',
  (SELECT id FROM profiles WHERE role = 'coordinator' LIMIT 1)
),
(
  'task-completed',
  'Task Completed: {{task_title}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: "Libre Baskerville", serif; color: #2D2D2D; background-color: #F8F6F3; margin: 0; padding: 40px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; font-family: "Montserrat", sans-serif; font-weight: 600; margin: 0; }
    .content { padding: 40px; }
    .content h2 { font-family: "Montserrat", sans-serif; color: #2D2D2D; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }
    .property-info { background: #F8F6F3; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .btn { display: inline-block; background: #2D2D2D; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-family: "Montserrat", sans-serif; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Task Completed</h1>
    </div>
    <div class="content">
      <h2>{{task_title}}</h2>
      <div class="property-info">
        <strong>Property:</strong> {{property_address}}<br>
        <strong>Transaction:</strong> {{transaction_status}}<br>
        <strong>Completed by:</strong> {{agent_name}}
      </div>
      <p>This task has been successfully completed and your transaction is moving forward smoothly.</p>
      <a href="{{transaction_url}}" class="btn">View Transaction Details</a>
    </div>
  </div>
</body>
</html>',
  'notifications',
  (SELECT id FROM profiles WHERE role = 'coordinator' LIMIT 1)
),
(
  'action-required',
  'Action Required: {{property_address}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: "Libre Baskerville", serif; color: #2D2D2D; background-color: #F8F6F3; margin: 0; padding: 40px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; font-family: "Montserrat", sans-serif; font-weight: 600; margin: 0; }
    .content { padding: 40px; }
    .content h2 { font-family: "Montserrat", sans-serif; color: #2D2D2D; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }
    .urgent { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .btn { display: inline-block; background: #F59E0B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-family: "Montserrat", sans-serif; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠ Action Required</h1>
    </div>
    <div class="content">
      <h2>{{property_address}}</h2>
      <div class="urgent">
        <strong>Priority:</strong> {{priority}}<br>
        <strong>Due:</strong> {{due_date}}<br>
        <strong>Task:</strong> {{task_title}}
      </div>
      <p>{{task_description}}</p>
      <a href="{{transaction_url}}" class="btn">Take Action Now</a>
    </div>
  </div>
</body>
</html>',
  'notifications',
  (SELECT id FROM profiles WHERE role = 'coordinator' LIMIT 1)
);

-- Create calendar integrations table
CREATE TABLE IF NOT EXISTS calendar_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'google',
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  calendar_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own calendar integrations
CREATE POLICY "Users can manage their own calendar integrations"
  ON calendar_integrations
  FOR ALL
  USING (auth.uid() = user_id);

-- Create calendar events table to track synced events
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  calendar_integration_id UUID NOT NULL REFERENCES calendar_integrations(id) ON DELETE CASCADE,
  external_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'contract', 'inspection', 'financing', 'closing'
  event_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Create policy for calendar events
CREATE POLICY "Users can view calendar events for their transactions"
  ON calendar_events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      JOIN calendar_integrations ci ON ci.id = calendar_events.calendar_integration_id
      WHERE t.id = calendar_events.transaction_id 
      AND (t.agent_id = auth.uid() OR ci.user_id = auth.uid())
    )
  );
