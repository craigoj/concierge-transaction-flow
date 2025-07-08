# 🚀 Developer Onboarding Guide

## Welcome to Concierge Transaction Flow!

This guide will get you up and running with the Concierge Transaction Flow development environment in under 15 minutes.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Docker** (optional, for full local environment) - [Download here](https://docker.com/)

### Recommended Tools
- **VS Code** with these extensions:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - Tailwind CSS IntelliSense
  - TypeScript Importer
  - GitLens
  - Thunder Client (for API testing)

---

## 🏁 Quick Start (5 minutes)

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/concierge-transaction-flow.git
cd concierge-transaction-flow
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# At minimum, you'll need Supabase credentials
```

### 4. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to see your application running!

---

## 🔧 Detailed Setup

### Environment Configuration

#### Required Environment Variables
```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Application Configuration
VITE_APP_NAME="Concierge Transaction Flow"
VITE_APP_VERSION=1.0.0
```

#### Optional Environment Variables
```env
# Monitoring (Optional)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_ENABLE_ANALYTICS=false

# Development Features
VITE_ENABLE_DEBUG=true
```

#### Getting Supabase Credentials
1. **Create Supabase Account**: [https://supabase.com/](https://supabase.com/)
2. **Create New Project**: Follow the setup wizard
3. **Get API Keys**: Project Settings → API → Copy URL and anon key
4. **Database Setup**: Run migrations (see Database Setup below)

### Database Setup

#### Option 1: Local Supabase (Recommended for Development)
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
npx supabase start

# Your local database will be available at:
# Database URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
```

#### Option 2: Remote Supabase
```bash
# Link to your remote project
npx supabase login
npx supabase link --project-ref your-project-id

# Run migrations
npx supabase db push
```

#### Database Migrations
```bash
# Apply all migrations
npx supabase db reset

# Create new migration
npx supabase migration new your_migration_name

# Generate TypeScript types
npx supabase gen types typescript --local > src/integrations/supabase/types.ts
```

---

## 🛠️ Development Workflow

### Code Quality & Standards

#### Pre-commit Hooks
We use Husky to run quality checks before every commit:
- **ESLint**: Code linting and error detection
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Tests**: Run affected tests
- **Security**: Check for potential secrets

#### Commit Message Format
We follow [Conventional Commits](https://www.conventionalcommits.org/):
```bash
# Format: type(scope): description
feat(auth): add user registration flow
fix(dashboard): resolve transaction loading issue
docs(readme): update installation instructions
test(auth): add unit tests for login component
```

#### Available Commands
```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check if code is formatted
npm run type-check       # Run TypeScript checking

# Testing
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Run tests with coverage
npm run test:ui          # Run tests with UI
npm run test:integration # Run integration tests

# Database
npx supabase start       # Start local Supabase
npx supabase stop        # Stop local Supabase
npx supabase status      # Check Supabase status
npx supabase db reset    # Reset local database
```

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── pages/              # Page components (routes)
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── utils.ts        # General utilities
│   ├── sentry.ts       # Error tracking
│   └── performance-monitoring.ts
├── integrations/       # Third-party integrations
│   └── supabase/       # Supabase client and types
└── test/               # Test utilities and fixtures
    ├── fixtures/       # Test data
    ├── utils/          # Test utilities
    └── mocks/          # API mocks
```

---

## 🧪 Testing

### Testing Strategy
- **Unit Tests**: Components and utilities
- **Integration Tests**: API interactions and complex workflows
- **E2E Tests**: Full user workflows
- **Visual Regression**: UI consistency
- **Accessibility**: WCAG compliance

### Running Tests
```bash
# Unit tests
npm run test                    # Watch mode
npm run test:run               # Single run
npm run test:coverage          # With coverage report

# Integration tests
npm run test:integration       # Database and API tests

# E2E tests (Playwright)
npx playwright test            # All E2E tests
npx playwright test --ui       # With UI mode
npx playwright test --debug    # Debug mode
```

### Writing Tests
```typescript
// Example unit test
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});

