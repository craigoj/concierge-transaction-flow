#!/bin/bash

# Terraform Infrastructure Deployment Script
# This script applies the Infrastructure as Code configuration

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check if Terraform is installed
check_terraform() {
    if ! command -v terraform &> /dev/null; then
        error "Terraform is not installed. Please install it first:"
        echo "https://developer.hashicorp.com/terraform/downloads"
        exit 1
    fi
    
    log "Terraform found: $(terraform version -json | jq -r '.terraform_version')"
}

# Check required files
check_required_files() {
    log "Checking required files..."
    
    local required_files=(
        "$SCRIPT_DIR/infrastructure-as-code.tf"
        "$SCRIPT_DIR/terraform.tfvars"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            error "Required file not found: $file"
            
            if [[ "$file" == *"terraform.tfvars" ]]; then
                error "Please copy terraform.tfvars.example to terraform.tfvars and update with your values"
            fi
            
            exit 1
        fi
    done
    
    log "All required files found"
}

# Validate Terraform configuration
validate_terraform() {
    log "Validating Terraform configuration..."
    
    cd "$SCRIPT_DIR"
    
    # Format check
    terraform fmt -check=true -diff=true
    
    if [ $? -ne 0 ]; then
        warning "Terraform files are not properly formatted. Running terraform fmt..."
        terraform fmt
    fi
    
    # Validate configuration
    terraform validate
    
    if [ $? -ne 0 ]; then
        error "Terraform configuration is invalid"
        exit 1
    fi
    
    log "Terraform configuration validated successfully"
}

# Initialize Terraform
init_terraform() {
    log "Initializing Terraform..."
    
    cd "$SCRIPT_DIR"
    
    # Initialize with backend configuration
    terraform init -upgrade
    
    if [ $? -ne 0 ]; then
        error "Terraform initialization failed"
        exit 1
    fi
    
    log "Terraform initialized successfully"
}

# Plan Terraform changes
plan_terraform() {
    log "Planning Terraform changes..."
    
    cd "$SCRIPT_DIR"
    
    # Create plan
    terraform plan -out=tfplan -detailed-exitcode
    
    local exit_code=$?
    
    case $exit_code in
        0)
            log "No changes needed"
            return 0
            ;;
        1)
            error "Terraform plan failed"
            exit 1
            ;;
        2)
            log "Changes detected, plan created successfully"
            return 2
            ;;
        *)
            error "Unexpected exit code from terraform plan: $exit_code"
            exit 1
            ;;
    esac
}

# Apply Terraform changes
apply_terraform() {
    log "Applying Terraform changes..."
    
    cd "$SCRIPT_DIR"
    
    # Apply the plan
    terraform apply tfplan
    
    if [ $? -ne 0 ]; then
        error "Terraform apply failed"
        exit 1
    fi
    
    log "Terraform apply completed successfully"
}

# Show Terraform outputs
show_outputs() {
    log "Terraform outputs:"
    
    cd "$SCRIPT_DIR"
    
    terraform output -json | jq '.'
    
    echo ""
    log "Infrastructure deployment completed successfully!"
}

# Cleanup function
cleanup() {
    log "Cleaning up temporary files..."
    
    cd "$SCRIPT_DIR"
    
    # Remove plan file
    if [ -f "tfplan" ]; then
        rm -f tfplan
    fi
    
    log "Cleanup completed"
}

# Main deployment function
main() {
    local auto_approve=${1:-false}
    
    log "Starting Infrastructure as Code deployment..."
    
    # Pre-flight checks
    check_terraform
    check_required_files
    
    # Terraform operations
    validate_terraform
    init_terraform
    
    # Plan changes
    plan_terraform
    local plan_exit_code=$?
    
    if [ $plan_exit_code -eq 0 ]; then
        log "No changes to apply"
        return 0
    fi
    
    # Confirm before applying
    if [ "$auto_approve" != "true" ]; then
        echo ""
        echo -e "${YELLOW}The above changes will be applied to your infrastructure.${NC}"
        echo -e "${YELLOW}Are you sure you want to proceed? (y/N)${NC}"
        read -r confirmation
        
        if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
            log "Deployment cancelled by user"
            cleanup
            exit 0
        fi
    fi
    
    # Apply changes
    apply_terraform
    
    # Show results
    show_outputs
    
    # Cleanup
    cleanup
    
    log "Infrastructure deployment completed successfully!"
}

# Script usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -y, --auto-approve  Automatically approve and apply changes"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Prerequisites:"
    echo "  1. Terraform installed"
    echo "  2. terraform.tfvars file configured"
    echo "  3. Required API tokens and credentials set"
    echo ""
    echo "This script will:"
    echo "  1. Validate Terraform configuration"
    echo "  2. Initialize Terraform"
    echo "  3. Plan infrastructure changes"
    echo "  4. Apply changes (with confirmation)"
    echo "  5. Display outputs"
}

# Trap for cleanup on exit
trap cleanup EXIT

# Handle command line arguments
case "${1:-}" in
    -h|--help)
        usage
        exit 0
        ;;
    -y|--auto-approve)
        main true
        ;;
    *)
        main false
        ;;
esac