#!/bin/bash

# Jenkins Dependency Installation Script
# This script installs all required dependencies for the Demoblaze E2E Testing Framework

set -e  # Exit on any error

# Configuration
DRY_RUN=false
SKIP_BROWSERS=false
BROWSERS="chromium firefox webkit"
MIN_DISK_SPACE_MB=2000
LOG_FILE="dependency-install.log"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function with timestamp
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() {
    log "INFO" "${BLUE}ℹ️  $@${NC}"
}

log_success() {
    log "SUCCESS" "${GREEN}✅ $@${NC}"
}

log_warning() {
    log "WARNING" "${YELLOW}⚠️  $@${NC}"
}

log_error() {
    log "ERROR" "${RED}❌ $@${NC}"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-browsers)
            SKIP_BROWSERS=true
            shift
            ;;
        --browsers)
            BROWSERS="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --dry-run           Show what would be done without executing"
            echo "  --skip-browsers     Skip Playwright browser installation"
            echo "  --browsers LIST     Specify browsers to install (default: chromium firefox webkit)"
            echo "  --help             Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

log_info "Starting dependency installation..."
if [ "$DRY_RUN" = true ]; then
    log_warning "DRY RUN MODE - No actual changes will be made"
fi

# Check available disk space
check_disk_space() {
    log_info "Checking available disk space..."
    if command -v df &> /dev/null; then
        AVAILABLE_SPACE=$(df -m . | awk 'NR==2 {print $4}')
        if [ "$AVAILABLE_SPACE" -lt "$MIN_DISK_SPACE_MB" ]; then
            log_error "Insufficient disk space. Required: ${MIN_DISK_SPACE_MB}MB, Available: ${AVAILABLE_SPACE}MB"
            exit 1
        fi
        log_success "Disk space check passed (${AVAILABLE_SPACE}MB available)"
    else
        log_warning "Unable to check disk space (df command not available)"
    fi
}

# Check if Node.js is installed
check_nodejs() {
    log_info "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18 or higher."
        exit 1
    fi
    
    log_success "Node.js version: $(node --version)"
}

# Check if npm is installed
check_npm() {
    log_info "Checking npm installation..."
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm."
        exit 1
    fi
    log_success "npm version: $(npm --version)"
}

# Install npm dependencies
install_npm_dependencies() {
    log_info "Installing npm dependencies..."
    
    if [ "$DRY_RUN" = true ]; then
        log_info "Would run: npm ci --silent"
        return 0
    fi
    
    # Clear npm cache if stale
    if [ -d "$HOME/.npm/_locks" ]; then
        log_warning "Found stale npm locks, clearing cache..."
        npm cache clean --force 2>&1 | tee -a "$LOG_FILE"
    fi
    
    if npm ci --silent 2>&1 | tee -a "$LOG_FILE"; then
        log_success "npm dependencies installed successfully"
    else
        log_error "Failed to install npm dependencies"
        log_info "Trying with npm install as fallback..."
        if npm install 2>&1 | tee -a "$LOG_FILE"; then
            log_success "npm dependencies installed successfully (via npm install)"
        else
            log_error "Failed to install npm dependencies even with fallback"
            exit 1
        fi
    fi
}

# Install Playwright browsers
install_playwright_browsers() {
    if [ "$SKIP_BROWSERS" = true ]; then
        log_warning "Skipping browser installation (--skip-browsers flag)"
        return 0
    fi
    
    log_info "Installing Playwright browsers: $BROWSERS"
    
    if [ "$DRY_RUN" = true ]; then
        log_info "Would run: npx playwright install $BROWSERS --with-deps"
        return 0
    fi
    
    if npx playwright install $BROWSERS --with-deps 2>&1 | tee -a "$LOG_FILE"; then
        log_success "Playwright browsers installed successfully"
    else
        log_error "Failed to install Playwright browsers"
        log_warning "Attempting installation without system dependencies..."
        if npx playwright install $BROWSERS 2>&1 | tee -a "$LOG_FILE"; then
            log_success "Playwright browsers installed (without system deps)"
            log_warning "Some system dependencies may be missing. Run 'npx playwright install-deps' manually if tests fail."
        else
            log_error "Failed to install Playwright browsers"
            exit 1
        fi
    fi
}

# Verify Playwright installation
verify_playwright() {
    log_info "Verifying Playwright installation..."
    
    if [ "$DRY_RUN" = true ]; then
        log_info "Would run: npx playwright --version"
        return 0
    fi
    
    if npx playwright --version 2>&1 | tee -a "$LOG_FILE"; then
        log_success "Playwright verification successful"
    else
        log_error "Playwright verification failed"
        exit 1
    fi
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    
    directories=("test-results" "playwright-report" "logs")
    
    for dir in "${directories[@]}"; do
        if [ "$DRY_RUN" = true ]; then
            log_info "Would create: $dir"
        else
            if [ ! -d "$dir" ]; then
                mkdir -p "$dir"
                log_success "Created directory: $dir"
            else
                log_info "Directory already exists: $dir"
            fi
        fi
    done
}

# Display installation summary
display_summary() {
    log_info "==================== Installation Summary ===================="
    log_info "Node.js: $(node --version 2>/dev/null || echo 'Not installed')"
    log_info "npm: $(npm --version 2>/dev/null || echo 'Not installed')"
    log_info "Playwright: $(npx playwright --version 2>/dev/null || echo 'Not installed')"
    log_info "Browsers: $BROWSERS"
    log_info "Log file: $LOG_FILE"
    log_info "=============================================================="
}

# Main execution
main() {
    check_disk_space
    check_nodejs
    check_npm
    install_npm_dependencies
    install_playwright_browsers
    verify_playwright
    create_directories
    display_summary
    
    if [ "$DRY_RUN" = true ]; then
        log_warning "DRY RUN COMPLETED - No actual changes were made"
    else
        log_success "All dependencies installed successfully!"
        log_success "Ready to run tests"
    fi
}

# Trap errors and provide helpful message
trap 'log_error "Installation failed at line $LINENO. Check $LOG_FILE for details."; exit 1' ERR

main