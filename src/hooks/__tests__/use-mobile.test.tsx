import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@/test/test-utils'
import { useIsMobile } from '../use-mobile'

describe('useIsMobile', () => {
  let originalInnerWidth: number
  let mockMatchMedia: ReturnType<typeof vi.fn>

  beforeEach(() => {
    originalInnerWidth = window.innerWidth
    mockMatchMedia = vi.fn()
    
    // Mock matchMedia
    window.matchMedia = mockMatchMedia
  })

  afterEach(() => {
    // Restore original innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
    vi.clearAllMocks()
  })

  it('returns false for desktop width (>= 768px)', () => {
    // Mock desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const mockMql = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
    mockMatchMedia.mockReturnValue(mockMql)

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('returns true for mobile width (< 768px)', () => {
    // Mock mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    const mockMql = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
    mockMatchMedia.mockReturnValue(mockMql)

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('returns false for exactly 768px (breakpoint)', () => {
    // Mock exactly at breakpoint
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    const mockMql = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
    mockMatchMedia.mockReturnValue(mockMql)

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('sets up media query listener correctly', () => {
    const mockMql = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
    mockMatchMedia.mockReturnValue(mockMql)

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    renderHook(() => useIsMobile())

    // Should call matchMedia with correct query
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)')
    
    // Should add event listener
    expect(mockMql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('cleans up event listener on unmount', () => {
    const mockMql = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
    mockMatchMedia.mockReturnValue(mockMql)

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { unmount } = renderHook(() => useIsMobile())

    unmount()

    // Should remove event listener
    expect(mockMql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('responds to window resize through media query change', () => {
    let changeCallback: () => void
    const mockMql = {
      addEventListener: vi.fn((event, callback) => {
        if (event === 'change') {
          changeCallback = callback
        }
      }),
      removeEventListener: vi.fn(),
    }
    mockMatchMedia.mockReturnValue(mockMql)

    // Start with desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)

    // Simulate resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      changeCallback()
    })

    expect(result.current).toBe(true)
  })

  it('handles initial undefined state correctly', () => {
    const mockMql = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
    mockMatchMedia.mockReturnValue(mockMql)

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())

    // The hook uses !!isMobile, so undefined should become false
    expect(typeof result.current).toBe('boolean')
    expect(result.current).toBe(false)
  })
})