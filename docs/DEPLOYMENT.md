# 🚀 Deployment Guide

## Overview

This guide covers the deployment process for the Concierge Transaction Flow application, including staging, production, and disaster recovery procedures.

---

## 🏗️ Deployment Architecture

### Environments
- **Development**: Local development with local Supabase
- **Staging**: Vercel preview deployments for testing
- **Production**: Vercel production deployment with production Supabase

### Infrastructure Stack
- **Frontend**: Vercel (Static hosting + Serverless functions)
- **Database**: Supabase (PostgreSQL + Auth + Real-time)
- **Monitoring**: Sentry + Vercel Analytics + Custom monitoring
- **CI/CD**: GitHub Actions
- **Domain**: Custom domain with SSL

---

## 🔧 Environment Setup

### Production Environment Variables

#### Required Variables
```env
# Application
NODE_ENV=production
VITE_APP_NAME="Concierge Transaction Flow"
VITE_APP_VERSION=1.0.0
VITE_APP_URL=https://your-domain.com

# Supabase Production
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Monitoring
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VERCEL_ANALYTICS_ID=your-vercel-analytics-id

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=true
VITE_ENABLE_DEBUG=false
```

#### Optional Variables
```env
# External Monitoring
UPTIME_ROBOT_API_KEY=your-uptime-robot-key
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your/webhook

# Performance Thresholds
PERFORMANCE_LCP_THRESHOLD=2500
PERFORMANCE_INP_THRESHOLD=200
PERFORMANCE_CLS_THRESHOLD=0.1
```

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm run test:run`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code formatted (`npm run format:check`)
- [ ] Build completes successfully (`npm run build`)

### Security
- [ ] No secrets in code or environment files
- [ ] Dependencies updated and audited (`npm audit`)
- [ ] Security scanning completed
- [ ] Environment variables configured correctly

### Performance
- [ ] Bundle size optimized (< 2MB main bundle)
- [ ] Core Web Vitals targets met
- [ ] Image optimization completed
- [ ] Lighthouse scores > 90

### Database
- [ ] Migrations tested in staging
- [ ] RLS policies validated
- [ ] Backup verification successful
- [ ] Data integrity checks passed

---

## 🚀 Deployment Process

### Automatic Deployment (Recommended)

#### Production Deployment
```bash
# 1. Merge to main branch (triggers automatic deployment)
git checkout main
git pull origin main

# 2. Create release tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 3. Monitor deployment in GitHub Actions
# 4. Verify deployment at https://your-domain.com
```

#### Staging Deployment
```bash
# 1. Create pull request (triggers preview deployment)
git checkout -b feature/your-feature
git push origin feature/your-feature

# 2. Open PR - preview deployment URL will be provided
# 3. Test in preview environment
# 4. Merge when ready
```

### Manual Deployment

#### Vercel CLI Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to staging
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls
vercel inspect your-deployment-url
```

#### Direct Git Deployment
```bash
# Force deployment from current branch
git push origin main --force-with-lease

# Deploy specific commit
git push origin commit-hash:main
```

---

## 🔍 Monitoring & Verification

### Post-Deployment Checks

#### Automated Health Checks
```bash
# Health endpoint
curl https://your-domain.com/api/health

# Monitoring dashboard
curl https://your-domain.com/api/monitoring-dashboard

# Backup verification
curl https://your-domain.com/api/backup-verification
```

#### Manual Verification
1. **Frontend Functionality**
   - [ ] Application loads correctly
   - [ ] Authentication flow works
   - [ ] Core features functional
   - [ ] No console errors

2. **API Endpoints**
   - [ ] Health checks responding
   - [ ] Database connections working
   - [ ] Performance monitoring active

3. **Monitoring Systems**
   - [ ] Sentry receiving events
   - [ ] Vercel Analytics active
   - [ ] Alert systems functional

#### Performance Validation
```bash
# Lighthouse audit
npx lighthouse https://your-domain.com --output=json

# Core Web Vitals check
npm run test:performance

# Load testing (optional)
npx autocannon https://your-domain.com
```

---

## 🚨 Rollback Procedures

### Automatic Rollback
```bash
# Rollback to previous deployment (Vercel)
vercel rollback

# Rollback to specific deployment
vercel rollback deployment-url
```

### Manual Rollback
```bash
# 1. Identify last known good commit
git log --oneline -10

# 2. Create rollback branch
git checkout -b rollback/emergency-fix
git reset --hard good-commit-hash

# 3. Deploy immediately
git push origin rollback/emergency-fix:main --force

# 4. Verify rollback successful
curl https://your-domain.com/api/health
```

### Database Rollback
```bash
# Rollback migrations (if needed)
npx supabase migration repair --status applied

# Restore from backup (if needed)
# Note: This should be done through Supabase dashboard
# or with proper backup restoration procedures
```

