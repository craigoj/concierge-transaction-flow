#!/bin/bash

# =============================================================================
# Concierge Transaction Flow - Comprehensive Test Script
# =============================================================================
# 
# This script runs all types of tests including unit, integration, E2E, 
# linting, type checking, and security checks.
#
# Usage: ./scripts/test-all.sh [--fast|--coverage|--e2e-only]
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_header() {
    echo ""
    echo "=================================="
    echo "$1"
    echo "=================================="
    echo ""
}

# Parse command line arguments
FAST_MODE=false
COVERAGE_MODE=false
E2E_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --fast)
            FAST_MODE=true
            shift
            ;;
        --coverage)
            COVERAGE_MODE=true
            shift
            ;;
        --e2e-only)
            E2E_ONLY=true
            shift
            ;;
        *)
            echo "Unknown option $1"
            echo "Usage: $0 [--fast|--coverage|--e2e-only]"
            exit 1
            ;;
    esac
done

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    print_status "Running $test_name..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command"; then
        print_success "$test_name passed"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        print_error "$test_name failed"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Code quality tests
run_quality_tests() {
    if [ "$E2E_ONLY" = true ]; then
        return 0
    fi
    
    print_header "Code Quality Tests"
    
    run_test "ESLint" "npm run lint"
    run_test "TypeScript Type Check" "npx tsc --noEmit"
    
    if [ "$FAST_MODE" = false ]; then
        run_test "Security Audit" "npm audit --audit-level=moderate"
    fi
}

# Unit and integration tests
run_unit_tests() {
    if [ "$E2E_ONLY" = true ]; then
        return 0
    fi
    
    print_header "Unit & Integration Tests"
    
    if [ "$COVERAGE_MODE" = true ]; then
        run_test "Unit Tests with Coverage" "npm run test:coverage"
        run_test "Integration Tests with Coverage" "npm run test:integration:coverage"
    else
        run_test "Unit Tests" "npm run test:run"
        run_test "Integration Tests" "npm run test:integration:run"
    fi
}

# End-to-end tests
run_e2e_tests() {
    print_header "End-to-End Tests"
    
    # Build the application first
    if [ "$E2E_ONLY" = false ]; then
        print_status "Building application for E2E tests..."
        if ! npm run build; then
            print_error "Build failed, skipping E2E tests"
            return 1
        fi
    fi
    
    # Check if Playwright browsers are installed
    if ! npx playwright install --dry-run > /dev/null 2>&1; then
        print_status "Installing Playwright browsers..."
        npx playwright install --with-deps
    fi
    
    run_test "Playwright E2E Tests" "npx playwright test"
}

# Performance tests
run_performance_tests() {
    if [ "$FAST_MODE" = true ] || [ "$E2E_ONLY" = true ]; then
        return 0
    fi
    
    print_header "Performance Tests"
    
    print_status "Analyzing bundle size..."
    npm run build > /dev/null 2>&1
    
    if command -v du &> /dev/null; then
        BUNDLE_SIZE=$(du -sh dist/ | cut -f1)
        print_status "Bundle size: $BUNDLE_SIZE"
        
        # Check if bundle is too large (>5MB)
        BUNDLE_SIZE_KB=$(du -k dist/ | cut -f1)
        if [ "$BUNDLE_SIZE_KB" -gt 5120 ]; then
            print_warning "Bundle size is large (>5MB): ${BUNDLE_SIZE}"
        else
            print_success "Bundle size is acceptable: ${BUNDLE_SIZE}"
        fi
    fi
}

# Accessibility tests
run_accessibility_tests() {
    if [ "$FAST_MODE" = true ] || [ "$E2E_ONLY" = true ]; then
        return 0
    fi
    
    print_header "Accessibility Tests"
    
    if [ -d "src/test/accessibility" ]; then
        run_test "Accessibility Tests" "npm run test -- src/test/accessibility/"
    else
        print_warning "Accessibility tests not found, skipping"
    fi
}

# Generate test report
generate_report() {
    print_header "Test Results Summary"
    
    echo "Total tests run: $TOTAL_TESTS"
    echo "Tests passed: $TESTS_PASSED"
    echo "Tests failed: $TESTS_FAILED"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        print_success "All tests passed! 🎉"
        return 0
    else
        print_error "$TESTS_FAILED test(s) failed ❌"
        return 1
    fi
}

# Main execution
main() {
    echo "🧪 Concierge Transaction Flow - Comprehensive Test Suite"
    echo "========================================================"
    
    if [ "$E2E_ONLY" = true ]; then
        echo "Running E2E tests only..."
    elif [ "$FAST_MODE" = true ]; then
        echo "Running in fast mode (skipping slow tests)..."
    elif [ "$COVERAGE_MODE" = true ]; then
        echo "Running with coverage reporting..."
    else
        echo "Running full test suite..."
    fi
    
    echo ""
    
    # Run all test suites
    run_quality_tests
    run_unit_tests
    run_e2e_tests
    run_performance_tests
    run_accessibility_tests
    
    # Generate final report
    if generate_report; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main "$@"