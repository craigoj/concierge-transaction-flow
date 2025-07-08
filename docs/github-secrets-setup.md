# GitHub Secrets Setup Guide

This document outlines the required GitHub Secrets for the Concierge Transaction Flow CI/CD pipeline.

## Required Secrets

### 🔐 **Supabase Configuration**

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for edge functions) | `eyJhbGciOiJIUzI1NiIsInR5...` |

### 🔐 **Security & Encryption**

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VITE_ENCRYPTION_KEY` | Client-side encryption key (min 16 chars) | `your-secure-encryption-key-32-chars` |
| `ENCRYPTION_KEY` | Server-side encryption key (min 16 chars) | `your-server-encryption-key-32-chars` |
| `JWT_SECRET` | JWT secret for token signing (min 32 chars) | `your-jwt-secret-at-least-32-characters` |

### 🔐 **Monitoring & Error Tracking**

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VITE_SENTRY_DSN` | Sentry DSN for error tracking | `https://examplePublicKey@o0.ingest.sentry.io/0` |
| `VITE_VERCEL_ANALYTICS_ID` | Vercel Analytics ID | `your-analytics-id` |

### 🔐 **Email Service**

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `RESEND_API_KEY` | Resend API key for email service | `re_123456789_abcdefghijklmnopqrstuvwxyz` |

### 🔐 **Deployment**

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VERCEL_TOKEN` | Vercel deployment token | `your-vercel-token` |
| `VERCEL_ORG_ID` | Vercel organization ID | `your-org-id` |
| `VERCEL_PROJECT_ID` | Vercel project ID | `your-project-id` |

### 🔐 **Testing & Quality**

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `CODECOV_TOKEN` | Codecov token for test coverage | `your-codecov-token` |

## Environment-Specific Variables

### Production Environment
```bash
# Production values (secure)
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
VITE_ENABLE_SENTRY=true
VITE_APP_URL=https://your-production-domain.com
```

### Staging Environment
```bash
# Staging values (for testing)
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=true
VITE_ENABLE_SENTRY=true
VITE_APP_URL=https://staging-your-domain.com
```

## Setup Instructions

### 1. Access GitHub Secrets
1. Go to your GitHub repository
2. Navigate to `Settings` → `Secrets and variables` → `Actions`
3. Click `New repository secret`

### 2. Add Required Secrets
Add each secret from the tables above with the corresponding values from your services.

### 3. Environment-Specific Secrets

For staging vs production deployments, you can use GitHub Environments:

1. Go to `Settings` → `Environments`
2. Create environments: `production` and `staging`
3. Add environment-specific secrets to each environment

### 4. Verify Setup
After adding all secrets, push to the main branch to trigger the CI/CD pipeline and verify all secrets are properly configured.

## Security Best Practices

1. **Never commit secrets to your repository**
2. **Use environment-specific keys** for staging vs production
3. **Rotate keys regularly** especially for production
4. **Use least privilege** - only grant necessary permissions
5. **Monitor secret usage** through GitHub's audit logs

## Troubleshooting

### Common Issues

1. **Build fails with "Missing environment variable"**
   - Check that all required secrets are added to GitHub
   - Verify secret names match exactly (case-sensitive)

2. **Deployment fails**
   - Verify Vercel tokens and IDs are correct
   - Check that the Vercel project is properly configured

3. **Email sending fails**
   - Verify Resend API key is active and has proper permissions
   - Check edge function logs in Supabase

### Validation Commands

Run these commands locally to test your environment setup:

```bash
# Test environment validation
npm run dev

# Test build with environment variables
npm run build

# Test edge functions (requires Supabase CLI)
npx supabase functions serve
```

## Next Steps

After setting up GitHub Secrets:
1. Test the CI/CD pipeline with a test commit
2. Verify deployments work correctly
3. Monitor error tracking in Sentry
4. Test email functionality
5. Set up monitoring alerts