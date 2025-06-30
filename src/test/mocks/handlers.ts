
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Supabase REST API
  http.get('*/rest/v1/profiles', () => {
    return HttpResponse.json([
      {
        id: '123',
        role: 'agent',
        full_name: 'Test Agent',
        email: 'test@example.com'
      }
    ]);
  }),

  http.post('*/rest/v1/offer_requests', () => {
    return HttpResponse.json({
      id: '456',
      status: 'pending',
      created_at: new Date().toISOString()
    });
  }),

  http.get('*/rest/v1/agent_vendors', () => {
    return HttpResponse.json([
      {
        id: '789',
        vendor_type: 'lender',
        company_name: 'Test Lender',
        is_primary: true
      }
    ]);
  }),

  // Mock authentication endpoints
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      user: {
        id: '123',
        email: 'test@example.com'
      }
    });
  }),
];