// Example integration test
import { createClient } from '@supabase/supabase-js';
import { testDatabaseHelpers } from '@/test/utils/database-test-helpers';

test('creates transaction successfully', async () => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({ title: 'Test Transaction' });
    
  expect(error).toBeNull();
  expect(data).toBeDefined();
});
```

---

## 🔍 Debugging

### Development Tools

#### VS Code Configuration
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

#### Browser DevTools
- **React DevTools**: [Install extension](https://reactjs.org/blog/2019/08/15/new-react-devtools.html)
- **Sentry**: Error tracking and performance monitoring
- **Network Tab**: API request debugging
- **Performance Tab**: Core Web Vitals analysis

#### Database Debugging
```bash
# Access local database
psql postgresql://postgres:postgres@localhost:54322/postgres

# View tables
\dt

# Check specific table
SELECT * FROM transactions LIMIT 5;

# Monitor real-time changes
npx supabase logs --db
```

#### API Debugging
```bash
# Test health endpoint
curl http://localhost:5173/api/health

# Test with authentication
curl -H "Authorization: Bearer your-token" \
     http://localhost:5173/api/transactions
```

---

## 🚀 Deployment

### Development Deployment
```bash
# Build and test locally
npm run build
npm run preview

# Deploy to Vercel (staging)
npm run deploy:staging
```

### Production Deployment
Deployment is automated via GitHub Actions:
1. **Push to main branch** triggers production deployment
2. **Pull requests** create preview deployments
3. **Manual deployment** via GitHub Actions workflow

---

## 📚 Learning Resources

### Core Technologies
- **React 18**: [Official Docs](https://reactjs.org/docs/getting-started.html)
- **TypeScript**: [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- **Tailwind CSS**: [Documentation](https://tailwindcss.com/docs)
- **Vite**: [Guide](https://vitejs.dev/guide/)
- **Supabase**: [Documentation](https://supabase.com/docs)

### UI Components
- **Radix UI**: [Documentation](https://www.radix-ui.com/docs)
- **shadcn/ui**: [Component Library](https://ui.shadcn.com/)
- **Lucide Icons**: [Icon Library](https://lucide.dev/)

### Testing
- **Vitest**: [Documentation](https://vitest.dev/)
- **Playwright**: [Documentation](https://playwright.dev/)
- **Testing Library**: [Documentation](https://testing-library.com/)

### Architecture
- **React Query**: [Documentation](https://tanstack.com/query/latest)
- **React Hook Form**: [Documentation](https://react-hook-form.com/)
- **Zod**: [Documentation](https://zod.dev/)

---

## 🆘 Getting Help

### Common Issues

#### "Module not found" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Database connection issues
```bash
# Reset local Supabase
npx supabase stop
npx supabase start

# Check status
npx supabase status
```

#### Build failures
```bash
# Check TypeScript errors
npm run type-check

# Check linting errors
npm run lint

# Clear cache and rebuild
rm -rf dist .vite
npm run build
```

#### Git hook failures
```bash
# Skip hooks temporarily (not recommended)
git commit --no-verify

# Fix formatting issues
npm run format
npm run lint:fix
```

### Getting Support

1. **Documentation**: Check this guide and linked resources
2. **GitHub Issues**: Search existing issues or create new ones
3. **Team Chat**: Use designated development channels
4. **Code Review**: Ask for help in pull requests

---

## 🎯 Next Steps

### First Week Goals
1. **Set up development environment** ✅
2. **Complete a small bug fix** - Pick from "good first issue" labels
3. **Submit your first PR** - Follow our PR template
4. **Understand the codebase** - Read through core components

### Ongoing Learning
1. **Attend team meetings** - Daily standups and sprint planning
2. **Review code regularly** - Learn from team members' PRs
3. **Contribute to documentation** - Help improve this guide
4. **Suggest improvements** - Share ideas for better DX

---

**Welcome to the team! 🎉**

Remember: It's better to ask questions early than to struggle alone. We're here to help you succeed!

---

*Last updated: January 6, 2025*