/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

afterEach(() => {
  cleanup();
});

const MockComponent = ({ children, ...props }: any) => React.createElement('div', props, children);

vi.mock('lucide-react', () => ({
  default: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Calendar: ({ children, ...props }: any) => React.createElement('svg', props, children),
  MapPin: ({ children, ...props }: any) => React.createElement('svg', props, children),
  User: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Loader2: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ChevronDown: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ChevronUp: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ChevronLeft: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ChevronRight: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Search: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Filter: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Plus: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Check: ({ children, ...props }: any) => React.createElement('svg', props, children),
  X: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Edit: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Trash2: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Home: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Building: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Settings: ({ children, ...props }: any) => React.createElement('svg', props, children),
  FileText: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Mail: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Phone: ({ children, ...props }: any) => React.createElement('svg', props, children),
  DollarSign: ({ children, ...props }: any) => React.createElement('svg', props, children),
  TrendingUp: ({ children, ...props }: any) => React.createElement('svg', props, children),
  TrendingDown: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ArrowUp: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ArrowDown: ({ children, ...props }: any) => React.createElement('svg', props, children),
  AlertTriangle: ({ children, ...props }: any) => React.createElement('svg', props, children),
  CheckCircle: ({ children, ...props }: any) => React.createElement('svg', props, children),
  CheckCircle2: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Clock: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Users: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Activity: ({ children, ...props }: any) => React.createElement('svg', props, children),
  BarChart: ({ children, ...props }: any) => React.createElement('svg', props, children),
  PieChart: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Eye: ({ children, ...props }: any) => React.createElement('svg', props, children),
  EyeOff: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Star: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Download: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Upload: ({ children, ...props }: any) => React.createElement('svg', props, children),
  RefreshCw: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Save: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Copy: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Share: ({ children, ...props }: any) => React.createElement('svg', props, children),
  ExternalLink: ({ children, ...props }: any) => React.createElement('svg', props, children),
  Menu: ({ children, ...props }: any) => React.createElement('svg', props, children),
  MoreHorizontal: ({ children, ...props }: any) => React.createElement('svg', props, children),
  MoreVertical: ({ children, ...props }: any) => React.createElement('svg', props, children),
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
  sanitize: vi.fn((input) => input),
}));

vi.mock('@/lib/security-utils', () => ({
  SecurityUtils: {
    sanitizeInput: vi.fn((input) => input),
    sanitizeEmail: vi.fn((input) => input),
    sanitizePhone: vi.fn((input) => input),
    sanitizeUrl: vi.fn((input) => input),
    hashForLogging: vi.fn((input) => input),
    validateDataIntegrity: vi.fn(() => ({ isValid: true, errors: [] })),
  },
  secureTextSchema: vi.fn(() => ({
    min: vi.fn().mockReturnThis(),
    max: vi.fn().mockReturnThis(),
    transform: vi.fn().mockImplementation((fn) => ({
      _is_zod_type: true,
      parse: (val: any) => fn(val),
      min: vi.fn().mockReturnThis(),
      max: vi.fn().mockReturnThis(),
      email: vi.fn().mockReturnThis(),
      url: vi.fn().mockReturnThis(),
      refine: vi.fn().mockReturnThis(),
    })),
    refine: vi.fn().mockReturnThis(),
  })),
  secureEmailSchema: vi.fn(() => ({
    email: vi.fn().mockReturnThis(),
    transform: vi.fn().mockImplementation((fn) => ({
      _is_zod_type: true,
      parse: (val: any) => fn(val),
      refine: vi.fn().mockReturnThis(),
    })),
    refine: vi.fn().mockReturnThis(),
  })),
  securePhoneSchema: vi.fn(() => ({
    min: vi.fn().mockReturnThis(),
    transform: vi.fn().mockImplementation((fn) => ({
      _is_zod_type: true,
      parse: (val: any) => fn(val),
      refine: vi.fn().mockReturnThis(),
    })),
    refine: vi.fn().mockReturnThis(),
  })),
  secureUrlSchema: vi.fn(() => ({
    url: vi.fn().mockReturnThis(),
    transform: vi.fn().mockImplementation((fn) => ({
      _is_zod_type: true,
      parse: (val: any) => fn(val),
      refine: vi.fn().mockReturnThis(),
    })),
    refine: vi.fn().mockReturnThis(),
  })),
  secureHtmlSchema: vi.fn(() => ({
    max: vi.fn().mockReturnThis(),
    transform: vi.fn().mockImplementation((fn) => ({
      _is_zod_type: true,
      parse: (val: any) => fn(val),
    })),
  })),
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
