
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/testUtils';
import AuthGuard from '@/components/AuthGuard';
import { MemoryRouter } from 'react-router-dom';

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard' })
  };
});

// Mock Supabase auth
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      getSession: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    }))
  }
}));

describe('AuthGuard Security Integration', () => {
  const TestComponent = () => <div>Protected Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    // Mock loading state
    vi.mocked(vi.importMock('@/integrations/supabase/client')).supabase.auth.getSession.mockResolvedValue({
      data: { session: null }
    });

    render(
      <MemoryRouter>
        <AuthGuard>
          <TestComponent />
        </AuthGuard>
      </MemoryRouter>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should redirect to auth when not authenticated', async () => {
    // Mock no session
    vi.mocked(vi.importMock('@/integrations/supabase/client')).supabase.auth.getSession.mockResolvedValue({
      data: { session: null }
    });

    render(
      <MemoryRouter>
        <AuthGuard>
          <TestComponent />
        </AuthGuard>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });
  });

  it('should render protected content when authenticated', async () => {
    const mockSession = {
      user: { id: '123', email: 'test@example.com' },
      access_token: 'mock-token'
    };
    
    // Mock authenticated session
    vi.mocked(vi.importMock('@/integrations/supabase/client')).supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession }
    });
    
    vi.mocked(vi.importMock('@/integrations/supabase/client')).supabase.from().select().eq().single.mockResolvedValue({
      data: { role: 'agent' },
      error: null
    });

    render(
      <MemoryRouter>
        <AuthGuard>
          <TestComponent />
        </AuthGuard>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should handle role-based routing for agents', async () => {
    const mockSession = {
      user: { id: '123', email: 'agent@example.com' },
      access_token: 'mock-token'
    };
    
    vi.mocked(vi.importMock('@/integrations/supabase/client')).supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession }
    });
    
    vi.mocked(vi.importMock('@/integrations/supabase/client')).supabase.from().select().eq().single.mockResolvedValue({
      data: { role: 'agent' },
      error: null
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthGuard>
          <TestComponent />
        </AuthGuard>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/agent/dashboard');
    });
  });

  it('should handle role-based routing for coordinators', async () => {
    const mockSession = {
      user: { id: '123', email: 'coordinator@example.com' },
      access_token: 'mock-token'
    };
    
    vi.mocked(vi.importMock('@/integrations/supabase/client')).supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession }
    });
    
    vi.mocked(vi.importMock('@/integrations/supabase/client')).supabase.from().select().eq().single.mockResolvedValue({
      data: { role: 'coordinator' },
      error: null
    });

    render(
      <MemoryRouter initialEntries={['/agent/dashboard']}>
        <AuthGuard>
          <TestComponent />
        </AuthGuard>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