---

## 🔧 Environment-Specific Configuration

### Staging Environment
```env
# Staging-specific settings
NODE_ENV=staging
VITE_APP_URL=https://staging-your-domain.vercel.app
VITE_ENABLE_DEBUG=true
SENTRY_ENVIRONMENT=staging

# Use staging Supabase project
VITE_SUPABASE_URL=https://staging-project.supabase.co
```

### Production Environment
```env
# Production-specific settings
NODE_ENV=production
VITE_APP_URL=https://your-domain.com
VITE_ENABLE_DEBUG=false
SENTRY_ENVIRONMENT=production

# Use production Supabase project
VITE_SUPABASE_URL=https://prod-project.supabase.co
```

---

## 📊 Monitoring & Alerting

### Key Metrics to Monitor
- **Uptime**: > 99.9%
- **Response Time**: < 2 seconds
- **Error Rate**: < 0.1%
- **Core Web Vitals**: LCP < 2.5s, INP < 200ms, CLS < 0.1

### Alert Configuration
```yaml
# Example alert configuration
alerts:
  - name: "High Error Rate"
    condition: "error_rate > 1%"
    duration: "5 minutes"
    action: "slack_notification"
    
  - name: "Slow Response Time"
    condition: "response_time > 5000ms"
    duration: "2 minutes"
    action: "email_notification"
    
  - name: "Service Down"
    condition: "uptime < 99%"
    duration: "1 minute"
    action: "immediate_alert"
```

### Monitoring Dashboards
- **Vercel Dashboard**: https://vercel.com/your-org/concierge-transaction-flow
- **Sentry Dashboard**: https://sentry.io/organizations/your-org/projects/concierge/
- **Supabase Dashboard**: https://app.supabase.com/project/your-project
- **Custom Monitoring**: https://your-domain.com/api/monitoring-dashboard

---

## 🔐 Security Considerations

### SSL/TLS Configuration
- Automatic SSL certificates via Vercel
- HTTPS redirects enabled
- Security headers configured

### Environment Security
```bash
# Verify no secrets in repository
git log --all --grep="password\\|secret\\|key" --oneline

# Check environment variables
vercel env ls

# Audit dependencies
npm audit
npm audit fix
```

### Access Control
- GitHub repository access controls
- Vercel team permissions
- Supabase project access
- Monitoring service access

---

## 🛠️ Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Check build logs
vercel logs deployment-id

# Test build locally
npm run build
npm run preview

# Check for TypeScript errors
npm run type-check
```

#### Environment Variable Issues
```bash
# Verify environment variables
vercel env ls
vercel env pull .env.production

# Test with production variables
NODE_ENV=production npm run build
```

#### Database Connection Issues
```bash
# Test database connectivity
npx supabase status
npx supabase db ping

# Check RLS policies
npx supabase db dump --data-only --inserts
```

#### Performance Issues
```bash
# Analyze bundle size
npm run build
npx bundlesize

# Check Core Web Vitals
npx lighthouse https://your-domain.com

# Monitor in real-time
curl https://your-domain.com/api/monitoring-dashboard
```

### Emergency Procedures

#### Critical Bug in Production
1. **Immediate rollback**: `vercel rollback`
2. **Verify rollback**: Check health endpoints
3. **Create hotfix branch**: Fix issue quickly
4. **Deploy hotfix**: Fast-track through review
5. **Post-incident review**: Document and improve

#### Database Issues
1. **Check monitoring**: Review database health
2. **Contact Supabase support**: If platform issue
3. **Restore from backup**: If data corruption
4. **Update RLS policies**: If permission issues

#### Monitoring System Down
1. **Check external monitors**: Uptime Robot, Pingdom
2. **Verify application health**: Manual checks
3. **Enable backup monitoring**: Alternative systems
4. **Fix monitoring issues**: Restore full observability

---

## 📈 Performance Optimization

### Bundle Optimization
```bash
# Analyze bundle
npm run build
npx vite-bundle-analyzer dist

# Optimize chunks
# Configured in vite.config.ts with manual chunking
```

### Caching Strategy
```javascript
// Vercel configuration (vercel.json)
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Database Performance
```sql
-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, attname, avg_width, n_distinct
FROM pg_stats
WHERE tablename = 'transactions';
```

---

## 📚 Additional Resources

### Documentation Links
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Production Guide](https://supabase.com/docs/guides/platform/going-to-prod)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Sentry Deployment Tracking](https://docs.sentry.io/product/releases/)

### Best Practices
- [Vercel Best Practices](https://vercel.com/docs/concepts/next.js/best-practices)
- [React Production Build](https://reactjs.org/docs/optimizing-performance.html)
- [Web Performance](https://web.dev/performance/)
- [Security Checklist](https://cheatsheetseries.owasp.org/)

---

*Last updated: January 6, 2025*