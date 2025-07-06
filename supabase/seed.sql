-- Seed data for testing the Concierge Transaction Flow application
-- This creates test users, profiles, and transactions for development

-- Insert test user profiles (matching auth.users that would be created by Supabase Auth)
INSERT INTO public.profiles (id, email, role, first_name, last_name, created_at, updated_at) VALUES
  -- Admin user
  ('550e8400-e29b-41d4-a716-446655440000', 'admin@demo.com', 'admin', 'Admin', 'User', NOW(), NOW()),
  -- Coordinator user  
  ('550e8400-e29b-41d4-a716-446655440001', 'coordinator@demo.com', 'coordinator', 'Coordinator', 'User', NOW(), NOW()),
  -- Agent user
  ('550e8400-e29b-41d4-a716-446655440002', 'agent@demo.com', 'agent', 'Agent', 'User', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert test clients
INSERT INTO public.clients (id, user_id, full_name, email, phone, status, created_at, updated_at) VALUES
  ('c1234567-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'John Smith', 'john.smith@email.com', '555-0123', 'active', NOW(), NOW()),
  ('c1234567-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Jane Doe', 'jane.doe@email.com', '555-0124', 'active', NOW(), NOW()),
  ('c1234567-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Bob Johnson', 'bob.johnson@email.com', '555-0125', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert test transactions including the specific one being accessed
INSERT INTO public.transactions (id, user_id, agent_id, client_id, property_address, city, state, zip_code, purchase_price, closing_date, status, transaction_type, service_tier, created_at, updated_at) VALUES
  -- The specific transaction ID being accessed
  ('78a6fba6-7d71-4744-8a39-cd6897a1f4c0', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'c1234567-e29b-41d4-a716-446655440000', '123 Main St', 'Hampton', 'VA', '23666', 450000, '2024-08-15', 'active', 'purchase', 'core', NOW(), NOW()),
  -- Additional test transactions
  ('78a6fba6-7d71-4744-8a39-cd6897a1f4c1', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'c1234567-e29b-41d4-a716-446655440001', '456 Oak Ave', 'Virginia Beach', 'VA', '23451', 525000, '2024-09-01', 'pending', 'purchase', 'elite', NOW(), NOW()),
  ('78a6fba6-7d71-4744-8a39-cd6897a1f4c2', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'c1234567-e29b-41d4-a716-446655440002', '789 Pine Rd', 'Norfolk', 'VA', '23502', 375000, '2024-07-30', 'closed', 'sale', 'white_glove', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert test tasks for the transactions
INSERT INTO public.tasks (id, user_id, transaction_id, title, description, due_date, status, priority, created_at, updated_at) VALUES
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', '78a6fba6-7d71-4744-8a39-cd6897a1f4c0', 'Home Inspection', 'Schedule and coordinate home inspection', '2024-07-20', 'pending', 'high', NOW(), NOW()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', '78a6fba6-7d71-4744-8a39-cd6897a1f4c0', 'Loan Application', 'Submit loan application documents', '2024-07-25', 'completed', 'high', NOW(), NOW()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', '78a6fba6-7d71-4744-8a39-cd6897a1f4c1', 'Property Appraisal', 'Schedule property appraisal', '2024-08-05', 'pending', 'medium', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert test documents
INSERT INTO public.documents (id, user_id, transaction_id, name, file_path, file_type, file_size, uploaded_by, created_at, updated_at) VALUES
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', '78a6fba6-7d71-4744-8a39-cd6897a1f4c0', 'Purchase Agreement', '/documents/purchase-agreement-123main.pdf', 'application/pdf', 245760, '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', '78a6fba6-7d71-4744-8a39-cd6897a1f4c0', 'Inspection Report', '/documents/inspection-123main.pdf', 'application/pdf', 1024000, '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Agent Concierge test data
INSERT INTO public.agent_vendors (id, agent_id, vendor_type, company_name, contact_name, email, phone, is_primary, created_at, updated_at) VALUES
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'inspector', 'Hampton Home Inspections', 'Mike Johnson', 'mike@hamptoninspections.com', '757-555-0101', true, NOW(), NOW()),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'lender', 'Coastal Mortgage Group', 'Sarah Williams', 'sarah@coastalmortgage.com', '757-555-0102', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.agent_branding (id, agent_id, business_name, tagline, brand_colors, logo_url, created_at, updated_at) VALUES
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'Smith Real Estate Solutions', 'Your Hampton Roads Home Expert', '{"primary": "#2563eb", "secondary": "#64748b"}', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;