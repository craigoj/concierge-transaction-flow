/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

afterEach(() => {
  cleanup();
});

const MockComponent = ({ children, ...props }: any) => React.createElement('div', props, children);

vi.mock('lucide-react', () => ({
  default: ({ children, ...props }: any) => React.createElement('svg', props, children),
  LucideIcon: ({ children, ...props }: any) => React.createElement('svg', props, children),
  // Navigation & Layout
  Home: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ArrowLeft: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ArrowRight: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ArrowUp: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ArrowDown: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ArrowRightLeft: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ArrowUpRight: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ArrowDownRight: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ChevronDown: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ChevronUp: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ChevronLeft: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ChevronRight: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Menu: ({ children, ...props }: any) => React.createElement('svg', props, children),
  MoreHorizontal: ({ children, ...props }: any) => React.createElement('svg', props, children),
  MoreVertical: ({ children, ...props }: any) => React.createElement('svg', props, children),
  PanelLeft: ({ children, ...props }: any) => React.createElement('svg', props, children),

  // Search & Filter
  Search: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Filter: ({ children, ...props }: any) => React.createElement('svg', props, children),
  SlidersHorizontal: ({ children, ...props }: any) => React.createElement('svg', props, children),

  // Actions
  Plus: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Check: ({ children, ...props }: any) => React.createElement('svg', props, children),
  X: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Edit: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Edit3: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Trash2: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Copy: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Save: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Send: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Share: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Share2: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ExternalLink: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Download: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Upload: ({ children, ...props }: any) => React.createElement('svg', props, children),
  RefreshCw: ({ children, ...props }: any) => React.createElement('svg', props, children),

  // Status & Alerts
  AlertCircle: ({ children, ...props }: any) => React.createElement('svg', props, children),
  AlertTriangle: ({ children, ...props }: any) => React.createElement('svg', props, children),
  CheckCircle: ({ children, ...props }: any) => React.createElement('svg', props, children),
  CheckCircle2: ({ children, ...props }: any) => React.createElement('svg', props, children),
  CheckSquare: ({ children, ...props }: any) => React.createElement('svg', props, children),
  XCircle: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Clock: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Loader2: ({ children, ...props }: any) => React.createElement('svg', props, children),

  // Users & People
  User: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Users: ({ children, ...props }: any) => React.createElement('svg', props, children),
  UserPlus: ({ children, ...props }: any) => React.createElement('svg', props, children),
  UserCheck: ({ children, ...props }: any) => React.createElement('svg', props, children),
  UserX: ({ children, ...props }: any) => React.createElement('svg', props, children),
  UserCog: ({ children, ...props }: any) => React.createElement('svg', props, children),

  // Communication
  Mail: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Phone: ({ children, ...props }: any) => React.createElement('svg', props, children),
  MessageSquare: ({ children, ...props }: any) => React.createElement('svg', props, children),
  MessageCircle: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Bell: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Smartphone: ({ children, ...props }: any) => React.createElement('svg', props, children),

  // Buildings & Location
  Building: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Building2: ({ children, ...props }: any) => React.createElement('svg', props, children),
  MapPin: ({ children, ...props }: any) => React.createElement('svg', props, children),

  // Files & Documents
  File: ({ children, ...props }: any) => React.createElement('svg', props, children),
  FileText: ({ children, ...props }: any) => React.createElement('svg', props, children),
  FolderOpen: ({ children, ...props }: any) => React.createElement('svg', props, children),

  // Calendar & Time
  Calendar: ({ children, ...props }: any) => React.createElement('svg', props, children),
  CalendarIcon: ({ children, ...props }: any) => React.createElement('svg', props, children),
  CalendarDays: ({ children, ...props }: any) => React.createElement('svg', props, children),

  // Finance & Business
  DollarSign: ({ children, ...props }: any) => React.createElement('svg', props, children),
  TrendingUp: ({ children, ...props }: any) => React.createElement('svg', props, children),
  TrendingDown: ({ children, ...props }: any) => React.createElement('svg', props, children),

  // Charts & Analytics
  BarChart: ({ children, ...props }: any) => React.createElement('svg', props, children),
  BarChart3: ({ children, ...props }: any) => React.createElement('svg', props, children),
  PieChart: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Activity: ({ children, ...props }: any) => React.createElement('svg', props, children),

  // Visibility & Security
  Eye: ({ children, ...props }: any) => React.createElement('svg', props, children),
  EyeOff: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Shield: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ShieldCheck: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ShieldAlert: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Lock: ({ children, ...props }: any) => React.createElement('svg', props, children),

  // Premium & Special
  Star: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Crown: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Sparkles: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Award: ({ children, ...props }: any) => React.createElement('svg', props, children),

  // System & Settings
  Settings: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Zap: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Database: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Wifi: ({ children, ...props }: any) => React.createElement('svg', props, children),
  WifiOff: ({ children, ...props }: any) => React.createElement('svg', props, children),

  // Workflow & Automation
  Play: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Pause: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Workflow: ({ children, ...props }: any) => React.createElement('svg', props, children),
  RotateCcw: ({ children, ...props }: any) => React.createElement('svg', props, children),

  // Layout & Display
  Grid: ({ children, ...props }: any) => React.createElement('svg', props, children),
  List: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Columns: ({ children, ...props }: any) => React.createElement('svg', props, children),

  // Shapes & UI Elements
  Circle: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Dot: ({ children, ...props }: any) => React.createElement('svg', props, children),
  GripVertical: ({ children, ...props }: any) => React.createElement('svg', props, children),

  // Miscellaneous
  Target: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Heart: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Camera: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Archive: ({ children, ...props }: any) => React.createElement('svg', props, children),
  History: ({ children, ...props }: any) => React.createElement('svg', props, children),
  TestTube: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Info: ({ children, ...props }: any) => React.createElement('svg', props, children),
}));

