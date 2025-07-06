#!/bin/bash

# Rollback Script for Concierge Transaction Flow
# This script provides automated rollback capabilities for production deployments

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ROLLBACK_LOG="$PROJECT_ROOT/deployment/rollback.log"
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$ROLLBACK_LOG"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$ROLLBACK_LOG"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1" >> "$ROLLBACK_LOG"
}

# Function to check if required environment variables are set
check_environment() {
    log "Checking environment variables..."
    
    local required_vars=("VERCEL_TOKEN" "VERCEL_ORG_ID" "VERCEL_PROJECT_ID")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        error "Missing required environment variables: ${missing_vars[*]}"
        exit 1
    fi
    
    log "Environment variables validated"
}

# Function to get the last successful deployment
get_last_successful_deployment() {
    log "Retrieving last successful deployment..."
    
    # Get deployment list from Vercel
    local deployments=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
        "https://api.vercel.com/v6/deployments?projectId=$VERCEL_PROJECT_ID&limit=10")
    
    if [ $? -ne 0 ]; then
        error "Failed to retrieve deployment list from Vercel"
        exit 1
    fi
    
    # Parse the response to find the last successful deployment
    # This is a simplified version - in production you'd use jq or similar
    local last_deployment=$(echo "$deployments" | grep -o '"uid":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$last_deployment" ]; then
        error "No previous deployment found for rollback"
        exit 1
    fi
    
    echo "$last_deployment"
}

# Function to promote a previous deployment
promote_deployment() {
    local deployment_id=$1
    
    log "Promoting deployment $deployment_id to production..."
    
    # Promote the deployment using Vercel API
    local response=$(curl -s -w "%{http_code}" -X PATCH \
        -H "Authorization: Bearer $VERCEL_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"target": "production"}' \
        "https://api.vercel.com/v13/deployments/$deployment_id/promote")
    
    local http_code="${response: -3}"
    
    if [ "$http_code" -ne 200 ]; then
        error "Failed to promote deployment. HTTP code: $http_code"
        exit 1
    fi
    
    log "Deployment promoted successfully"
}

# Function to verify rollback success
verify_rollback() {
    local max_attempts=10
    local attempt=1
    
    log "Verifying rollback success..."
    
    while [ $attempt -le $max_attempts ]; do
        log "Verification attempt $attempt/$max_attempts..."
        
        # Check if the application is responding
        local response=$(curl -s -w "%{http_code}" -o /dev/null "https://your-domain.com/health")
        
        if [ "$response" -eq 200 ]; then
            log "Application is responding correctly"
            return 0
        fi
        
        log "Application not ready yet, waiting 30 seconds..."
        sleep 30
        ((attempt++))
    done
    
    error "Rollback verification failed after $max_attempts attempts"
    return 1
}

# Function to notify team about rollback
notify_rollback() {
    local deployment_id=$1
    local reason=$2
    
    log "Sending rollback notification..."
    
    # Prepare notification message
    local message="🔄 **Production Rollback Executed**
    
**Timestamp:** $TIMESTAMP
**Rolled back to:** $deployment_id
**Reason:** $reason
**Status:** Rollback completed successfully

Please investigate the issues that caused the rollback and prepare a hotfix."
    
    # Send notification (implement your preferred notification method)
    # Examples:
    # - Slack webhook
    # - Discord webhook
    # - Email notification
    # - PagerDuty alert
    
    log "Notification sent (implement your notification method)"
}

# Function to create rollback summary
create_rollback_summary() {
    local deployment_id=$1
    local reason=$2
    
    local summary_file="$PROJECT_ROOT/deployment/rollback_summary_$TIMESTAMP.json"
    
    cat > "$summary_file" << EOF
{
    "timestamp": "$TIMESTAMP",
    "rollback_target": "$deployment_id",
    "reason": "$reason",
    "status": "completed",
    "verification_passed": true,
    "logs": "$ROLLBACK_LOG"
}
EOF
    
    log "Rollback summary created: $summary_file"
}

# Main rollback function
main() {
    local reason=${1:-"Manual rollback triggered"}
    
    log "Starting rollback process..."
    log "Reason: $reason"
    
    # Check environment
    check_environment
    
    # Get last successful deployment
    local last_deployment=$(get_last_successful_deployment)
    log "Last successful deployment: $last_deployment"
    
    # Confirm rollback
    if [ -t 0 ]; then  # Check if running interactively
        echo -e "${YELLOW}Are you sure you want to rollback to deployment $last_deployment? (y/N)${NC}"
        read -r confirmation
        if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
            log "Rollback cancelled by user"
            exit 0
        fi
    fi
    
    # Perform rollback
    promote_deployment "$last_deployment"
    
    # Verify rollback
    if verify_rollback; then
        log "Rollback completed successfully"
        
        # Notify team
        notify_rollback "$last_deployment" "$reason"
        
        # Create summary
        create_rollback_summary "$last_deployment" "$reason"
        
        log "Rollback process completed"
    else
        error "Rollback verification failed"
        exit 1
    fi
}

# Script usage
usage() {
    echo "Usage: $0 [reason]"
    echo "  reason: Optional reason for the rollback (default: 'Manual rollback triggered')"
    echo ""
    echo "Examples:"
    echo "  $0 'Critical bug in payment processing'"
    echo "  $0 'Performance degradation detected'"
    echo "  $0"
    echo ""
    echo "Environment variables required:"
    echo "  VERCEL_TOKEN: Your Vercel authentication token"
    echo "  VERCEL_ORG_ID: Your Vercel organization ID"
    echo "  VERCEL_PROJECT_ID: Your Vercel project ID"
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