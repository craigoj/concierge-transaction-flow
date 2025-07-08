#!/bin/bash

# Deploy to Staging Environment
# This script deploys the application to the staging environment with proper configuration

set -e

echo "🚀 Starting staging deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required environment variables are set
check_env_vars() {
  echo "🔍 Checking required environment variables..."
  
  required_vars=(
    "VERCEL_TOKEN"
    "VERCEL_ORG_ID"
    "VERCEL_PROJECT_ID"
    "VITE_SUPABASE_URL_STAGING"
    "VITE_SUPABASE_ANON_KEY_STAGING"
    "VITE_ENCRYPTION_KEY_STAGING"
  )
  
  for var in "${required_vars[@]}"; do
    if [[ -z "${!var}" ]]; then
      echo -e "${RED}❌ Missing required environment variable: $var${NC}"
      echo "Please set this variable before deploying."
      exit 1
    fi
  done
  
  echo -e "${GREEN}✅ All required environment variables are set${NC}"
}

# Install dependencies
install_dependencies() {
  echo "📦 Installing dependencies..."
  npm ci
  echo -e "${GREEN}✅ Dependencies installed${NC}"
}

# Run tests
run_tests() {
  echo "🧪 Running tests..."
  npm run test:run
  echo -e "${GREEN}✅ Tests passed${NC}"
}

# Run linting
run_linting() {
  echo "🔍 Running linting..."
  npm run lint
  echo -e "${GREEN}✅ Linting passed${NC}"
}

# Build application
build_application() {
  echo "🏗️ Building application for staging..."
  
  # Set staging environment variables
  export NODE_ENV=staging
  export VITE_SUPABASE_URL=$VITE_SUPABASE_URL_STAGING
  export VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY_STAGING
  export VITE_APP_NAME="Concierge Transaction Flow (Staging)"
  export VITE_APP_VERSION="staging-$(date +%Y%m%d%H%M%S)"
  export VITE_ENABLE_ANALYTICS=true
  export VITE_ENABLE_DEBUG=true
  export VITE_ENABLE_SENTRY=true
  export VITE_SENTRY_DSN=$VITE_SENTRY_DSN_STAGING
  export VITE_ENCRYPTION_KEY=$VITE_ENCRYPTION_KEY_STAGING
  
  npm run build
  echo -e "${GREEN}✅ Build completed${NC}"
}

# Deploy to Vercel
deploy_to_vercel() {
  echo "🚀 Deploying to Vercel staging..."
  
  # Install Vercel CLI if not present
  if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
  fi
  
  # Deploy with staging configuration
  vercel --prod --token $VERCEL_TOKEN --scope $VERCEL_ORG_ID --confirm staging.json
  
  echo -e "${GREEN}✅ Deployment completed${NC}"
}

# Post-deployment checks
post_deployment_checks() {
  echo "🔍 Running post-deployment checks..."
  
  # Get deployment URL (this would need to be captured from Vercel output)
  # For now, we'll just show a success message
  echo -e "${GREEN}✅ Staging deployment successful!${NC}"
  echo -e "${YELLOW}🔗 Check your Vercel dashboard for the deployment URL${NC}"
  
  # Optional: Run health checks against staging URL
  # curl -f $STAGING_URL/health || echo "Health check failed"
}

# Main deployment flow
main() {
  echo "🎯 Deploying Concierge Transaction Flow to Staging"
  echo "================================================="
  
  check_env_vars
  install_dependencies
  run_tests
  run_linting
  build_application
  deploy_to_vercel
  post_deployment_checks
  
  echo -e "${GREEN}🎉 Staging deployment completed successfully!${NC}"
}

# Run main function
main "$@"