// Mock @vibe/icons package
vi.mock('@vibe/icons', () => ({
  Date: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Group: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Billing: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Graph: ({ children, ...props }: any) => React.createElement('svg', props, children),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => React.createElement('div', props, children),
  CardContent: MockComponent,
  CardHeader: MockComponent,
  CardTitle: MockComponent,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: MockComponent,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => React.createElement('button', props, children),
}));

vi.mock('dompurify', () => ({
  sanitize: vi.fn((input: string, options?: any) => {
    if (!input || typeof input !== 'string') return '';

    // Simple sanitization for tests
    if (options?.ALLOWED_TAGS?.length === 0) {
      // Strip all HTML tags
      return input.replace(/<[^>]*>/g, '');
    }

    // Allow basic HTML tags
    return input;
  }),
}));

// Mock SecurityUtils for component tests - validation tests should run in isolation
vi.mock('@/lib/security-utils', () => ({
  SecurityUtils: {
    sanitizeInput: vi.fn((input) => {
      if (!input || typeof input !== 'string') return '';
      return input.replace(/<[^>]*>/g, ''); // Simple HTML stripping for tests
    }),
    sanitizeEmail: vi.fn((input) => input),
    sanitizePhone: vi.fn((input) => {
      if (!input || typeof input !== 'string') return '';
      // Simple phone formatting for tests
      const cleaned = input.replace(/[^\d+]/g, '');
      if (cleaned.length === 10) return '+1' + cleaned;
      if (cleaned.startsWith('+')) return cleaned;
      return '+1' + cleaned;
    }),
    sanitizeUrl: vi.fn((input) => input),
    hashForLogging: vi.fn((input) => input),
    validateDataIntegrity: vi.fn(() => ({ isValid: true, errors: [] })),
  },
  // Use passthrough for schemas so they work properly
  secureTextSchema: vi.fn(),
  secureEmailSchema: vi.fn(),
  securePhoneSchema: vi.fn(),
  secureUrlSchema: vi.fn(),
  secureHtmlSchema: vi.fn(),
}));

