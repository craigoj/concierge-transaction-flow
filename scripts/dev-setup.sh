#!/bin/bash

# =============================================================================
# Concierge Transaction Flow - Development Setup Script
# =============================================================================
# 
# This script sets up the development environment for the Concierge Transaction 
# Flow application, including dependencies, environment configuration, and 
# local Supabase setup.
#
# Usage: ./scripts/dev-setup.sh
#

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
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

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        print_error "Node.js version must be 18 or higher. Current version: $(node --version)"
        exit 1
    fi
    print_success "Node.js $(node --version) is installed"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm $(npm --version) is installed"
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    print_success "Git $(git --version | cut -d' ' -f3) is installed"
    
    # Check if Supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        print_warning "Supabase CLI is not installed. Installing..."
        npm install -g supabase
    fi
    print_success "Supabase CLI is available"
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        print_success "Docker $(docker --version | cut -d' ' -f3 | sed 's/,//') is installed"
    else
        print_warning "Docker is not installed. Docker is optional for development but recommended."
    fi
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    print_status "Installing npm packages..."
    npm ci
    
    print_status "Installing Playwright browsers..."
    npx playwright install --with-deps
    
    print_success "All dependencies installed successfully"
}

# Setup environment configuration
setup_environment() {
    print_header "Setting Up Environment"
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_status "Creating .env file from .env.example..."
            cp .env.example .env
            print_warning "Please edit .env file with your actual environment variables"
        else
            print_error ".env.example file not found"
            exit 1
        fi
    else
        print_success ".env file already exists"
    fi
    
    # Validate environment
    print_status "Validating environment configuration..."
    if npm run build:dev > /dev/null 2>&1; then
        print_success "Environment configuration is valid"
    else
        print_warning "Environment validation failed. Please check your .env file"
    fi
}

# Setup Supabase local development
setup_supabase() {
    print_header "Setting Up Local Supabase"
    
    if [ ! -f "supabase/config.toml" ]; then
        print_error "Supabase configuration not found. Please ensure this is a Supabase project."
        exit 1
    fi
    
    print_status "Starting local Supabase..."
    if supabase start; then
        print_success "Supabase started successfully"
        print_status "Supabase Studio available at: http://localhost:54323"
        print_status "Database URL: postgresql://postgres:postgres@localhost:54322/postgres"
    else
        print_warning "Failed to start Supabase. You may need to start it manually with 'supabase start'"
    fi
}

# Run initial tests
run_tests() {
    print_header "Running Initial Tests"
    
    print_status "Running linting..."
    if npm run lint; then
        print_success "Linting passed"
    else
        print_warning "Linting failed. Please fix issues before continuing"
    fi
    
    print_status "Running unit tests..."
    if npm run test:run; then
        print_success "Unit tests passed"
    else
        print_warning "Some tests failed. Check the output above"
    fi
    
    print_status "Building application..."
    if npm run build; then
        print_success "Build successful"
    else
        print_error "Build failed. Please check the errors above"
    fi
}

# Print completion message
print_completion() {
    print_header "Setup Complete!"
    
    echo "🎉 Development environment is ready!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env with your environment variables"
    echo "2. Start development server: npm run dev"
    echo "3. Open browser to: http://localhost:5173"
    echo ""
    echo "Useful commands:"
    echo "  npm run dev          - Start development server"
    echo "  npm run test         - Run tests in watch mode"
    echo "  npm run build        - Build for production"
    echo "  supabase start       - Start local Supabase"
    echo "  supabase stop        - Stop local Supabase"
    echo ""
    echo "Documentation:"
    echo "  README.md            - Project overview"
    echo "  CLAUDE.md            - Development workflow"
    echo "  .env.example         - Environment variables reference"
}

# Main execution
main() {
    echo "🚀 Concierge Transaction Flow - Development Setup"
    echo "================================================="
    
    check_prerequisites
    install_dependencies
    setup_environment
    setup_supabase
    run_tests
    print_completion
}

# Run main function
main "$@"