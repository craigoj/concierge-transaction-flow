# 🔧 Troubleshooting Guide

## Overview

This guide helps you diagnose and resolve common issues in the Concierge Transaction Flow application. Issues are organized by category with step-by-step solutions.

---

## 🚀 Development Environment Issues

### Node.js & NPM Issues

#### Problem: `npm install` fails
```bash
# Solution 1: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Solution 2: Check Node.js version
node --version  # Should be v18 or higher
npm --version   # Should be v8 or higher

# Solution 3: Use specific registry
npm install --registry https://registry.npmjs.org/
```

#### Problem: "Module not found" errors
```bash
# Solution 1: Clear module resolution cache
rm -rf node_modules/.cache
rm -rf .vite
npm install

# Solution 2: Check import paths
# Ensure you're using absolute imports with @/ prefix
# ❌ import { Button } from '../../../components/ui/button'
# ✅ import { Button } from '@/components/ui/button'

# Solution 3: Restart TypeScript server (VS Code)
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

#### Problem: TypeScript compilation errors
```bash
# Solution 1: Check TypeScript configuration
npm run type-check

# Solution 2: Update TypeScript types
npm install --save-dev @types/react@latest @types/react-dom@latest

# Solution 3: Clear TypeScript cache
rm -rf .tsbuildinfo
npm run type-check
```

### Vite Development Server Issues

#### Problem: Vite server won't start
```bash
# Solution 1: Check port availability
lsof -ti:5173  # Check if port is in use
kill -9 $(lsof -ti:5173)  # Kill process on port

# Solution 2: Clear Vite cache
rm -rf .vite
rm -rf node_modules/.vite
npm run dev

# Solution 3: Use different port
npm run dev -- --port 3000
```

#### Problem: Hot reload not working
```bash
# Solution 1: Check file watching limits (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Solution 2: Restart development server
npm run dev

# Solution 3: Check Vite configuration
# Ensure vite.config.ts has proper configuration
```

#### Problem: Build fails but dev server works
```bash
# Solution 1: Check for dynamic imports
npm run build 2>&1 | grep -i "dynamic import"

# Solution 2: Check environment variables
NODE_ENV=production npm run build

# Solution 3: Analyze bundle
npm run build
ls -la dist/assets/
```

---

## 🗄️ Database Issues

### Supabase Connection Issues

#### Problem: "Invalid API key" error
```bash
# Solution 1: Verify environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Solution 2: Check .env file
cat .env | grep SUPABASE

# Solution 3: Regenerate API keys
# Go to Supabase Dashboard → Settings → API
# Copy new anon key to .env file
```

#### Problem: Database connection timeout
```bash
# Solution 1: Check Supabase status
curl https://status.supabase.com/api/v2/status.json

# Solution 2: Test connection
npx supabase status  # For local
curl -H "apikey: your-anon-key" "https://your-project.supabase.co/rest/v1/"

# Solution 3: Check network connectivity
ping your-project.supabase.co
```

#### Problem: RLS (Row Level Security) permission denied
```sql
-- Solution 1: Check current user context
SELECT auth.uid(), auth.role();

-- Solution 2: Review RLS policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Solution 3: Test policy conditions
-- Check if your policy conditions match your data
SELECT * FROM your_table WHERE your_condition = 'expected_value';
```

### Local Supabase Issues

#### Problem: Local Supabase won't start
```bash
# Solution 1: Check Docker status
docker ps
docker system prune  # Clean up if needed

# Solution 2: Reset local Supabase
npx supabase stop
npx supabase start

# Solution 3: Check ports
lsof -i :54321  # API port
lsof -i :54322  # Database port
lsof -i :54323  # Studio port
```

#### Problem: Migrations fail
```bash
# Solution 1: Check migration files
ls supabase/migrations/
cat supabase/migrations/latest_migration.sql

# Solution 2: Reset and reapply
npx supabase db reset
npx supabase migration repair

# Solution 3: Manual migration
npx supabase db push --dry-run
npx supabase db push
```

#### Problem: Seed data issues
```bash
# Solution 1: Check seed file
cat supabase/seed.sql

# Solution 2: Apply seed manually
npx supabase db reset --with-seed

# Solution 3: Debug seed queries
psql postgresql://postgres:postgres@localhost:54322/postgres
\i supabase/seed.sql
```

---

## 🔐 Authentication Issues

### User Authentication Problems

#### Problem: User can't log in
```typescript
// Solution 1: Check authentication flow
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

if (error) {
  console.error('Auth error:', error.message);
  // Check error.message for specific issue
}
```

#### Problem: "Email not confirmed" error
```bash
# Solution 1: Check email confirmation settings
# Supabase Dashboard → Authentication → Settings
# Ensure "Enable email confirmations" is configured correctly

# Solution 2: Manually confirm user (development)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'user@example.com';
```

#### Problem: Session expires unexpectedly
```typescript
// Solution 1: Check session refresh
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Session refreshed:', session);
  }
  if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});

