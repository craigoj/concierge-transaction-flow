import { http } from 'msw'

const SUPABASE_URL = 'https://your-project.supabase.co'
const SUPABASE_API_URL = `${SUPABASE_URL}/rest/v1`

export const handlers = [
  // Auth handlers
  http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
    return new Response(JSON.stringify({
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 3600,
      user: {
        id: '123',
        email: 'test@example.com',
        role: 'authenticated'
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }),

  // Users/Profiles table
  http.get(`${SUPABASE_API_URL}/profiles`, () => {
    return new Response(JSON.stringify([
      {
        id: '123',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'agent',
        created_at: new Date().toISOString()
      }
    ]), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }),

  // Transactions table
  http.get(`${SUPABASE_API_URL}/transactions`, () => {
    return new Response(JSON.stringify([
      {
        id: '456',
        client_id: '789',
        agent_id: '123',
        property_address: '123 Test St',
        transaction_type: 'purchase',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }),

  http.post(`${SUPABASE_API_URL}/transactions`, () => {
    return new Response(JSON.stringify({
      id: '789',
      client_id: '789',
      agent_id: '123',
      property_address: '456 New St',
      transaction_type: 'sale',
      status: 'intake',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }),

  // Clients table
  http.get(`${SUPABASE_API_URL}/clients`, () => {
    return new Response(JSON.stringify([
      {
        id: '789',
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        preferred_contact: 'email',
        service_tier: 'premium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }),

  http.post(`${SUPABASE_API_URL}/clients`, () => {
    return new Response(JSON.stringify({
      id: '890',
      full_name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1234567891',
      preferred_contact: 'phone',
      service_tier: 'standard',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }),

  // Agents table
  http.get(`${SUPABASE_API_URL}/agents`, () => {
    return new Response(JSON.stringify([
      {
        id: '123',
        email: 'agent@example.com',
        full_name: 'Agent Smith',
        specialization: 'residential',
        created_at: new Date().toISOString()
      }
    ]), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }),

  // Communications table
  http.get(`${SUPABASE_API_URL}/communications`, () => {
    return new Response(JSON.stringify([
      {
        id: '101',
        transaction_id: '456',
        type: 'email',
        content: 'Test communication',
        created_at: new Date().toISOString()
      }
    ]), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }),

  // Automation rules
  http.get(`${SUPABASE_API_URL}/automation_rules`, () => {
    return new Response(JSON.stringify([
      {
        id: '201',
        name: 'Welcome Email',
        trigger_type: 'client_created',
        action_type: 'send_email',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }),

  // Fallback for unhandled requests
  http.get(`${SUPABASE_API_URL}/*`, () => {
    return new Response(JSON.stringify([]), {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }),
]