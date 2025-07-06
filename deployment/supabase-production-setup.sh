#!/bin/bash

# Supabase Production Environment Setup Script
# This script configures the production Supabase environment

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

# Check if Supabase CLI is installed
check_supabase_cli() {
    if ! command -v supabase &> /dev/null; then
        error "Supabase CLI is not installed. Please install it first:"
        echo "npm install -g supabase"
        exit 1
    fi
    
    log "Supabase CLI found: $(supabase --version)"
}

# Login to Supabase
login_supabase() {
    log "Logging in to Supabase..."
    
    if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
        supabase login
    else
        log "Using SUPABASE_ACCESS_TOKEN for authentication"
    fi
}

# Create or link production project
setup_production_project() {
    log "Setting up production project..."
    
    # Check if project is already linked
    if [ -f "$PROJECT_ROOT/supabase/.temp/project-ref" ]; then
        local existing_ref=$(cat "$PROJECT_ROOT/supabase/.temp/project-ref")
        warning "Project already linked to: $existing_ref"
        
        echo -e "${YELLOW}Do you want to continue with existing project? (y/N)${NC}"
        read -r confirmation
        if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
            log "Cancelled by user"
            exit 0
        fi
    else
        # Link to existing project or create new one
        if [ -n "$SUPABASE_PROJECT_REF" ]; then
            log "Linking to existing project: $SUPABASE_PROJECT_REF"
            supabase link --project-ref "$SUPABASE_PROJECT_REF"
        else
            log "Creating new Supabase project..."
            echo -e "${YELLOW}Enter your organization ID:${NC}"
            read -r org_id
            echo -e "${YELLOW}Enter project name (concierge-transaction-flow):${NC}"
            read -r project_name
            project_name=${project_name:-"concierge-transaction-flow"}
            
            supabase projects create "$project_name" --org-id "$org_id"
            
            # The project ref will be automatically linked
        fi
    fi
}

# Deploy database migrations
deploy_migrations() {
    log "Deploying database migrations..."
    
    # Check if there are any migrations
    if [ ! -d "$PROJECT_ROOT/supabase/migrations" ] || [ -z "$(ls -A "$PROJECT_ROOT/supabase/migrations")" ]; then
        warning "No migrations found to deploy"
        return
    fi
    
    # Run migrations
    supabase db push
    
    log "Migrations deployed successfully"
}

# Deploy edge functions
deploy_edge_functions() {
    log "Deploying edge functions..."
    
    if [ ! -d "$PROJECT_ROOT/supabase/functions" ] || [ -z "$(ls -A "$PROJECT_ROOT/supabase/functions")" ]; then
        warning "No edge functions found to deploy"
        return
    fi
    
    # Deploy all functions
    supabase functions deploy
    
    log "Edge functions deployed successfully"
}

# Set up environment variables
setup_environment_variables() {
    log "Setting up environment variables..."
    
    # Get project details
    local project_ref=$(supabase projects list --output json | jq -r '.[0].id')
    local project_url="https://${project_ref}.supabase.co"
    
    # Get API keys
    local anon_key=$(supabase projects api-keys --project-ref "$project_ref" --output json | jq -r '.anon')
    local service_key=$(supabase projects api-keys --project-ref "$project_ref" --output json | jq -r '.service_role')
    
    # Create production environment file
    local env_file="$PROJECT_ROOT/.env.production"
    
    cat > "$env_file" << EOF
# Production Environment Configuration
# Generated on $(date)

# Supabase Configuration
VITE_SUPABASE_URL=$project_url
VITE_SUPABASE_ANON_KEY=$anon_key
SUPABASE_SERVICE_ROLE_KEY=$service_key

# Application Configuration
VITE_ENVIRONMENT=production
VITE_APP_NAME=Concierge Transaction Flow
VITE_APP_VERSION=$(cat "$PROJECT_ROOT/package.json" | jq -r '.version')

# Security Headers
VITE_ENABLE_SECURITY_HEADERS=true
VITE_ENABLE_CSP=true

# Performance Monitoring
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_PERFORMANCE_BUDGET_LCP=2500
VITE_PERFORMANCE_BUDGET_FID=100
VITE_PERFORMANCE_BUDGET_CLS=0.1

# Error Reporting
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_RELEASE=\${VITE_APP_VERSION}

# Database Configuration
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.${project_ref}.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.${project_ref}.supabase.co:5432/postgres

# Email Configuration (if using custom SMTP)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@yourdomain.com

# File Storage
SUPABASE_STORAGE_BUCKET=documents
SUPABASE_STORAGE_PUBLIC_URL=$project_url/storage/v1/object/public
EOF

    log "Environment configuration created: $env_file"
    warning "Please update the following values in $env_file:"
    echo "  - DATABASE_URL password"
    echo "  - DIRECT_URL password"
    echo "  - VITE_SENTRY_DSN (if using Sentry)"
    echo "  - SMTP configuration (if using custom email)"
}

