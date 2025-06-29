# Testing Workflow: Parallel Repository Strategy

This document outlines the workflow for managing development between lovable.dev and this testing repository.

## 🎯 Overview

We use a **parallel repository strategy** where:
- **lovable.dev**: Primary development platform for rapid UI development and feature iteration
- **Clone repository**: Comprehensive testing environment with full CI/CD pipeline

## 🔄 Sync Workflow

### 1. Development Phase (lovable.dev)

1. **Feature Development**: Build new features in lovable.dev
2. **Rapid Iteration**: Use lovable.dev's fast feedback loop for UI/UX improvements
3. **Basic Testing**: Use lovable.dev's built-in preview and basic testing

### 2. Sync to Clone Repository

#### Manual Sync Process:

```bash
# 1. Export changes from lovable.dev
# Download your project as a ZIP file from lovable.dev

# 2. Extract and compare changes
unzip lovable-export.zip
rsync -av --exclude=node_modules --exclude=.git lovable-export/ ./

# 3. Review changes
git diff

# 4. Commit changes with descriptive message
git add .
git commit -m "feat: sync from lovable.dev - [feature description]

- Added: [new features]
- Updated: [modified components]
- Fixed: [bug fixes]

Synced from lovable.dev on $(date)"
```

#### Semi-Automated Sync Script:

```bash
# Create sync script: sync-from-lovable.sh
#!/bin/bash

echo "🔄 Syncing from lovable.dev..."

# Check if we have a clean working directory
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ Working directory not clean. Commit changes first."
    exit 1
fi

# Create sync branch
SYNC_BRANCH="sync/lovable-$(date +%Y%m%d-%H%M%S)"
git checkout -b "$SYNC_BRANCH"

echo "📁 Place your lovable.dev export in ./lovable-sync/ directory"
echo "Press Enter when ready..."
read

if [ -d "./lovable-sync" ]; then
    # Sync files (excluding sensitive directories)
    rsync -av --delete \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=coverage \
        --exclude=dist \
        --exclude=build \
        --exclude=test-results \
        --exclude=testing \
        --exclude=.github \
        lovable-sync/ ./

    # Add changes
    git add .
    
    if [[ -n $(git status --porcelain) ]]; then
        git commit -m "sync: update from lovable.dev on $(date)"
        echo "✅ Sync complete! Branch: $SYNC_BRANCH"
        echo "🔍 Review changes and merge when ready"
    else
        echo "ℹ️ No changes detected"
        git checkout main
        git branch -d "$SYNC_BRANCH"
    fi
else
    echo "❌ ./lovable-sync/ directory not found"
    git checkout main
    git branch -d "$SYNC_BRANCH"
fi
```

### 3. Testing Phase (Clone Repository)

Once synced, run comprehensive tests:

```bash
# Run all tests
npm run test:run          # Unit tests
npm run test:coverage     # Coverage report
npm run lint              # Code quality
cd testing/ui-documentation && npm run test  # E2E tests

# Check CI/CD pipeline
git push origin main      # Triggers GitHub Actions
```

### 4. Quality Assurance

#### Automated Quality Gates:
- ✅ All unit tests pass (70% coverage minimum)
- ✅ All E2E tests pass
- ✅ No linting errors
- ✅ TypeScript compilation successful
- ✅ Security audit clean
- ✅ Build successful

#### Manual Quality Checks:
- 🔍 Visual regression review
- 🔍 Performance metrics acceptable
- 🔍 Accessibility standards met
- 🔍 Cross-browser compatibility

## 📊 Testing Structure

### Unit Tests (`src/**/*.test.{ts,tsx}`)
- **Coverage Target**: 70%
- **Framework**: Vitest + Testing Library
- **Mocking**: MSW for API calls
- **Focus**: Business logic, components, utilities

### E2E Tests (`testing/ui-documentation/tests/`)
- **Framework**: Playwright
- **Browsers**: Chrome, Firefox, Safari, Mobile
- **Focus**: Critical user flows, visual regression