// Solution 2: Manual session refresh
const { data, error } = await supabase.auth.refreshSession();
```

### Role-Based Access Issues

#### Problem: User has wrong role/permissions
```sql
-- Solution 1: Check user roles
SELECT id, email, raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'user@example.com';

-- Solution 2: Update user role
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "coordinator"}'::jsonb
WHERE email = 'user@example.com';
```

#### Problem: Protected routes not working
```typescript
// Solution 1: Check ProtectedRoute component
// Ensure user and role are properly checked
const user = useAuth();
console.log('Current user:', user);
console.log('User role:', user?.user_metadata?.role);

// Solution 2: Clear auth state and re-login
localStorage.clear();
sessionStorage.clear();
// Then refresh page and login again
```

---

## 🎨 UI/Frontend Issues

### Component Rendering Issues

#### Problem: Components not displaying correctly
```bash
# Solution 1: Check Tailwind CSS compilation
npm run build
# Look for CSS compilation errors

# Solution 2: Verify shadcn/ui components
npx shadcn-ui@latest add button  # Reinstall component

# Solution 3: Check component imports
# Ensure proper import paths for ui components
```

#### Problem: Styling not applied
```bash
# Solution 1: Check Tailwind configuration
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch

# Solution 2: Verify CSS imports
# Check if index.css is properly imported in main.tsx

# Solution 3: Clear style cache
rm -rf .vite
npm run dev
```

#### Problem: React hooks errors
```typescript
// Solution 1: Check hooks rules
// Ensure hooks are called at component top level
// ❌ Conditional hook usage
if (condition) {
  const [state] = useState();
}

// ✅ Proper hook usage
const [state] = useState();
if (condition) {
  // Use state
}

// Solution 2: Check React version compatibility
npm list react react-dom
```

### Form Issues

#### Problem: React Hook Form validation not working
```typescript
// Solution 1: Check form schema
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password too short')
});

// Solution 2: Verify resolver setup
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { email: '', password: '' }
});

// Solution 3: Check form errors
console.log('Form errors:', form.formState.errors);
```

#### Problem: Form submission fails
```typescript
// Solution 1: Check onSubmit handler
const onSubmit = async (data: FormData) => {
  try {
    console.log('Submitting:', data);
    const result = await submitData(data);
    console.log('Success:', result);
  } catch (error) {
    console.error('Submit error:', error);
  }
};

// Solution 2: Verify form data
// Use React DevTools to inspect form state
```

---

## 🧪 Testing Issues

### Test Failures

#### Problem: Tests won't run
```bash
# Solution 1: Check test configuration
npm run test:run
cat vitest.config.ts

# Solution 2: Clear test cache
rm -rf node_modules/.vitest
npm run test:run

# Solution 3: Check test file extensions
# Ensure test files end with .test.tsx or .spec.tsx
```

#### Problem: "ReferenceError: fetch is not defined"
```typescript
// Solution 1: Add fetch polyfill to test setup
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts']
  }
});

// src/test/setup.ts
import { vi } from 'vitest';
global.fetch = vi.fn();
```

#### Problem: Database tests fail
```bash
# Solution 1: Check test database
TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:54322/test_db"

# Solution 2: Reset test database
npx supabase db reset --local

# Solution 3: Check test isolation
# Ensure tests clean up after themselves
afterEach(async () => {
  await cleanupTestData();
});
```

### E2E Test Issues

#### Problem: Playwright tests fail
```bash
# Solution 1: Install browsers
npx playwright install

# Solution 2: Check test environment
npm run test:e2e -- --debug

# Solution 3: Update Playwright
npm install --save-dev @playwright/test@latest
npx playwright install
```

#### Problem: Tests timeout
```typescript
// Solution 1: Increase timeout
// playwright.config.ts
export default defineConfig({
  timeout: 30000,  // 30 seconds
  use: {
    navigationTimeout: 30000,
  }
});

// Solution 2: Wait for specific elements
await page.waitForSelector('[data-testid="dashboard"]');
await page.waitForLoadState('networkidle');
```

---

## 🚀 Build & Deployment Issues

### Build Failures

#### Problem: "Out of memory" during build
```bash
# Solution 1: Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Solution 2: Check bundle size
npm run build
ls -lah dist/assets/

# Solution 3: Optimize imports
# Use dynamic imports for large libraries
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

#### Problem: Environment variables not available
```bash
# Solution 1: Check variable names
# Vite requires VITE_ prefix for client-side variables
VITE_API_URL=http://localhost:3000

# Solution 2: Verify build environment
NODE_ENV=production npm run build

# Solution 3: Check Vercel environment
vercel env ls
vercel env pull .env.production
```

### Deployment Issues

#### Problem: Vercel deployment fails
```bash
# Solution 1: Check build logs
vercel logs deployment-url

# Solution 2: Test build locally
npm run build
npm run preview

# Solution 3: Check Vercel configuration
cat vercel.json
```