# Configure RLS policies
configure_rls_policies() {
    log "Configuring Row Level Security policies..."
    
    # Run RLS setup if file exists
    if [ -f "$PROJECT_ROOT/supabase/migrations/rls_policies.sql" ]; then
        supabase db push --include-schemas=public
        log "RLS policies configured"
    else
        warning "No RLS policies file found. Please ensure your migrations include RLS setup."
    fi
}

# Setup storage buckets
setup_storage_buckets() {
    log "Setting up storage buckets..."
    
    # Create storage configuration
    local storage_config="$PROJECT_ROOT/supabase/storage_setup.sql"
    
    cat > "$storage_config" << EOF
-- Storage buckets setup for production
-- Run this manually in the Supabase dashboard SQL editor

-- Create documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false,
    52428800, -- 50MB
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Create public assets bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'public-assets',
    'public-assets',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for documents bucket
CREATE POLICY "Users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own documents" ON storage.objects
FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own documents" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own documents" ON storage.objects
FOR DELETE USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for public assets bucket
CREATE POLICY "Anyone can view public assets" ON storage.objects
FOR SELECT USING (bucket_id = 'public-assets');

CREATE POLICY "Authenticated users can upload public assets" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'public-assets' AND
    auth.role() = 'authenticated'
);
EOF

    log "Storage configuration created: $storage_config"
    warning "Please run the SQL commands in $storage_config in your Supabase dashboard"
}

# Validate production setup
validate_production_setup() {
    log "Validating production setup..."
    
    # Check if migrations are applied
    local migration_status=$(supabase migration list --local=false)
    if [[ $migration_status == *"Applied"* ]]; then
        log "✓ Migrations are properly applied"
    else
        error "✗ Migrations not properly applied"
        exit 1
    fi
    
    # Check if functions are deployed
    local functions_status=$(supabase functions list)
    if [[ $functions_status == *"deployed"* ]] || [[ $functions_status == *"No functions"* ]]; then
        log "✓ Functions deployment status verified"
    else
        warning "Functions deployment status unclear"
    fi
    
    # Test basic connectivity
    local project_ref=$(supabase projects list --output json | jq -r '.[0].id')
    local project_url="https://${project_ref}.supabase.co"
    
    if curl -s -f "${project_url}/rest/v1/" > /dev/null; then
        log "✓ API connectivity verified"
    else
        error "✗ API connectivity failed"
        exit 1
    fi
    
    log "Production setup validation completed"
}

# Create deployment summary
create_deployment_summary() {
    log "Creating deployment summary..."
    
    local project_ref=$(supabase projects list --output json | jq -r '.[0].id')
    local project_url="https://${project_ref}.supabase.co"
    
    local summary_file="$PROJECT_ROOT/deployment/production_setup_summary.md"
    
    cat > "$summary_file" << EOF
# Production Setup Summary

**Setup Date:** $(date)
**Project Reference:** $project_ref
**Project URL:** $project_url

## Configuration Details

### Database
- **URL:** $project_url
- **Migrations:** Applied
- **RLS Policies:** Configured

### Authentication
- **Provider:** Supabase Auth
- **Configuration:** Default settings

### Storage
- **Buckets:** documents, public-assets
- **Configuration:** See storage_setup.sql

### Edge Functions
- **Status:** Deployed
- **Configuration:** Default settings

## Next Steps

1. **Update Environment Variables**
   - Add production environment variables to your deployment platform
   - Configure SMTP settings for email notifications
   - Set up Sentry DSN for error tracking

2. **Domain Configuration**
   - Configure custom domain in Supabase dashboard
   - Set up SSL certificates
   - Update CORS settings

3. **Security Review**
   - Review RLS policies
   - Test authentication flows
   - Verify API rate limits

4. **Monitoring Setup**
   - Configure uptime monitoring
   - Set up performance alerts
   - Test backup procedures

## Important Files

- Environment config: \`.env.production\`
- Storage setup: \`supabase/storage_setup.sql\`
- This summary: \`deployment/production_setup_summary.md\`

## Support

For issues or questions, refer to:
- Supabase documentation: https://supabase.com/docs
- Project documentation: CLAUDE.md
EOF

    log "Deployment summary created: $summary_file"
}

# Main setup function
main() {
    log "Starting Supabase production environment setup..."
    
    # Pre-flight checks
    check_supabase_cli
    
    # Setup process
    login_supabase
    setup_production_project
    deploy_migrations
    deploy_edge_functions
    setup_environment_variables
    configure_rls_policies
    setup_storage_buckets
    
    # Validation
    validate_production_setup
    
    # Documentation
    create_deployment_summary
    
    log "Supabase production environment setup completed successfully!"
    log "Please review the summary file and complete the manual steps."
}

# Script usage
usage() {
    echo "Usage: $0"
    echo ""
    echo "Environment variables (optional):"
    echo "  SUPABASE_ACCESS_TOKEN: Your Supabase access token"
    echo "  SUPABASE_PROJECT_REF: Existing project reference to link to"
    echo ""
    echo "This script will:"
    echo "  1. Login to Supabase"
    echo "  2. Create or link to a production project"
    echo "  3. Deploy database migrations"
    echo "  4. Deploy edge functions"
    echo "  5. Configure environment variables"
    echo "  6. Set up storage buckets"
    echo "  7. Validate the setup"
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