#!/bin/bash

# 📦 Dependency Maintenance Script for Concierge Transaction Flow
# This script helps maintain project dependencies with security and quality checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to run command with error checking
run_command() {
    local cmd="$1"
    local description="$2"
    
    print_status "$description"
    if eval "$cmd"; then
        print_success "$description completed"
    else
        print_error "$description failed"
        return 1
    fi
}

# Function to check if npm is available
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed or not in PATH"
        exit 1
    fi
    
    print_status "Using npm version: $(npm --version)"
}

# Function to backup package files
backup_packages() {
    print_status "Creating backup of package files..."
    cp package.json package.json.backup
    cp package-lock.json package-lock.json.backup
    print_success "Backup created (package.json.backup, package-lock.json.backup)"
}

# Function to restore package files
restore_packages() {
    print_warning "Restoring from backup..."
    if [ -f package.json.backup ] && [ -f package-lock.json.backup ]; then
        cp package.json.backup package.json
        cp package-lock.json.backup package-lock.json
        print_success "Package files restored from backup"
    else
        print_error "Backup files not found"
    fi
}

# Function to clean backup files
cleanup_backup() {
    if [ -f package.json.backup ] && [ -f package-lock.json.backup ]; then
        rm package.json.backup package-lock.json.backup
        print_success "Backup files cleaned up"
    fi
}

# Function to check for vulnerabilities
security_audit() {
    print_status "Running security audit..."
    
    # Get vulnerability count
    AUDIT_OUTPUT=$(npm audit --audit-level=moderate --json 2>/dev/null || echo '{"metadata":{"vulnerabilities":{"total":0}}}')
    VULN_COUNT=$(echo "$AUDIT_OUTPUT" | jq -r '.metadata.vulnerabilities.total // 0')
    
    if [ "$VULN_COUNT" -eq 0 ]; then
        print_success "No security vulnerabilities found"
        return 0
    else
        print_warning "Found $VULN_COUNT security vulnerabilities"
        
        # Show vulnerability breakdown
        echo "$AUDIT_OUTPUT" | jq -r '.metadata.vulnerabilities | to_entries[] | "  \(.key | ascii_upcase): \(.value)"' 2>/dev/null || true
        
        # Ask user if they want to auto-fix
        if [ "$AUTO_FIX" = "true" ]; then
            print_status "Auto-fixing vulnerabilities..."
            if npm audit fix --force; then
                print_success "Security fixes applied"
            else
                print_warning "Some vulnerabilities could not be auto-fixed"
            fi
        else
            echo ""
            read -p "Would you like to attempt automatic fixes? (y/N): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                if npm audit fix; then
                    print_success "Security fixes applied"
                else
                    print_warning "Some vulnerabilities could not be auto-fixed"
                    echo "Consider running: npm audit fix --force (may introduce breaking changes)"
                fi
            fi
        fi
        
        return 1
    fi
}

# Function to check for outdated packages
check_outdated() {
    print_status "Checking for outdated packages..."
    
    OUTDATED_OUTPUT=$(npm outdated --json 2>/dev/null || echo '{}')
    OUTDATED_COUNT=$(echo "$OUTDATED_OUTPUT" | jq 'length')
    
    if [ "$OUTDATED_COUNT" -eq 0 ]; then
        print_success "All packages are up to date"
        return 0
    else
        print_warning "Found $OUTDATED_COUNT outdated packages:"
        echo "$OUTDATED_OUTPUT" | jq -r 'to_entries[] | "  \(.key): \(.value.current) → \(.value.latest) (\(.value.type))"' 2>/dev/null || npm outdated
        return 1
    fi
}

