#!/bin/bash

# Backup and Disaster Recovery Script for Concierge Transaction Flow
# This script provides comprehensive backup and recovery capabilities

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"
LOG_FILE="$BACKUP_DIR/backup.log"
TIMESTAMP=$(date '+%Y-%m-%d_%H-%M-%S')

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1" >> "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1" >> "$LOG_FILE"
}

# Initialize backup directory
init_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
    fi
    
    if [ ! -f "$LOG_FILE" ]; then
        touch "$LOG_FILE"
    fi
    
    log "Backup directory initialized: $BACKUP_DIR"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if required tools are installed
    local required_tools=("git" "curl" "jq" "tar" "gzip")
    local missing_tools=()
    
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        error "Missing required tools: ${missing_tools[*]}"
        exit 1
    fi
    
    # Check if Supabase CLI is available for database backups
    if ! command -v supabase &> /dev/null; then
        warning "Supabase CLI not found. Database backups will be limited."
    fi
    
    log "Prerequisites checked successfully"
}

# Backup application code
backup_application_code() {
    log "Starting application code backup..."
    
    local backup_file="$BACKUP_DIR/application-code-$TIMESTAMP.tar.gz"
    
    # Create code archive excluding unnecessary files
    tar -czf "$backup_file" \
        --exclude='node_modules' \
        --exclude='dist' \
        --exclude='build' \
        --exclude='.git' \
        --exclude='backups' \
        --exclude='*.log' \
        --exclude='.env*' \
        -C "$PROJECT_ROOT" .
    
    if [ $? -eq 0 ]; then
        local file_size=$(du -h "$backup_file" | cut -f1)
        log "Application code backup completed: $backup_file ($file_size)"
    else
        error "Application code backup failed"
        exit 1
    fi
}

# Backup database schema
backup_database_schema() {
    log "Starting database schema backup..."
    
    local schema_backup_dir="$BACKUP_DIR/database-schema-$TIMESTAMP"
    mkdir -p "$schema_backup_dir"
    
    # Copy migration files
    if [ -d "$PROJECT_ROOT/supabase/migrations" ]; then
        cp -r "$PROJECT_ROOT/supabase/migrations" "$schema_backup_dir/"
        log "Migration files backed up"
    else
        warning "No migration files found"
    fi
    
    # Copy function files
    if [ -d "$PROJECT_ROOT/supabase/functions" ]; then
        cp -r "$PROJECT_ROOT/supabase/functions" "$schema_backup_dir/"
        log "Function files backed up"
    else
        warning "No function files found"
    fi
    
    # Copy seed files
    if [ -f "$PROJECT_ROOT/supabase/seed.sql" ]; then
        cp "$PROJECT_ROOT/supabase/seed.sql" "$schema_backup_dir/"
        log "Seed file backed up"
    fi
    
    # Generate schema dump if Supabase CLI is available
    if command -v supabase &> /dev/null; then
        log "Generating schema dump..."
        cd "$PROJECT_ROOT"
        supabase db dump --schema-only > "$schema_backup_dir/schema-dump.sql" 2>/dev/null || warning "Schema dump failed"
    fi
    
    # Compress schema backup
    tar -czf "$BACKUP_DIR/database-schema-$TIMESTAMP.tar.gz" -C "$BACKUP_DIR" "database-schema-$TIMESTAMP"
    rm -rf "$schema_backup_dir"
    
    log "Database schema backup completed"
}

# Backup database data
backup_database_data() {
    log "Starting database data backup..."
    
    if ! command -v supabase &> /dev/null; then
        warning "Supabase CLI not available. Skipping database data backup."
        return
    fi
    
    local data_backup_file="$BACKUP_DIR/database-data-$TIMESTAMP.sql"
    
    cd "$PROJECT_ROOT"
    
    # Generate data dump
    log "Generating database data dump..."
    if supabase db dump --data-only > "$data_backup_file" 2>/dev/null; then
        # Compress the data backup
        gzip "$data_backup_file"
        log "Database data backup completed: ${data_backup_file}.gz"
    else
        warning "Database data backup failed"
    fi
}

