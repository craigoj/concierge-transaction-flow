import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCalendarIntegration } from '../useCalendarIntegration';

let mockSupabaseClient: any = null;
const mockToast = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  get supabase() {
    return mockSupabaseClient;
  }
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast
  })
}));

Object.defineProperty(window, 'open', {
  writable: true,
  value: vi.fn()
});

describe('useCalendarIntegration', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();

    mockSupabaseClient = {
      auth: {
        getUser: vi.fn()
      },
      from: vi.fn()
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Hook Structure', () => {
    it('should return all required functions and state', () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      const { result } = renderHook(() => useCalendarIntegration());
      
      expect(result.current).toHaveProperty('connectGoogleCalendar');
      expect(result.current).toHaveProperty('checkCalendarConnection');
      expect(result.current).toHaveProperty('disconnectCalendar');
      expect(result.current).toHaveProperty('isConnecting');
      expect(typeof result.current.connectGoogleCalendar).toBe('function');
      expect(typeof result.current.checkCalendarConnection).toBe('function');
      expect(typeof result.current.disconnectCalendar).toBe('function');
      expect(typeof result.current.isConnecting).toBe('boolean');
    });

    it('should initialize with isConnecting as false', () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      const { result } = renderHook(() => useCalendarIntegration());
      
      expect(result.current.isConnecting).toBe(false);
    });
  });

  describe('connectGoogleCalendar', () => {
    it('should successfully initiate Google Calendar connection', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      const { result } = renderHook(() => useCalendarIntegration());

      await act(async () => {
        await result.current.connectGoogleCalendar();
      });

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth'),
        '_blank',
        'width=500,height=600'
      );
      expect(mockToast).toHaveBeenCalledWith({
        title: "Calendar connection initiated",
        description: "Please complete the authorization in the new window.",
      });
      expect(result.current.isConnecting).toBe(false);
    });

    it('should set isConnecting to true during connection process', async () => {
      mockSupabaseClient.auth.getUser.mockImplementation(() => 
        new Promise(resolve => {
          setTimeout(() => resolve({ data: { user: mockUser } }), 100);
        })
      );
      
      const { result } = renderHook(() => useCalendarIntegration());

      act(() => {
        result.current.connectGoogleCalendar();
      });

      expect(result.current.isConnecting).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.isConnecting).toBe(false);
    });

    it('should handle authentication required error', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null } });
      
      const { result } = renderHook(() => useCalendarIntegration());

      await act(async () => {
        await result.current.connectGoogleCalendar();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Authentication required",
        description: "Please log in to connect your calendar.",
        variant: "destructive",
      });
      expect(window.open).not.toHaveBeenCalled();
      expect(result.current.isConnecting).toBe(false);
    });

    it('should build correct Google OAuth URL with all parameters', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      const { result } = renderHook(() => useCalendarIntegration());

      await act(async () => {
        await result.current.connectGoogleCalendar();
      });

      const openCall = (window.open as any).mock.calls[0][0];
      const url = new URL(openCall);

      expect(url.hostname).toBe('accounts.google.com');
      expect(url.pathname).toBe('/o/oauth2/v2/auth');
      expect(url.searchParams.get('client_id')).toBe('2044a8b6c3f708992d480240b149dc5f39f50e0b48c658031bc525dce98e92a2.apps.googleusercontent.com');
      expect(url.searchParams.get('redirect_uri')).toBe('https://tdupublcyigkgdlobzqi.supabase.co/functions/v1/google-calendar-auth');
      expect(url.searchParams.get('response_type')).toBe('code');
      expect(url.searchParams.get('scope')).toBe('https://www.googleapis.com/auth/calendar');
      expect(url.searchParams.get('access_type')).toBe('offline');
      expect(url.searchParams.get('prompt')).toBe('consent');
      expect(url.searchParams.get('state')).toBe(mockUser.id);
    });

    it('should handle connection errors gracefully', async () => {
      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Network error'));
      
      const { result } = renderHook(() => useCalendarIntegration());

      await act(async () => {
        await result.current.connectGoogleCalendar();
      });

      expect(console.error).toHaveBeenCalledWith('Error connecting Google Calendar:', expect.any(Error));
      expect(mockToast).toHaveBeenCalledWith({
        title: "Connection failed",
        description: "Failed to connect Google Calendar. Please try again.",
        variant: "destructive",
      });
      expect(window.open).not.toHaveBeenCalled();
      expect(result.current.isConnecting).toBe(false);
    });

    it('should ensure isConnecting is always reset in finally block', async () => {
      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Network error'));
      
      const { result } = renderHook(() => useCalendarIntegration());

      await act(async () => {
        await result.current.connectGoogleCalendar();
      });

      expect(result.current.isConnecting).toBe(false);
    });
  });

  describe('checkCalendarConnection', () => {
    it('should return true when user has active calendar integration', async () => {
      const mockCalendarData = [
        { id: 1, user_id: mockUser.id, is_active: true, provider: 'google' }
      ];

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ data: mockCalendarData, error: null, count: 1 })
          }))
        }))
      });
      
      const { result } = renderHook(() => useCalendarIntegration());

      let connectionStatus;
      await act(async () => {
        connectionStatus = await result.current.checkCalendarConnection();
      });

      expect(connectionStatus).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('calendar_integrations');
      expect(console.log).toHaveBeenCalledWith('Checking calendar integration for user:', mockUser.id);
      expect(console.log).toHaveBeenCalledWith('Calendar integration query result:', { 
        data: mockCalendarData, 
        error: null, 
        count: 1 
      });
    });

    it('should return false when user has no calendar integration', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 })
          }))
        }))
      });
      
      const { result } = renderHook(() => useCalendarIntegration());

      let connectionStatus;
      await act(async () => {
        connectionStatus = await result.current.checkCalendarConnection();
      });

      expect(connectionStatus).toBe(false);
    });

    it('should return false when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null } });
      
      const { result } = renderHook(() => useCalendarIntegration());

      let connectionStatus;
      await act(async () => {
        connectionStatus = await result.current.checkCalendarConnection();
      });

      expect(connectionStatus).toBe(false);
      expect(console.log).toHaveBeenCalledWith('No authenticated user found');
    });

    it('should handle database errors gracefully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } })
          }))
        }))
      });
      
      const { result } = renderHook(() => useCalendarIntegration());

      let connectionStatus;
      await act(async () => {
        connectionStatus = await result.current.checkCalendarConnection();
      });

      expect(connectionStatus).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error checking calendar integration:', { message: 'Database error' });
    });

    it('should handle unexpected errors in catch block', async () => {
      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Unexpected error'));
      
      const { result } = renderHook(() => useCalendarIntegration());

      let connectionStatus;
      await act(async () => {
        connectionStatus = await result.current.checkCalendarConnection();
      });

      expect(connectionStatus).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error in checkCalendarConnection:', expect.any(Error));
    });

    it('should properly query calendar_integrations table with correct filters', async () => {
      const mockEq2 = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 });
      const mockEq1 = vi.fn(() => ({ eq: mockEq2 }));
      const mockSelect = vi.fn(() => ({ eq: mockEq1 }));

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabaseClient.from.mockReturnValue({ select: mockSelect });
      
      const { result } = renderHook(() => useCalendarIntegration());

      await act(async () => {
        await result.current.checkCalendarConnection();
      });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('calendar_integrations');
      expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(mockEq1).toHaveBeenCalledWith('user_id', mockUser.id);
      expect(mockEq2).toHaveBeenCalledWith('is_active', true);
    });
  });

  describe('disconnectCalendar', () => {
    it('should successfully disconnect calendar', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({ error: null });
      const mockEq = vi.fn(() => ({ update: mockUpdate }));

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabaseClient.from.mockReturnValue({ update: vi.fn(() => ({ eq: mockEq })) });
      
      const { result } = renderHook(() => useCalendarIntegration());

      await act(async () => {
        await result.current.disconnectCalendar();
      });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('calendar_integrations');
      expect(mockToast).toHaveBeenCalledWith({
        title: "Calendar disconnected",
        description: "Your Google Calendar has been disconnected.",
      });
    });

    it('should handle disconnection when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null } });
      
      const { result } = renderHook(() => useCalendarIntegration());

      await act(async () => {
        await result.current.disconnectCalendar();
      });

      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('should handle database errors during disconnection', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } });
      const mockEq = vi.fn(() => ({ mockUpdate }));

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabaseClient.from.mockReturnValue({ 
        update: vi.fn(() => ({ 
          eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
        }))
      });
      
      const { result } = renderHook(() => useCalendarIntegration());

      await act(async () => {
        await result.current.disconnectCalendar();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Disconnection failed",
        description: "Failed to disconnect calendar. Please try again.",
        variant: "destructive",
      });
    });

    it('should handle unexpected errors during disconnection', async () => {
      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Unexpected error'));
      
      const { result } = renderHook(() => useCalendarIntegration());

      await act(async () => {
        await result.current.disconnectCalendar();
      });

      expect(console.error).toHaveBeenCalledWith('Error disconnecting calendar:', expect.any(Error));
      expect(mockToast).toHaveBeenCalledWith({
        title: "Disconnection failed",
        description: "Failed to disconnect calendar. Please try again.",
        variant: "destructive",
      });
    });

    it('should properly update calendar_integrations table', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn(() => ({ eq: mockEq }));

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabaseClient.from.mockReturnValue({ update: mockUpdate });
      
      const { result } = renderHook(() => useCalendarIntegration());

      await act(async () => {
        await result.current.disconnectCalendar();
      });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('calendar_integrations');
      expect(mockUpdate).toHaveBeenCalledWith({ is_active: false });
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUser.id);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete connection workflow', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      
      const { result } = renderHook(() => useCalendarIntegration());

      // Initial state
      expect(result.current.isConnecting).toBe(false);

      // Start connection
      await act(async () => {
        result.current.connectGoogleCalendar();
      });

      // Should have opened OAuth window and shown success toast
      expect(window.open).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({
        title: "Calendar connection initiated",
        description: "Please complete the authorization in the new window.",
      });
      expect(result.current.isConnecting).toBe(false);
    });

    it('should handle connection check after successful connection', async () => {
      const mockCalendarData = [
        { id: 1, user_id: mockUser.id, is_active: true, provider: 'google' }
      ];

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ data: mockCalendarData, error: null, count: 1 })
          }))
        }))
      });
      
      const { result } = renderHook(() => useCalendarIntegration());

      let isConnected;
      await act(async () => {
        isConnected = await result.current.checkCalendarConnection();
      });

      expect(isConnected).toBe(true);
    });

    it('should handle complete disconnection workflow', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
      mockSupabaseClient.from.mockReturnValue({ 
        update: vi.fn(() => ({ 
          eq: vi.fn().mockResolvedValue({ error: null })
        }))
      });
      
      const { result } = renderHook(() => useCalendarIntegration());

      await act(async () => {
        await result.current.disconnectCalendar();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Calendar disconnected",
        description: "Your Google Calendar has been disconnected.",
      });
    });
  });
});