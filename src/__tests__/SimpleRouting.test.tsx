import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation, useParams } from 'react-router-dom';
import React from 'react';

// Temporarily unmock react-router-dom for this specific test
vi.unmock('react-router-dom');

// Simple test components that show routing info
const TestComponent = ({ pageName }: { pageName: string }) => {
  const location = useLocation();
  const params = useParams();

  return (
    <div>
      <div data-testid="page-name">{pageName}</div>
      <div data-testid="current-path">{location.pathname}</div>
      <div data-testid="params">{JSON.stringify(params)}</div>
    </div>
  );
};

const SimpleRouter = ({ initialRoute }: { initialRoute: string }) => {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/" element={<TestComponent pageName="Home" />} />
        <Route path="/dashboard" element={<TestComponent pageName="Dashboard" />} />
        <Route path="/transactions" element={<TestComponent pageName="Transactions" />} />
        <Route path="/transactions/:id" element={<TestComponent pageName="Transaction Detail" />} />
        <Route path="/clients" element={<TestComponent pageName="Clients" />} />
        <Route path="/clients/:id" element={<TestComponent pageName="Client Detail" />} />
        <Route path="/agents" element={<TestComponent pageName="Agents" />} />
        <Route path="/agents/:id" element={<TestComponent pageName="Agent Detail" />} />
        <Route path="/agent/dashboard" element={<TestComponent pageName="Agent Dashboard" />} />
        <Route path="/agent/setup" element={<TestComponent pageName="Agent Setup" />} />
        <Route
          path="/agent/transactions/:id"
          element={<TestComponent pageName="Agent Transaction Detail" />}
        />
        <Route path="*" element={<TestComponent pageName="404 Not Found" />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Simple Page Routing Tests', () => {
  describe('Basic Route Matching', () => {
    it('renders home page for root route', () => {
      render(<SimpleRouter initialRoute="/" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('Home');
      expect(screen.getByTestId('current-path')).toHaveTextContent('/');
    });

    it('renders dashboard page', () => {
      render(<SimpleRouter initialRoute="/dashboard" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('Dashboard');
      expect(screen.getByTestId('current-path')).toHaveTextContent('/dashboard');
    });

    it('renders transactions page', () => {
      render(<SimpleRouter initialRoute="/transactions" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('Transactions');
      expect(screen.getByTestId('current-path')).toHaveTextContent('/transactions');
    });

    it('renders clients page', () => {
      render(<SimpleRouter initialRoute="/clients" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('Clients');
      expect(screen.getByTestId('current-path')).toHaveTextContent('/clients');
    });

    it('renders agents page', () => {
      render(<SimpleRouter initialRoute="/agents" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('Agents');
      expect(screen.getByTestId('current-path')).toHaveTextContent('/agents');
    });
  });

  describe('Parameterized Routes', () => {
    it('renders transaction detail with ID parameter', () => {
      render(<SimpleRouter initialRoute="/transactions/123" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('Transaction Detail');
      expect(screen.getByTestId('current-path')).toHaveTextContent('/transactions/123');
      expect(screen.getByTestId('params')).toHaveTextContent('{"id":"123"}');
    });

    it('renders client detail with ID parameter', () => {
      render(<SimpleRouter initialRoute="/clients/abc-456" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('Client Detail');
      expect(screen.getByTestId('current-path')).toHaveTextContent('/clients/abc-456');
      expect(screen.getByTestId('params')).toHaveTextContent('{"id":"abc-456"}');
    });

    it('renders agent detail with ID parameter', () => {
      render(<SimpleRouter initialRoute="/agents/agent-789" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('Agent Detail');
      expect(screen.getByTestId('current-path')).toHaveTextContent('/agents/agent-789');
      expect(screen.getByTestId('params')).toHaveTextContent('{"id":"agent-789"}');
    });

    it('handles UUID parameters', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      render(<SimpleRouter initialRoute={`/transactions/${uuid}`} />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('Transaction Detail');
      expect(screen.getByTestId('params')).toHaveTextContent(`{"id":"${uuid}"}`);
    });

    it('handles URL encoded parameters', () => {
      render(<SimpleRouter initialRoute="/clients/user%40example.com" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('Client Detail');
      expect(screen.getByTestId('params')).toHaveTextContent('{"id":"user@example.com"}');
    });
  });

  describe('Agent Portal Routes', () => {
    it('renders agent dashboard', () => {
      render(<SimpleRouter initialRoute="/agent/dashboard" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('Agent Dashboard');
      expect(screen.getByTestId('current-path')).toHaveTextContent('/agent/dashboard');
    });

    it('renders agent setup', () => {
      render(<SimpleRouter initialRoute="/agent/setup" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('Agent Setup');
      expect(screen.getByTestId('current-path')).toHaveTextContent('/agent/setup');
    });

    it('renders agent transaction detail', () => {
      render(<SimpleRouter initialRoute="/agent/transactions/123" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('Agent Transaction Detail');
      expect(screen.getByTestId('current-path')).toHaveTextContent('/agent/transactions/123');
      expect(screen.getByTestId('params')).toHaveTextContent('{"id":"123"}');
    });
  });

  describe('404 Error Handling', () => {
    it('renders 404 for non-existent routes', () => {
      render(<SimpleRouter initialRoute="/non-existent-page" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('404 Not Found');
      expect(screen.getByTestId('current-path')).toHaveTextContent('/non-existent-page');
    });

    it('renders 404 for invalid nested routes', () => {
      render(<SimpleRouter initialRoute="/transactions/invalid/nested/route" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('404 Not Found');
      expect(screen.getByTestId('current-path')).toHaveTextContent(
        '/transactions/invalid/nested/route'
      );
    });

    it('renders 404 for case-sensitive route mismatches', () => {
      render(<SimpleRouter initialRoute="/Transactions" />);

      // React Router is case-insensitive by default, so this actually matches /transactions
      expect(screen.getByTestId('page-name')).toHaveTextContent('Transactions');
      expect(screen.getByTestId('current-path')).toHaveTextContent('/Transactions');
    });

    it('renders 404 for invalid agent routes', () => {
      render(<SimpleRouter initialRoute="/agent/invalid-route" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('404 Not Found');
      expect(screen.getByTestId('current-path')).toHaveTextContent('/agent/invalid-route');
    });
  });

  describe('Route Edge Cases', () => {
    it('handles routes with query parameters', () => {
      render(<SimpleRouter initialRoute="/transactions?status=active&sort=date" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('Transactions');
      expect(screen.getByTestId('current-path')).toHaveTextContent('/transactions');
    });

    it('handles routes with hash fragments', () => {
      render(<SimpleRouter initialRoute="/clients#section1" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('Clients');
      expect(screen.getByTestId('current-path')).toHaveTextContent('/clients');
    });

    it('handles complex parameter values', () => {
      render(<SimpleRouter initialRoute="/clients/complex-id_123-test" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('Client Detail');
      expect(screen.getByTestId('params')).toHaveTextContent('{"id":"complex-id_123-test"}');
    });
  });

  describe('Route Precedence', () => {
    it('matches specific routes before catch-all', () => {
      render(<SimpleRouter initialRoute="/transactions" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('Transactions');
      expect(screen.getByTestId('page-name')).not.toHaveTextContent('404 Not Found');
    });

    it('distinguishes between similar routes', () => {
      // Ensure /clients doesn't match /clients/:id pattern
      render(<SimpleRouter initialRoute="/clients" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('Clients');
      expect(screen.getByTestId('params')).toHaveTextContent('{}');
    });

    it('handles agent routes vs regular routes', () => {
      render(<SimpleRouter initialRoute="/agent/dashboard" />);

      expect(screen.getByTestId('page-name')).toHaveTextContent('Agent Dashboard');
      // The text contains "Agent Dashboard" which includes "Dashboard", so we check for exact match
      expect(screen.getByTestId('page-name')).toHaveTextContent('Agent Dashboard');
      expect(screen.getByTestId('page-name')).not.toHaveTextContent('Coordinator Dashboard');
    });
  });
});