# Backup environment configuration
backup_environment_config() {
    log "Starting environment configuration backup..."
    
    local config_backup_dir="$BACKUP_DIR/environment-config-$TIMESTAMP"
    mkdir -p "$config_backup_dir"
    
    # Backup configuration files (without sensitive data)
    local config_files=(
        ".env.example"
        "package.json"
        "package-lock.json"
        "vite.config.ts"
        "tsconfig.json"
        "tailwind.config.js"
        "supabase/config.toml"
        "deployment/*.yml"
        "deployment/*.json"
        "deployment/*.tf"
    )
    
    for pattern in "${config_files[@]}"; do
        if ls "$PROJECT_ROOT"/$pattern 1> /dev/null 2>&1; then
            cp -r "$PROJECT_ROOT"/$pattern "$config_backup_dir/" 2>/dev/null || true
        fi
    done
    
    # Create environment documentation
    cat > "$config_backup_dir/environment-info.txt" << EOF
Environment Configuration Backup
Generated: $(date)
Project: Concierge Transaction Flow
Node Version: $(node --version 2>/dev/null || echo "Not available")
NPM Version: $(npm --version 2>/dev/null || echo "Not available")
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "Not available")
Git Branch: $(git branch --show-current 2>/dev/null || echo "Not available")
EOF
    
    # Compress configuration backup
    tar -czf "$BACKUP_DIR/environment-config-$TIMESTAMP.tar.gz" -C "$BACKUP_DIR" "environment-config-$TIMESTAMP"
    rm -rf "$config_backup_dir"
    
    log "Environment configuration backup completed"
}

# Backup deployment artifacts
backup_deployment_artifacts() {
    log "Starting deployment artifacts backup..."
    
    local artifacts_backup_dir="$BACKUP_DIR/deployment-artifacts-$TIMESTAMP"
    mkdir -p "$artifacts_backup_dir"
    
    # Build the application to create artifacts
    cd "$PROJECT_ROOT"
    if [ -f "package.json" ]; then
        log "Building application for artifact backup..."
        npm ci --silent > /dev/null 2>&1 || warning "npm install failed"
        npm run build > /dev/null 2>&1 || warning "Build failed"
        
        # Copy build artifacts
        if [ -d "dist" ]; then
            cp -r "dist" "$artifacts_backup_dir/"
            log "Build artifacts backed up"
        fi
    fi
    
    # Copy deployment configuration
    if [ -d "deployment" ]; then
        cp -r "deployment" "$artifacts_backup_dir/"
        log "Deployment configuration backed up"
    fi
    
    # Copy CI/CD configuration
    if [ -d ".github" ]; then
        cp -r ".github" "$artifacts_backup_dir/"
        log "CI/CD configuration backed up"
    fi
    
    # Compress artifacts backup
    tar -czf "$BACKUP_DIR/deployment-artifacts-$TIMESTAMP.tar.gz" -C "$BACKUP_DIR" "deployment-artifacts-$TIMESTAMP"
    rm -rf "$artifacts_backup_dir"
    
    log "Deployment artifacts backup completed"
}

