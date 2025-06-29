-- SQLite schema equivalent to Supabase schema for testing
-- Core tables needed for dashboard metrics and automation testing

-- User profiles table
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'coordinator')),
  brokerage TEXT,
  phone_number TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Transactions table - core business entity
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  property_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  purchase_price REAL,
  commission_rate REAL,
  closing_date TEXT,
  status TEXT NOT NULL DEFAULT 'intake' CHECK (status IN ('intake', 'active', 'closed', 'cancelled')),
  transaction_type TEXT CHECK (transaction_type IN ('buyer', 'seller', 'dual')),
  service_tier TEXT CHECK (service_tier IN ('buyer_core', 'buyer_elite', 'white_glove_buyer', 'listing_core', 'listing_elite', 'white_glove_listing')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (agent_id) REFERENCES profiles(id)
);

-- Clients table
CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  type TEXT NOT NULL CHECK (type IN ('buyer', 'seller')),
  preferred_contact_method TEXT,
  referral_source TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Tasks table
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_completed BOOLEAN NOT NULL DEFAULT 0,
  requires_agent_action BOOLEAN DEFAULT 0,
  agent_action_prompt TEXT,
  due_date TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Automation rules table
CREATE TABLE automation_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  trigger_event TEXT NOT NULL,
  trigger_condition TEXT, -- JSON stored as TEXT
  template_id TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (created_by) REFERENCES profiles(id)
);

-- Workflow executions table
CREATE TABLE workflow_executions (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'retrying')),
  executed_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata TEXT, -- JSON stored as TEXT
  FOREIGN KEY (rule_id) REFERENCES automation_rules(id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Automation audit logs table
CREATE TABLE automation_audit_logs (
  id TEXT PRIMARY KEY,
  execution_id TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  details TEXT, -- JSON stored as TEXT
  error_message TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (execution_id) REFERENCES workflow_executions(id)
);

-- Workflow templates table
CREATE TABLE workflow_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Workflow instances table
CREATE TABLE workflow_instances (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  applied_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  applied_at TEXT NOT NULL DEFAULT (datetime('now')),
  metadata TEXT, -- JSON stored as TEXT
  FOREIGN KEY (transaction_id) REFERENCES transactions(id),
  FOREIGN KEY (template_id) REFERENCES workflow_templates(id),
  FOREIGN KEY (applied_by) REFERENCES profiles(id)
);

-- Notifications table
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES profiles(id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Documents table (for document upload triggers)
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by_id TEXT NOT NULL,
  is_agent_visible BOOLEAN DEFAULT 1,
  e_sign_status TEXT,
  e_sign_provider TEXT,
  e_sign_request_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id),
  FOREIGN KEY (uploaded_by_id) REFERENCES profiles(id)
);

-- Indexes for performance
CREATE INDEX idx_transactions_agent_id ON transactions(agent_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_closing_date ON transactions(closing_date);
CREATE INDEX idx_tasks_transaction_id ON tasks(transaction_id);
CREATE INDEX idx_tasks_is_completed ON tasks(is_completed);
CREATE INDEX idx_tasks_requires_agent_action ON tasks(requires_agent_action);
CREATE INDEX idx_automation_rules_is_active ON automation_rules(is_active);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_clients_transaction_id ON clients(transaction_id);