# Function to update dependencies
update_dependencies() {
    local update_type="$1"
    
    print_status "Updating dependencies (type: $update_type)..."
    
    case "$update_type" in
        "patch")
            npx npm-check-updates --target patch --upgrade
            ;;
        "minor")
            npx npm-check-updates --target minor --upgrade
            ;;
        "major")
            print_warning "Major updates may include breaking changes!"
            if [ "$AUTO_CONFIRM" != "true" ]; then
                read -p "Are you sure you want to apply major updates? (y/N): " -n 1 -r
                echo ""
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    print_status "Skipping major updates"
                    return 0
                fi
            fi
            npx npm-check-updates --target major --upgrade
            ;;
        "all")
            print_warning "Updating all packages to latest versions (including major)!"
            if [ "$AUTO_CONFIRM" != "true" ]; then
                read -p "This may include breaking changes. Continue? (y/N): " -n 1 -r
                echo ""
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    print_status "Skipping updates"
                    return 0
                fi
            fi
            npx npm-check-updates --upgrade
            ;;
        *)
            print_error "Invalid update type: $update_type"
            print_status "Valid types: patch, minor, major, all"
            return 1
            ;;
    esac
    
    # Check if package.json was modified
    if git diff --exit-code package.json > /dev/null 2>&1; then
        print_status "No updates were applied"
        return 0
    fi
    
    print_status "Installing updated packages..."
    npm install
    
    print_success "Dependencies updated successfully"
    return 0
}

# Function to run tests
run_tests() {
    print_status "Running comprehensive tests..."
    
    # Type checking
    if ! run_command "npm run type-check" "TypeScript type checking"; then
        return 1
    fi
    
    # Linting
    if ! run_command "npm run lint" "ESLint code quality check"; then
        return 1
    fi
    
    # Unit tests
    if ! run_command "npm run test:run" "Unit tests"; then
        return 1
    fi
    
    # Build test
    if ! run_command "npm run build" "Production build test"; then
        return 1
    fi
    
    print_success "All tests passed!"
    return 0
}

# Function to show dependency report
show_report() {
    print_status "Generating dependency health report..."
    
    echo ""
    echo "=================================="
    echo "📊 DEPENDENCY HEALTH REPORT"
    echo "=================================="
    echo "Generated: $(date)"
    echo ""
    
    # Package count
    TOTAL_DEPS=$(jq '.dependencies | length' package.json)
    DEV_DEPS=$(jq '.devDependencies | length' package.json)
    echo "📦 Total packages: $((TOTAL_DEPS + DEV_DEPS)) ($TOTAL_DEPS production + $DEV_DEPS development)"
    
    # Security status
    echo ""
    echo "🔒 Security Status:"
    AUDIT_OUTPUT=$(npm audit --audit-level=low --json 2>/dev/null || echo '{"metadata":{"vulnerabilities":{"total":0}}}')
    VULN_COUNT=$(echo "$AUDIT_OUTPUT" | jq -r '.metadata.vulnerabilities.total // 0')
    
    if [ "$VULN_COUNT" -eq 0 ]; then
        echo "   ✅ No vulnerabilities found"
    else
        echo "   ⚠️  $VULN_COUNT vulnerabilities found"
        echo "$AUDIT_OUTPUT" | jq -r '.metadata.vulnerabilities | to_entries[] | "      \(.key | ascii_upcase): \(.value)"' 2>/dev/null || true
    fi
    
    # Outdated packages
    echo ""
    echo "📈 Update Status:"
    OUTDATED_OUTPUT=$(npm outdated --json 2>/dev/null || echo '{}')
    OUTDATED_COUNT=$(echo "$OUTDATED_OUTPUT" | jq 'length')
    
    if [ "$OUTDATED_COUNT" -eq 0 ]; then
        echo "   ✅ All packages up to date"
    else
        echo "   📦 $OUTDATED_COUNT packages have updates available"
        echo "$OUTDATED_OUTPUT" | jq -r 'to_entries[] | "      \(.key): \(.value.current) → \(.value.latest)"' 2>/dev/null | head -5
        if [ "$OUTDATED_COUNT" -gt 5 ]; then
            echo "      ... and $((OUTDATED_COUNT - 5)) more"
        fi
    fi
    
    # Recommendations
    echo ""
    echo "💡 Recommendations:"
    if [ "$VULN_COUNT" -gt 0 ]; then
        echo "   🔒 Run security audit: npm audit fix"
    fi
    if [ "$OUTDATED_COUNT" -gt 0 ]; then
        echo "   📦 Update packages: $0 --update patch"
    fi
    if [ "$VULN_COUNT" -eq 0 ] && [ "$OUTDATED_COUNT" -eq 0 ]; then
        echo "   ✅ Your dependencies are in excellent shape!"
    fi
    
    echo ""
    echo "=================================="
}

