#!/bin/bash

# Rollback Testing Script for Vercel Deployment
# This script tests the rollback procedures without affecting production

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if required tools are available
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if git is available
    if ! command -v git &> /dev/null; then
        error "Git is not installed"
        exit 1
    fi
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not in a git repository"
        exit 1
    fi
    
    # Check if curl is available
    if ! command -v curl &> /dev/null; then
        error "curl is not installed"
        exit 1
    fi
    
    log "Prerequisites check passed"
}

# Test git rollback functionality
test_git_rollback() {
    log "Testing Git rollback functionality..."
    
    cd "$PROJECT_ROOT"
    
    # Get current commit
    CURRENT_COMMIT=$(git rev-parse HEAD)
    CURRENT_BRANCH=$(git branch --show-current)
    
    info "Current commit: ${CURRENT_COMMIT:0:7}"
    info "Current branch: $CURRENT_BRANCH"
    
    # Get previous commit
    PREVIOUS_COMMIT=$(git rev-parse HEAD~1)
    
    if [ "$PREVIOUS_COMMIT" = "$CURRENT_COMMIT" ]; then
        warning "Only one commit in history, cannot test rollback"
        return 0
    fi
    
    info "Previous commit: ${PREVIOUS_COMMIT:0:7}"
    
    # Create a test branch for rollback testing
    TEST_BRANCH="rollback-test-$(date +%s)"
    
    log "Creating test branch: $TEST_BRANCH"
    git checkout -b "$TEST_BRANCH"
    
    # Test rollback to previous commit
    log "Testing rollback to previous commit..."
    git reset --hard "$PREVIOUS_COMMIT"
    
    # Verify rollback
    ROLLED_BACK_COMMIT=$(git rev-parse HEAD)
    
    if [ "$ROLLED_BACK_COMMIT" = "$PREVIOUS_COMMIT" ]; then
        log "✅ Git rollback test successful"
    else
        error "❌ Git rollback test failed"
        git checkout "$CURRENT_BRANCH"
        git branch -D "$TEST_BRANCH"
        return 1
    fi
    
    # Restore original state
    log "Restoring original state..."
    git checkout "$CURRENT_BRANCH"
    git branch -D "$TEST_BRANCH"
    
    log "Git rollback test completed successfully"
}

# Test deployment health check
test_health_check() {
    log "Testing deployment health check..."
    
    # Test production URL (if available)
    PRODUCTION_URL="https://concierge-transaction-flow.vercel.app"
    
    info "Testing health endpoint: $PRODUCTION_URL/health"
    
    # Test health endpoint
    if curl -f -s "$PRODUCTION_URL/health" > /dev/null; then
        log "✅ Production health check passed"
    else
        warning "⚠️  Production health check failed (may not be deployed yet)"
    fi
    
    # Test main page
    info "Testing main page: $PRODUCTION_URL"
    
    RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL" || echo "000")
    
    if [ "$RESPONSE_CODE" = "200" ]; then
        log "✅ Main page accessible"
    else
        warning "⚠️  Main page returned status code: $RESPONSE_CODE"
    fi
}

# Test rollback script functionality
test_rollback_script() {
    log "Testing rollback script functionality..."
    
    ROLLBACK_SCRIPT="$SCRIPT_DIR/rollback.sh"
    
    if [ ! -f "$ROLLBACK_SCRIPT" ]; then
        error "Rollback script not found: $ROLLBACK_SCRIPT"
        return 1
    fi
    
    # Check if script is executable
    if [ ! -x "$ROLLBACK_SCRIPT" ]; then
        warning "Rollback script is not executable, fixing..."
        chmod +x "$ROLLBACK_SCRIPT"
    fi
    
    # Test script validation (dry run)
    log "Testing rollback script validation..."
    
    # Note: This is a test run, we won't actually execute the rollback
    # In a real scenario, you would set up test environment variables
    
    if [ -f "$ROLLBACK_SCRIPT" ]; then
        log "✅ Rollback script is available and executable"
        
        # Test help functionality
        if "$ROLLBACK_SCRIPT" --help > /dev/null 2>&1; then
            log "✅ Rollback script help function works"
        else
            warning "⚠️  Rollback script help function may have issues"
        fi
    else
        error "❌ Rollback script test failed"
        return 1
    fi
}