### CI/CD Pipeline (`.github/workflows/test.yml`)
- **Triggers**: Push to main/develop, Pull requests
- **Jobs**: Lint, TypeScript, Unit tests, E2E tests, Security audit
- **Artifacts**: Test reports, coverage reports

## 🔧 Development Commands

### lovable.dev Development
```bash
# Use lovable.dev interface for:
- Component creation and editing
- UI/UX iteration
- Rapid prototyping
- Real-time preview
```

### Clone Repository Testing
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Testing commands
npm run test              # Interactive testing
npm run test:run          # Single test run
npm run test:coverage     # With coverage
npm run test:ui           # Visual test interface
npm run test:watch        # Watch mode

# E2E testing
cd testing/ui-documentation
npm run test              # All E2E tests
npm run test:headed       # With browser visible
npm run test:mobile       # Mobile tests only
npm run test:desktop      # Desktop tests only

# Code quality
npm run lint              # ESLint
npx tsc --noEmit         # TypeScript check

# Build and preview
npm run build
npm run preview
```

## 📈 Sync Frequency Recommendations

### During Active Development
- **Daily sync**: For rapid iteration periods
- **Feature completion sync**: When feature is ready for testing
- **Bug fix sync**: Immediately after critical fixes

### During Stable Periods
- **Weekly sync**: For maintenance and minor updates
- **Release sync**: Before major releases

### Before Production Deployment
- **Final sync**: Ensure clone repo matches production code
- **Full test suite**: Run complete testing pipeline
- **Security audit**: Final security check

## 🚨 Troubleshooting

### Common Sync Issues

#### File Conflicts
```bash
# Resolve conflicts manually
git status
git diff
# Edit conflicted files
git add .
git commit -m "resolve: sync conflicts"
```

#### Missing Dependencies
```bash
# After sync, always check package.json changes
npm install
```

#### Test Failures After Sync
```bash
# Check for breaking changes
npm run test:run
# Update tests if needed
npm run test:coverage
```

### Emergency Rollback
```bash
# If sync introduces critical issues
git log --oneline        # Find last good commit
git reset --hard <commit-hash>
git push --force-with-lease origin main
```

## 📝 Sync Checklist

### Pre-Sync
- [ ] Commit all changes in clone repo
- [ ] Create backup branch: `git checkout -b backup-$(date +%Y%m%d)`
- [ ] Export latest code from lovable.dev

### Post-Sync
- [ ] Review file changes: `git diff HEAD~1`
- [ ] Update dependencies: `npm install`
- [ ] Run test suite: `npm run test:run`
- [ ] Check build: `npm run build`
- [ ] Review visual changes: `cd testing/ui-documentation && npm run test`
- [ ] Commit sync: `git commit -m "sync: [description]"`
- [ ] Push and verify CI: `git push origin main`

### Quality Verification
- [ ] All tests pass ✅
- [ ] Coverage maintained ✅
- [ ] No security vulnerabilities ✅
- [ ] Performance acceptable ✅
- [ ] Visual regression clean ✅

## 🎯 Success Metrics

### Development Velocity
- **lovable.dev**: Fast feature development and UI iteration
- **Clone repo**: Thorough testing and quality assurance

### Quality Metrics
- **Test Coverage**: Maintain >70%
- **CI/CD Success Rate**: >95%
- **Security Score**: 10/10
- **Performance**: Load time <2s

### Team Productivity
- **Sync Frequency**: Daily during active development
- **Issue Resolution**: <24 hours for sync-related issues
- **Deployment Confidence**: 95%+ success rate

---

## 📞 Support

For sync workflow issues:
1. Check this documentation
2. Review Git history: `git log --oneline`
3. Check CI/CD pipeline status
4. Create issue with sync details

**Remember**: This dual-repository approach maximizes both development speed and code quality! 🚀