# Create backup manifest
create_backup_manifest() {
    log "Creating backup manifest..."
    
    local manifest_file="$BACKUP_DIR/backup-manifest-$TIMESTAMP.json"
    
    cat > "$manifest_file" << EOF
{
  "backup_timestamp": "$TIMESTAMP",
  "backup_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "project_name": "concierge-transaction-flow",
  "project_version": "$(cat "$PROJECT_ROOT/package.json" | jq -r '.version' 2>/dev/null || echo 'unknown')",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "git_branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
  "backup_components": {
    "application_code": {
      "file": "application-code-$TIMESTAMP.tar.gz",
      "size": "$(du -h "$BACKUP_DIR/application-code-$TIMESTAMP.tar.gz" 2>/dev/null | cut -f1 || echo 'unknown')",
      "checksum": "$(sha256sum "$BACKUP_DIR/application-code-$TIMESTAMP.tar.gz" 2>/dev/null | cut -d' ' -f1 || echo 'unknown')"
    },
    "database_schema": {
      "file": "database-schema-$TIMESTAMP.tar.gz",
      "size": "$(du -h "$BACKUP_DIR/database-schema-$TIMESTAMP.tar.gz" 2>/dev/null | cut -f1 || echo 'unknown')",
      "checksum": "$(sha256sum "$BACKUP_DIR/database-schema-$TIMESTAMP.tar.gz" 2>/dev/null | cut -d' ' -f1 || echo 'unknown')"
    },
    "environment_config": {
      "file": "environment-config-$TIMESTAMP.tar.gz",
      "size": "$(du -h "$BACKUP_DIR/environment-config-$TIMESTAMP.tar.gz" 2>/dev/null | cut -f1 || echo 'unknown')",
      "checksum": "$(sha256sum "$BACKUP_DIR/environment-config-$TIMESTAMP.tar.gz" 2>/dev/null | cut -d' ' -f1 || echo 'unknown')"
    },
    "deployment_artifacts": {
      "file": "deployment-artifacts-$TIMESTAMP.tar.gz",
      "size": "$(du -h "$BACKUP_DIR/deployment-artifacts-$TIMESTAMP.tar.gz" 2>/dev/null | cut -f1 || echo 'unknown')",
      "checksum": "$(sha256sum "$BACKUP_DIR/deployment-artifacts-$TIMESTAMP.tar.gz" 2>/dev/null | cut -d' ' -f1 || echo 'unknown')"
    }
  },
  "backup_location": "$BACKUP_DIR",
  "total_backup_size": "$(du -sh "$BACKUP_DIR" | cut -f1)"
}
EOF

    log "Backup manifest created: $manifest_file"
}

# Verify backup integrity
verify_backup_integrity() {
    log "Verifying backup integrity..."
    
    local manifest_file="$BACKUP_DIR/backup-manifest-$TIMESTAMP.json"
    local verification_passed=true
    
    if [ ! -f "$manifest_file" ]; then
        error "Backup manifest not found"
        return 1
    fi
    
    # Verify each backup component
    local components=("application_code" "database_schema" "environment_config" "deployment_artifacts")
    
    for component in "${components[@]}"; do
        local filename=$(jq -r ".backup_components.$component.file" "$manifest_file" 2>/dev/null)
        local expected_checksum=$(jq -r ".backup_components.$component.checksum" "$manifest_file" 2>/dev/null)
        
        if [ "$filename" != "null" ] && [ "$expected_checksum" != "null" ]; then
            local backup_file="$BACKUP_DIR/$filename"
            
            if [ -f "$backup_file" ]; then
                local actual_checksum=$(sha256sum "$backup_file" | cut -d' ' -f1)
                
                if [ "$actual_checksum" = "$expected_checksum" ]; then
                    log "✓ $component backup verified"
                else
                    error "✗ $component backup verification failed"
                    verification_passed=false
                fi
            else
                error "✗ $component backup file not found: $backup_file"
                verification_passed=false
            fi
        fi
    done
    
    if [ "$verification_passed" = true ]; then
        log "Backup integrity verification passed"
        return 0
    else
        error "Backup integrity verification failed"
        return 1
    fi
}

# Clean old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    local retention_days=${BACKUP_RETENTION_DAYS:-30}
    
    # Find and remove backups older than retention period
    local old_backups=$(find "$BACKUP_DIR" -name "*-[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]_[0-9][0-9]-[0-9][0-9]-[0-9][0-9].*" -mtime +$retention_days 2>/dev/null || true)
    
    if [ -n "$old_backups" ]; then
        echo "$old_backups" | while read -r old_backup; do
            if [ -f "$old_backup" ]; then
                rm -f "$old_backup"
                info "Removed old backup: $(basename "$old_backup")"
            fi
        done
    else
        info "No old backups to clean up"
    fi
    
    log "Old backup cleanup completed"
}