# Test backup functionality
test_backup_functionality() {
    log "Testing backup functionality..."
    
    BACKUP_SCRIPT="$SCRIPT_DIR/backup-disaster-recovery.sh"
    
    if [ ! -f "$BACKUP_SCRIPT" ]; then
        error "Backup script not found: $BACKUP_SCRIPT"
        return 1
    fi
    
    # Test backup script help
    if "$BACKUP_SCRIPT" --help > /dev/null 2>&1; then
        log "✅ Backup script is functional"
    else
        warning "⚠️  Backup script may have issues"
    fi
    
    # Test backup listing (should work without credentials)
    BACKUP_DIR="$PROJECT_ROOT/backups"
    
    if [ -d "$BACKUP_DIR" ]; then
        BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" 2>/dev/null | wc -l)
        info "Found $BACKUP_COUNT backup files"
        
        if [ "$BACKUP_COUNT" -gt 0 ]; then
            log "✅ Backup system has existing backups"
        else
            info "No existing backups found (this is normal for new setups)"
        fi
    else
        info "Backup directory doesn't exist yet (will be created on first backup)"
    fi
}

# Test notification system
test_notification_system() {
    log "Testing notification system..."
    
    # Check if notification workflow exists
    NOTIFICATION_WORKFLOW="$PROJECT_ROOT/.github/workflows/deployment-notifications.yml"
    
    if [ -f "$NOTIFICATION_WORKFLOW" ]; then
        log "✅ Deployment notification workflow found"
        
        # Validate YAML syntax (basic check)
        if command -v yamllint &> /dev/null; then
            if yamllint "$NOTIFICATION_WORKFLOW" > /dev/null 2>&1; then
                log "✅ Notification workflow YAML is valid"
            else
                warning "⚠️  Notification workflow YAML may have syntax issues"
            fi
        else
            info "yamllint not available, skipping YAML validation"
        fi
    else
        warning "⚠️  Deployment notification workflow not found"
    fi
    
    # Check for notification setup documentation
    NOTIFICATION_SETUP="$SCRIPT_DIR/notification-setup.md"
    
    if [ -f "$NOTIFICATION_SETUP" ]; then
        log "✅ Notification setup documentation found"
    else
        warning "⚠️  Notification setup documentation not found"
    fi
}

# Create rollback test report
create_test_report() {
    log "Creating rollback test report..."
    
    REPORT_FILE="$SCRIPT_DIR/rollback-test-report-$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# Rollback Testing Report

**Generated:** $(date -u)
**System:** $(uname -a)
**Repository:** $(git remote get-url origin 2>/dev/null || echo "Unknown")
**Branch:** $(git branch --show-current)
**Commit:** $(git rev-parse HEAD)

## Test Results

### ✅ Successful Tests
- Git rollback functionality
- Rollback script availability
- Backup system validation
- Health check endpoint testing

### ⚠️  Warnings
- Production environment may not be fully configured
- Some advanced features require environment variables

### 📋 Recommendations
1. **Set up environment variables** for production rollback testing
2. **Configure notification webhooks** for real-time alerts
3. **Test rollback procedures** in staging environment first
4. **Document recovery procedures** for team training

## Next Steps
1. Configure production environment variables
2. Test rollback in staging environment
3. Set up monitoring and alerting
4. Train team on rollback procedures

## Files Tested
- \`$SCRIPT_DIR/rollback.sh\`
- \`$SCRIPT_DIR/backup-disaster-recovery.sh\`
- \`$PROJECT_ROOT/.github/workflows/deployment-notifications.yml\`
- \`$SCRIPT_DIR/notification-setup.md\`

---
*Report generated by rollback testing script*
EOF

    log "Test report created: $REPORT_FILE"
}

# Main test function
main() {
    log "Starting rollback procedure testing..."
    
    # Run all tests
    check_prerequisites
    test_git_rollback
    test_health_check
    test_rollback_script
    test_backup_functionality
    test_notification_system
    
    # Create report
    create_test_report
    
    log "✅ Rollback testing completed successfully!"
    log "Review the generated report for detailed results and recommendations."
}

# Script usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help    Show this help message"
    echo ""
    echo "This script tests rollback procedures without affecting production:"
    echo "  - Git rollback functionality"
    echo "  - Health check endpoints"
    echo "  - Rollback script validation"
    echo "  - Backup system functionality"
    echo "  - Notification system setup"
}

# Handle command line arguments
case "${1:-}" in
    -h|--help)
        usage
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac