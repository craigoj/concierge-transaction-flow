# Staging Environment Setup Guide

This document outlines the staging environment setup for the Concierge Transaction Flow application.

## Overview

The staging environment provides a production-like testing environment that allows for:
- Testing new features before production deployment
- User acceptance testing (UAT)
- Integration testing with real APIs
- Performance testing under production-like conditions

## Architecture

### Environment Configuration
- **Environment**: `staging`
- **Branch**: `staging`
- **Domain**: `staging-concierge.vercel.app` (or custom domain)
- **Database**: Separate Supabase staging project
- **Monitoring**: Sentry with staging environment tag

## Required Environment Variables

### Staging-Specific Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL_STAGING` | Staging Supabase URL | `https://staging-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY_STAGING` | Staging Supabase anon key | `eyJ...` |
| `VITE_APP_URL_STAGING` | Staging application URL | `https://staging-concierge.vercel.app` |
| `VITE_SENTRY_DSN_STAGING` | Staging Sentry DSN | `https://...@sentry.io/...` |
| `VITE_ENCRYPTION_KEY_STAGING` | Staging encryption key | `staging-encryption-key-32-chars` |
| `RESEND_API_KEY_STAGING` | Staging Resend API key | `re_staging_...` |
| `ENCRYPTION_KEY_STAGING` | Server encryption key | `server-staging-key-32-chars` |
| `JWT_SECRET_STAGING` | JWT secret for staging | `staging-jwt-secret-32-chars` |

### Deployment Variables

| Variable | Description |
|----------|-------------|
| `VERCEL_TOKEN` | Vercel deployment token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID (staging) |

## Setup Instructions

### 1. Create Staging Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project for staging
3. Copy the URL and anon key
4. Run database migrations:
   ```bash
   # Set staging project
   npx supabase link --project-ref YOUR_STAGING_PROJECT_REF
   
   # Push schema
   npx supabase db push
   
   # Deploy edge functions
   npx supabase functions deploy
   ```

### 2. Configure Vercel Project

1. Create a new Vercel project for staging (or use the same project with environment-specific variables)
2. Set environment variables in Vercel dashboard
3. Configure custom domain if needed

### 3. Set Up GitHub Environments

1. Go to GitHub repository → Settings → Environments
2. Create `staging` environment
3. Add staging-specific secrets
4. Configure deployment protection rules if needed

### 4. Configure CI/CD

The CI/CD pipeline already supports staging deployment:
- Push to `staging` branch triggers staging deployment
- Environment-specific variables are used based on branch

## Deployment Methods

### Method 1: Automatic Deployment (Recommended)

Push to the staging branch:
```bash
git checkout staging
git merge main  # or feature branch
git push origin staging
```

The GitHub Actions pipeline will automatically:
1. Run tests and linting
2. Build the application with staging configuration
3. Deploy to Vercel staging environment

### Method 2: Manual Deployment

Use the staging deployment script:
```bash
# Set required environment variables
export VERCEL_TOKEN="your-token"
export VERCEL_ORG_ID="your-org-id"
export VERCEL_PROJECT_ID="your-project-id"
export VITE_SUPABASE_URL_STAGING="your-staging-url"
export VITE_SUPABASE_ANON_KEY_STAGING="your-staging-key"
export VITE_ENCRYPTION_KEY_STAGING="your-staging-encryption-key"

# Run deployment script
./scripts/deploy-staging.sh
```

### Method 3: Local Testing with Staging Config

Test staging configuration locally:
```bash
# Copy staging environment file
cp .env.staging .env.local

# Start development server
npm run dev
```

## Testing Strategy

### Pre-Deployment Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Security scans pass
- [ ] Performance tests pass

### Post-Deployment Testing
- [ ] Application loads correctly
- [ ] Authentication works
- [ ] Database operations work
- [ ] Email sending works
- [ ] Error monitoring is active
- [ ] Performance is acceptable

### Test Scenarios

1. **User Registration and Login**
   - Test new user registration
   - Test existing user login
   - Test password reset flow

2. **Agent Concierge Workflows**
   - Test agent intake form
   - Test vendor preferences
   - Test branding settings

3. **Transaction Management**
   - Create new transactions
   - Update transaction status
   - Test task management

4. **Communication System**
   - Test email templates
   - Test automated notifications
   - Test communication history

## Monitoring and Observability

### Error Tracking
- Sentry configured with `staging` environment tag
- Real-time error reporting
- Performance monitoring

### Logging
- Application logs available in Vercel dashboard
- Supabase logs for database operations
- Edge function logs for server-side operations

### Health Checks
- Application health endpoint: `/health`
- Database connectivity checks
- API service status monitoring

## Data Management

### Database
- Staging database is isolated from production
- Contains anonymized test data
- Regular backups maintained

### Data Seeding
Create test data for staging:
```bash
# Run seeding script (if available)
npm run seed:staging

# Or manually create test data through the UI
```

### Data Privacy
- No production data in staging
- All test data is anonymized
- Regular data cleanup scheduled

## Security Considerations

### Access Control
- Staging environment uses separate authentication
- Test accounts only
- No production credentials

### API Keys
- Separate API keys for all external services
- Staging-specific rate limits
- Monitoring for unusual activity

### Domain Security
- Staging domain protected if needed
- Basic auth can be configured
- IP restrictions available

## Troubleshooting

### Common Issues

1. **Deployment Fails**
   ```
   Error: Missing environment variable
   ```
   - Check all staging environment variables are set
   - Verify GitHub secrets are properly configured

2. **Database Connection Issues**
   ```
   Error: Failed to connect to Supabase
   ```
   - Verify staging Supabase URL and keys
   - Check Supabase project status

3. **Email Not Sending**
   ```
   Error: Resend API error
   ```
   - Verify staging Resend API key
   - Check Resend dashboard for issues

### Debug Commands

```bash
# Check environment variables
npm run env:check

# Test database connection
npm run db:test

# Test email service
npm run email:test

# Run health checks
npm run health:check
```

## Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Refresh test data quarterly
- [ ] Review and rotate API keys
- [ ] Monitor performance metrics
- [ ] Clean up old deployments

### Rollback Procedure
If staging deployment fails:
1. Check GitHub Actions logs
2. Verify environment variables
3. Rollback to previous version if needed:
   ```bash
   vercel rollback [deployment-url] --token $VERCEL_TOKEN
   ```

## Next Steps

After staging environment is set up:
1. Test complete user workflows
2. Perform load testing
3. Validate all integrations
4. Prepare for production deployment
5. Document any issues found