// Mock TanStack Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: true,
    refetch: vi.fn(),
  })),
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isLoading: false,
    isError: false,
    isSuccess: true,
    error: null,
    data: undefined,
    reset: vi.fn(),
  })),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
    refetchQueries: vi.fn(),
  })),
  QueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
    refetchQueries: vi.fn(),
  })),
  QueryClientProvider: ({ children }: any) => children,
}));

// Mock useDashboardMetrics hook
vi.mock('@/hooks/useDashboardMetrics', () => ({
  useDashboardMetrics: () => ({
    metrics: {
      activeTransactions: 24,
      pendingTransactions: 8,
      closingThisWeek: 3,
      totalClients: 89,
      monthlyRevenue: 12450,
      totalVolume: 156000,
      completionRate: 92,
      actionRequired: 5,
      incompleteTasks: 2,
    },
    isLoading: false,
    error: null,
    rawData: null,
  }),
}));

// Mock React Router
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  BrowserRouter: ({ children }: any) => children,
  MemoryRouter: ({ children }: any) => children,
  Routes: ({ children }: any) => children,
  Route: ({ children }: any) => children,
  Link: ({ children, to }: any) => React.createElement('a', { href: to }, children),
  NavLink: ({ children, to }: any) => React.createElement('a', { href: to }, children),
  Outlet: () => null,
}));

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
  }),
  AuthProvider: ({ children }: any) => children,
  AuthContext: React.createContext({
    user: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
  }),
}));

// Mock React Hook Form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(() => ({
      onChange: vi.fn(),
      onBlur: vi.fn(),
      ref: vi.fn(),
      name: 'test',
    })),
    handleSubmit: vi.fn((fn) => fn),
    formState: {
      errors: {},
      isDirty: false,
      isValid: true,
      isSubmitting: false,
      isLoading: false,
      isSubmitted: false,
      isSubmitSuccessful: false,
      submitCount: 0,
      touchedFields: {},
      dirtyFields: {},
    },
    watch: vi.fn(),
    getValues: vi.fn(() => ({})),
    setValue: vi.fn(),
    trigger: vi.fn(),
    clearErrors: vi.fn(),
    setError: vi.fn(),
    reset: vi.fn(),
    control: {},
  }),
  Controller: ({ render }: any) =>
    render({
      field: {
        onChange: vi.fn(),
        onBlur: vi.fn(),
        value: '',
        name: 'test',
        ref: vi.fn(),
      },
      fieldState: {
        invalid: false,
        isTouched: false,
        isDirty: false,
        error: undefined,
      },
    }),
  useController: () => ({
    field: {
      onChange: vi.fn(),
      onBlur: vi.fn(),
      value: '',
      name: 'test',
      ref: vi.fn(),
    },
    fieldState: {
      invalid: false,
      isTouched: false,
      isDirty: false,
      error: undefined,
    },
  }),
  useWatch: vi.fn(),
  useFormContext: () => ({
    register: vi.fn(),
    formState: { errors: {} },
    watch: vi.fn(),
    getValues: vi.fn(() => ({})),
    setValue: vi.fn(),
    control: {},
  }),
  FormProvider: ({ children }: any) => children,
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Suppress specific console warnings during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      args[0]?.includes?.('Warning: React.jsx: type is invalid') ||
      args[0]?.includes?.('Warning: validateDOMNesting') ||
      args[0]?.includes?.('Warning: Each child in a list should have a unique "key" prop')
    ) {
      return;
    }
    originalConsoleError(...args);
  };

  console.warn = (...args: any[]) => {
    if (
      args[0]?.includes?.('componentWillReceiveProps') ||
      args[0]?.includes?.('componentWillUpdate') ||
      args[0]?.includes?.('ResizeObserver loop limit exceeded')
    ) {
      return;
    }
    originalConsoleWarn(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