# Restore from backup
restore_from_backup() {
    local backup_timestamp=$1
    
    if [ -z "$backup_timestamp" ]; then
        error "Backup timestamp is required for restore operation"
        exit 1
    fi
    
    log "Starting restore from backup: $backup_timestamp"
    
    local manifest_file="$BACKUP_DIR/backup-manifest-$backup_timestamp.json"
    local restore_dir="$PROJECT_ROOT/restore-$backup_timestamp"
    
    if [ ! -f "$manifest_file" ]; then
        error "Backup manifest not found: $manifest_file"
        exit 1
    fi
    
    # Create restore directory
    mkdir -p "$restore_dir"
    
    # Restore application code
    local app_backup="$BACKUP_DIR/application-code-$backup_timestamp.tar.gz"
    if [ -f "$app_backup" ]; then
        log "Restoring application code..."
        tar -xzf "$app_backup" -C "$restore_dir"
    fi
    
    # Restore database schema
    local schema_backup="$BACKUP_DIR/database-schema-$backup_timestamp.tar.gz"
    if [ -f "$schema_backup" ]; then
        log "Restoring database schema..."
        tar -xzf "$schema_backup" -C "$restore_dir"
    fi
    
    # Restore environment configuration
    local config_backup="$BACKUP_DIR/environment-config-$backup_timestamp.tar.gz"
    if [ -f "$config_backup" ]; then
        log "Restoring environment configuration..."
        tar -xzf "$config_backup" -C "$restore_dir"
    fi
    
    log "Restore completed to: $restore_dir"
    warning "Please review restored files before replacing current deployment"
}

# Main backup function
main_backup() {
    log "Starting comprehensive backup process..."
    
    init_backup_dir
    check_prerequisites
    
    backup_application_code
    backup_database_schema
    backup_database_data
    backup_environment_config
    backup_deployment_artifacts
    
    create_backup_manifest
    
    if verify_backup_integrity; then
        log "Backup process completed successfully"
        cleanup_old_backups
        
        # Display backup summary
        info "Backup Summary:"
        info "  Timestamp: $TIMESTAMP"
        info "  Location: $BACKUP_DIR"
        info "  Total Size: $(du -sh "$BACKUP_DIR" | cut -f1)"
        info "  Components: Application Code, Database Schema, Database Data, Environment Config, Deployment Artifacts"
    else
        error "Backup process failed verification"
        exit 1
    fi
}

# Script usage
usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  backup                    Perform full backup"
    echo "  restore TIMESTAMP         Restore from backup"
    echo "  verify TIMESTAMP          Verify backup integrity"
    echo "  list                      List available backups"
    echo "  cleanup                   Clean old backups"
    echo ""
    echo "Environment Variables:"
    echo "  BACKUP_RETENTION_DAYS     Number of days to retain backups (default: 30)"
    echo ""
    echo "Examples:"
    echo "  $0 backup"
    echo "  $0 restore 2024-01-15_10-30-45"
    echo "  $0 verify 2024-01-15_10-30-45"
    echo "  $0 list"
    echo "  $0 cleanup"
}

# List available backups
list_backups() {
    log "Available backups:"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        info "No backup directory found"
        return
    fi
    
    local manifests=$(ls "$BACKUP_DIR"/backup-manifest-*.json 2>/dev/null || true)
    
    if [ -z "$manifests" ]; then
        info "No backups found"
        return
    fi
    
    echo "Timestamp          Date                  Size      Git Commit"
    echo "----------------   ------------------    --------  -----------"
    
    for manifest in $manifests; do
        local timestamp=$(basename "$manifest" .json | sed 's/backup-manifest-//')
        local date=$(jq -r '.backup_date' "$manifest" 2>/dev/null || echo 'unknown')
        local size=$(jq -r '.total_backup_size' "$manifest" 2>/dev/null || echo 'unknown')
        local commit=$(jq -r '.git_commit' "$manifest" 2>/dev/null | cut -c1-8 || echo 'unknown')
        
        printf "%-18s %-18s %-8s  %s\n" "$timestamp" "$date" "$size" "$commit"
    done
}

# Handle command line arguments
case "${1:-}" in
    backup)
        main_backup
        ;;
    restore)
        if [ -z "${2:-}" ]; then
            error "Backup timestamp is required for restore"
            usage
            exit 1
        fi
        restore_from_backup "$2"
        ;;
    verify)
        if [ -z "${2:-}" ]; then
            error "Backup timestamp is required for verification"
            usage
            exit 1
        fi
        TIMESTAMP="$2"
        verify_backup_integrity
        ;;
    list)
        list_backups
        ;;
    cleanup)
        init_backup_dir
        cleanup_old_backups
        ;;
    -h|--help)
        usage
        exit 0
        ;;
    *)
        error "Unknown command: ${1:-}"
        usage
        exit 1
        ;;
esac