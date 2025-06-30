
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

// Mock components for testing
const TestComponent = () => <div>Test Component</div>;
const NotFoundComponent = () => <div>404 Not Found</div>;
const ErrorFallback = ({ error }: { error: Error }) => (
  <div>Error: {error.message}</div>
);

// URL validation utility
const isValidURL = (url: string): boolean => {
  try {
    decodeURIComponent(url);
    return true;
  } catch {
    return false;
  }
};

// Route guard component
const RouteGuard = ({ children, path }: { children: React.ReactNode; path: string }) => {
  if (!isValidURL(path)) {
    throw new Error('URI malformed');
  }
  return <>{children}</>;
};

describe('Error Routing Tests', () => {
  const renderWithRouter = (initialRoute: string) => {
    return render(
      <BrowserRouter>
        <ErrorBoundary fallback={ErrorFallback}>
          <Routes>
            <Route
              path="/clients/:id"
              element={
                <RouteGuard path={window.location.pathname}>
                  <TestComponent />
                </RouteGuard>
              }
            />
            <Route path="*" element={<NotFoundComponent />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    );
  };

  it('should handle valid URLs correctly', () => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { pathname: '/clients/123' },
      writable: true
    });

    renderWithRouter('/clients/123');
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('should handle malformed URLs like /clients/%GG', () => {
    // Mock window.location with malformed URL
    Object.defineProperty(window, 'location', {
      value: { pathname: '/clients/%GG' },
      writable: true
    });

    renderWithRouter('/clients/%GG');
    expect(screen.getByText('Error: URI malformed')).toBeInTheDocument();
  });

  it('should validate URL encoding properly', () => {
    expect(isValidURL('/clients/123')).toBe(true);
    expect(isValidURL('/clients/%20')).toBe(true);
    expect(isValidURL('/clients/%GG')).toBe(false);
    expect(isValidURL('/clients/%ZZ')).toBe(false);
  });

  it('should handle special characters in URLs', () => {
    const validUrls = [
      '/clients/abc123',
      '/clients/user%20name',
      '/clients/test%2Buser'
    ];

    const invalidUrls = [
      '/clients/%GG',
      '/clients/%ZZ',
      '/clients/%XY'
    ];

    validUrls.forEach(url => {
      expect(isValidURL(url)).toBe(true);
    });

    invalidUrls.forEach(url => {
      expect(isValidURL(url)).toBe(false);
    });
  });

  it('should provide helpful error messages for malformed URIs', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/clients/%INVALID' },
      writable: true
    });

    renderWithRouter('/clients/%INVALID');
    
    const errorElement = screen.getByText(/Error: URI malformed/);
    expect(errorElement).toBeInTheDocument();
  });
});