#### Problem: API routes not working in production
```bash
# Solution 1: Check API route structure
# Ensure files are in /api/ directory
ls api/

# Solution 2: Verify function exports
# API files must have default export
export default function handler(req, res) {
  // Handler code
}

# Solution 3: Check runtime configuration
// api/your-endpoint.ts
export const config = {
  runtime: 'nodejs18.x'
};
```

---

## 🔍 Performance Issues

### Slow Application Performance

#### Problem: Slow page loads
```bash
# Solution 1: Analyze bundle size
npm run build
npx bundlesize

# Solution 2: Check Core Web Vitals
npx lighthouse http://localhost:5173 --output=json

# Solution 3: Enable React Profiler
# Wrap components with React.Profiler in development
```

#### Problem: Memory leaks
```typescript
// Solution 1: Check for cleanup in useEffect
useEffect(() => {
  const subscription = api.subscribe();
  
  return () => {
    subscription.unsubscribe(); // Cleanup
  };
}, []);

// Solution 2: Monitor memory usage
// Use browser DevTools → Memory tab
// Take heap snapshots to identify leaks
```

#### Problem: Slow database queries
```sql
-- Solution 1: Analyze query performance
EXPLAIN ANALYZE SELECT * FROM transactions WHERE user_id = $1;

-- Solution 2: Check indexes
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'transactions';

-- Solution 3: Add missing indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
```

---

## 🔒 Security Issues

### CORS Issues

#### Problem: "CORS policy" errors
```typescript
// Solution 1: Check Supabase CORS settings
// Supabase Dashboard → Settings → API → CORS Origins

// Solution 2: Verify request headers
const { data, error } = await supabase
  .from('table')
  .select('*')
  .headers({
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  });
```

#### Problem: "Unauthorized" API responses
```bash
# Solution 1: Check authentication headers
curl -H "Authorization: Bearer your-token" \
     -H "apikey: your-anon-key" \
     "https://your-project.supabase.co/rest/v1/table"

# Solution 2: Verify JWT token
# Decode token at jwt.io to check expiration and payload
```

---

## 🛠️ Development Tools Issues

### Git Hooks Issues

#### Problem: Pre-commit hooks fail
```bash
# Solution 1: Check hook permissions
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg

# Solution 2: Fix linting errors
npm run lint:fix
npm run format

# Solution 3: Skip hooks temporarily (emergency only)
git commit --no-verify -m "Emergency fix"
```

#### Problem: Commit message validation fails
```bash
# Solution 1: Use conventional commit format
# feat: add new user registration flow
# fix: resolve dashboard loading issue
# docs: update installation guide

# Solution 2: Check commitlint configuration
cat commitlint.config.js

# Solution 3: Bypass validation (not recommended)
git commit --no-verify
```

### VS Code Issues

#### Problem: TypeScript not working in VS Code
```bash
# Solution 1: Restart TypeScript server
# Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Solution 2: Check workspace settings
cat .vscode/settings.json

# Solution 3: Reload VS Code window
# Ctrl+Shift+P → "Developer: Reload Window"
```

---

## 📞 Getting Additional Help

### Debug Information Collection

#### System Information
```bash
# Collect system info for bug reports
node --version
npm --version
git --version
docker --version

# Project information
npm list --depth=0
cat package.json | grep version
```

#### Application Logs
```bash
# Browser console logs
# Open DevTools → Console
# Copy any error messages

# Server logs (Vercel)
vercel logs

# Database logs (Supabase)
npx supabase logs --db
```

### Support Channels

1. **Documentation**: Check official docs first
   - [React](https://reactjs.org/docs/)
   - [Vite](https://vitejs.dev/guide/)
   - [Supabase](https://supabase.com/docs)
   - [Vercel](https://vercel.com/docs)

2. **GitHub Issues**: Search existing issues or create new ones
   - Include system information
   - Provide reproduction steps
   - Attach relevant logs

3. **Community Support**
   - Stack Overflow (use relevant tags)
   - Discord/Slack channels
   - Reddit communities

4. **Emergency Escalation**
   - Contact team lead for critical production issues
   - Follow incident response procedures
   - Document issues for post-mortem review

---

## 🔄 Quick Reference

### Common Commands
```bash
# Reset everything
rm -rf node_modules package-lock.json .vite
npm install

# Check health
npm run type-check
npm run lint
npm run test:run
npm run build

# Debug database
npx supabase status
npx supabase logs

# Debug deployment
vercel logs
vercel inspect deployment-url
```

### Useful Environment Variables
```bash
# Debug mode
VITE_ENABLE_DEBUG=true
DEBUG=vite:*

# Skip checks (development only)
SKIP_PREFLIGHT_CHECK=true
DISABLE_ESLINT_PLUGIN=true
```

---

*Last updated: January 6, 2025*

**Remember**: When in doubt, check the logs first, then search existing issues, and don't hesitate to ask for help!