# Function to show help
show_help() {
    echo "📦 Dependency Maintenance Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --audit              Run security audit only"
    echo "  --check              Check for outdated packages only"
    echo "  --update TYPE        Update dependencies (patch|minor|major|all)"
    echo "  --test               Run tests only"
    echo "  --report             Show dependency health report"
    echo "  --full               Run full maintenance (audit + check + test)"
    echo "  --auto-fix           Automatically fix security issues"
    echo "  --auto-confirm       Skip confirmation prompts"
    echo "  --backup             Create backup before changes"
    echo "  --restore            Restore from backup"
    echo "  --cleanup            Remove backup files"
    echo "  --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --audit                    # Check for security vulnerabilities"
    echo "  $0 --update patch             # Update to latest patch versions"
    echo "  $0 --full --auto-fix          # Full maintenance with auto-fix"
    echo "  $0 --report                   # Show dependency health report"
    echo ""
}

# Main script logic
main() {
    local action=""
    local update_type=""
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --audit)
                action="audit"
                shift
                ;;
            --check)
                action="check"
                shift
                ;;
            --update)
                action="update"
                update_type="$2"
                shift 2
                ;;
            --test)
                action="test"
                shift
                ;;
            --report)
                action="report"
                shift
                ;;
            --full)
                action="full"
                shift
                ;;
            --auto-fix)
                AUTO_FIX="true"
                shift
                ;;
            --auto-confirm)
                AUTO_CONFIRM="true"
                shift
                ;;
            --backup)
                backup_packages
                exit 0
                ;;
            --restore)
                restore_packages
                exit 0
                ;;
            --cleanup)
                cleanup_backup
                exit 0
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Default action if none specified
    if [ -z "$action" ]; then
        action="report"
    fi
    
    # Check prerequisites
    check_npm
    
    # Execute requested action
    case "$action" in
        "audit")
            security_audit
            ;;
        "check")
            check_outdated
            ;;
        "update")
            if [ -z "$update_type" ]; then
                print_error "Update type required (patch|minor|major|all)"
                exit 1
            fi
            
            backup_packages
            if update_dependencies "$update_type"; then
                if run_tests; then
                    cleanup_backup
                    print_success "✅ Dependencies updated and tested successfully!"
                else
                    print_error "❌ Tests failed after update"
                    read -p "Restore from backup? (Y/n): " -n 1 -r
                    echo ""
                    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                        restore_packages
                        npm install
                        print_success "Restored from backup"
                    fi
                    exit 1
                fi
            else
                cleanup_backup
                exit 1
            fi
            ;;
        "test")
            run_tests
            ;;
        "report")
            show_report
            ;;
        "full")
            print_status "Running full dependency maintenance..."
            
            backup_packages
            
            # Security audit
            security_audit || print_warning "Security issues found"
            
            # Check outdated
            check_outdated || print_warning "Outdated packages found"
            
            # Run tests
            if run_tests; then
                cleanup_backup
                print_success "✅ Full maintenance completed successfully!"
            else
                print_error "❌ Tests failed"
                read -p "Restore from backup? (Y/n): " -n 1 -r
                echo ""
                if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                    restore_packages
                    npm install
                    print_success "Restored from backup"
                fi
                exit 1
            fi
            ;;
        *)
            print_error "Invalid action: $action"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"