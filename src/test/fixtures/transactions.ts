/**
 * Test Fixtures for Transactions
 * Provides consistent test data for transaction-related tests
 */

import type { Database } from '@/integrations/supabase/types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

// Base transaction template
export const createTransactionTemplate = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 'tx-123',
  property_address: '123 Main Street',
  property_city: 'Hampton',
  property_state: 'VA',
  property_zip: '23669',
  purchase_price: 450000,
  status: 'active',
  service_tier: 'core',
  closing_date: '2024-03-15',
  agent_id: 'agent-123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  transaction_type: 'purchase',
  contract_date: '2024-02-01',
  inspection_date: '2024-02-08',
  appraisal_date: '2024-02-15',
  earnest_money: 10000,
  down_payment: 90000,
  loan_amount: 360000,
  lender_name: 'First National Bank',
  title_company: 'Secure Title LLC',
  notes: 'Standard residential purchase',
  ...overrides,
});

// Sample transactions for different scenarios
export const mockTransactions = {
  active: createTransactionTemplate({
    id: 'tx-active-1',
    property_address: '123 Oak Street',
    status: 'active',
    purchase_price: 450000,
    closing_date: '2024-03-15',
  }),

  pending: createTransactionTemplate({
    id: 'tx-pending-1',
    property_address: '456 Pine Avenue',
    status: 'pending',
    purchase_price: 320000,
    closing_date: '2024-04-01',
  }),

  completed: createTransactionTemplate({
    id: 'tx-completed-1',
    property_address: '789 Maple Drive',
    status: 'completed',
    purchase_price: 280000,
    closing_date: '2024-01-15',
  }),

  elite: createTransactionTemplate({
    id: 'tx-elite-1',
    property_address: '555 Elite Boulevard',
    status: 'active',
    service_tier: 'elite',
    purchase_price: 750000,
    closing_date: '2024-03-20',
  }),

  whiteGlove: createTransactionTemplate({
    id: 'tx-wg-1',
    property_address: '777 Luxury Lane',
    status: 'active',
    service_tier: 'white_glove',
    purchase_price: 1250000,
    closing_date: '2024-03-25',
  }),

  noClosingDate: createTransactionTemplate({
    id: 'tx-no-date-1',
    property_address: '888 TBD Street',
    status: 'active',
    closing_date: null,
    purchase_price: null,
  }),
};

// Client fixtures
export const createClientTemplate = (overrides: Partial<Client> = {}): Client => ({
  id: 'client-123',
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '(757) 555-0123',
  type: 'buyer',
  transaction_id: 'tx-123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  notes: null,
  ...overrides,
});

export const mockClients = {
  buyer: createClientTemplate({
    id: 'client-buyer-1',
    full_name: 'John Doe',
    type: 'buyer',
    email: 'john.doe@example.com',
  }),

  seller: createClientTemplate({
    id: 'client-seller-1',
    full_name: 'Jane Smith',
    type: 'seller',
    email: 'jane.smith@example.com',
  }),

  buyerAgent: createClientTemplate({
    id: 'client-buyer-agent-1',
    full_name: 'Bob Wilson',
    type: 'buyer_agent',
    email: 'bob.wilson@realty.com',
  }),

  sellerAgent: createClientTemplate({
    id: 'client-seller-agent-1',
    full_name: 'Alice Johnson',
    type: 'seller_agent',
    email: 'alice.johnson@realty.com',
  }),
};

// Profile fixtures
export const createProfileTemplate = (overrides: Partial<Profile> = {}): Profile => ({
  id: 'profile-123',
  first_name: 'Agent',
  last_name: 'Smith',
  email: 'agent.smith@realty.com',
  role: 'agent',
  phone: '(757) 555-0100',
  brokerage: 'Premier Realty',
  license_number: 'VA-12345',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  avatar_url: null,
  bio: null,
  ...overrides,
});

export const mockProfiles = {
  agent: createProfileTemplate({
    id: 'profile-agent-1',
    first_name: 'Jane',
    last_name: 'Smith',
    role: 'agent',
    brokerage: 'Premier Realty',
  }),

  coordinator: createProfileTemplate({
    id: 'profile-coord-1',
    first_name: 'Mike',
    last_name: 'Johnson',
    role: 'coordinator',
    brokerage: 'Concierge Services',
  }),

  admin: createProfileTemplate({
    id: 'profile-admin-1',
    first_name: 'Sarah',
    last_name: 'Wilson',
    role: 'admin',
    brokerage: 'Concierge Management',
  }),
};

// Transaction with related data
export const createTransactionWithRelations = (overrides: Partial<Transaction> = {}) => {
  const transaction = createTransactionTemplate(overrides);
  
  return {
    ...transaction,
    clients: [
      mockClients.buyer,
      mockClients.seller,
    ],
    profiles: mockProfiles.agent,
  };
};

// Generate multiple transactions for list testing
export const generateTransactionList = (count: number, baseOverrides: Partial<Transaction> = {}): Transaction[] => {
  return Array.from({ length: count }, (_, index) => 
    createTransactionTemplate({
      id: `tx-${index + 1}`,
      property_address: `${100 + index} Test Street`,
      purchase_price: 300000 + (index * 50000),
      closing_date: new Date(2024, 2, 15 + index).toISOString().split('T')[0],
      created_at: new Date(2024, 0, index + 1).toISOString(),
      ...baseOverrides,
    })
  );
};

// Service tier specific fixtures
export const transactionsByServiceTier = {
  core: generateTransactionList(5, { service_tier: 'core' }),
  elite: generateTransactionList(3, { service_tier: 'elite', purchase_price: 750000 }),
  whiteGlove: generateTransactionList(2, { service_tier: 'white_glove', purchase_price: 1250000 }),
};

// Status specific fixtures
export const transactionsByStatus = {
  active: generateTransactionList(8, { status: 'active' }),
  pending: generateTransactionList(3, { status: 'pending' }),
  completed: generateTransactionList(12, { status: 'completed' }),
  cancelled: generateTransactionList(2, { status: 'cancelled' }),
};

// Edge case fixtures
export const edgeCaseTransactions = {
  minimalData: createTransactionTemplate({
    id: 'tx-minimal',
    property_address: 'Minimal Property',
    purchase_price: null,
    closing_date: null,
    notes: null,
    earnest_money: null,
    down_payment: null,
    loan_amount: null,
  }),

  longAddress: createTransactionTemplate({
    id: 'tx-long-address',
    property_address: 'Very Long Property Address That Should Test Truncation And Layout Handling In Various Components Across The Application',
    property_city: 'Virginia Beach',
  }),

  highValue: createTransactionTemplate({
    id: 'tx-high-value',
    purchase_price: 5750000,
    service_tier: 'white_glove',
    earnest_money: 250000,
    down_payment: 1150000,
  }),

  urgentClosing: createTransactionTemplate({
    id: 'tx-urgent',
    closing_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    notes: 'Rush closing - all parties aligned',
  }),
};

// Export everything as default for easy importing
export default {
  transactions: mockTransactions,
  clients: mockClients,
  profiles: mockProfiles,
  createTransaction: createTransactionTemplate,
  createClient: createClientTemplate,
  createProfile: createProfileTemplate,
  createTransactionWithRelations,
  generateTransactionList,
  transactionsByServiceTier,
  transactionsByStatus,
  edgeCaseTransactions,
};