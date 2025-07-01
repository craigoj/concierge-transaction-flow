
-- Remove all transaction data to start fresh
-- This script safely deletes all transaction-related data while preserving user profiles and system configurations

-- Step 1: Delete dependent records first (respecting foreign key constraints)

-- Delete communication history related to transactions
DELETE FROM communication_history WHERE user_id IN (
  SELECT agent_id FROM transactions
) OR recipient_id IN (
  SELECT agent_id FROM transactions
);

-- Delete communication logs for transactions
DELETE FROM communication_logs WHERE transaction_id IS NOT NULL;

-- Delete calendar events for transactions
DELETE FROM calendar_events WHERE transaction_id IN (SELECT id FROM transactions);

-- Delete workflow executions for transactions
DELETE FROM workflow_executions WHERE transaction_id IN (SELECT id FROM transactions);

-- Delete workflow instances for transactions
DELETE FROM workflow_instances WHERE transaction_id IN (SELECT id FROM transactions);

-- Delete automation audit logs for workflow executions that are being deleted
DELETE FROM automation_audit_logs WHERE execution_id NOT IN (SELECT id FROM workflow_executions);

-- Delete duplicate detection logs for transactions
DELETE FROM duplicate_detection_logs WHERE entity_type = 'transaction' AND entity_id IN (SELECT id FROM transactions);

-- Delete notifications for transactions
DELETE FROM notifications WHERE transaction_id IN (SELECT id FROM transactions);

-- Delete documents for transactions
DELETE FROM documents WHERE transaction_id IN (SELECT id FROM transactions);

-- Delete tasks for transactions
DELETE FROM tasks WHERE transaction_id IN (SELECT id FROM transactions);

-- Delete clients for transactions
DELETE FROM clients WHERE transaction_id IN (SELECT id FROM transactions);

-- Delete offer requests (can exist without transactions)
DELETE FROM offer_requests;

-- Delete transaction service details
DELETE FROM transaction_service_details WHERE transaction_id IN (SELECT id FROM transactions);

-- Step 2: Finally delete the main transactions table
DELETE FROM transactions;

-- Step 3: Reset any sequences or counters if needed (PostgreSQL specific)
-- Note: UUID primary keys don't need sequence resets

-- Step 4: Log the cleanup operation
INSERT INTO activity_logs (user_id, action, description, entity_type, entity_id, metadata) 
SELECT 
  auth.uid(),
  'bulk_data_cleanup',
  'Removed all transaction data to start fresh',
  'system',
  gen_random_uuid(),
  jsonb_build_object(
    'cleanup_type', 'full_transaction_reset',
    'timestamp', now()
  )
WHERE auth.uid() IS NOT NULL;
