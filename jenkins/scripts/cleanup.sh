#!/bin/bash

# Jenkins Cleanup Script
# This script cleans up test artifacts and temporary files after build completion

set -e  # Exit on any error

# Configuration
DRY_RUN=false
CLEANUP_AGE_DAYS=7
SELECTIVE_CLEANUP=false
PRESERVE_REPORTS=false
MAX_ARTIFACT_SIZE_MB=500

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $@${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $@${NC}"
}

log_error() {
    echo -e "${RED}❌ $@${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $@${NC}"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --age)
            CLEANUP_AGE_DAYS="$2"
            SELECTIVE_CLEANUP=true
            shift 2
            ;;
        --preserve-reports)
            PRESERVE_REPORTS=true
            shift
            ;;
        --max-size)
            MAX_ARTIFACT_SIZE_MB="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run              Show what would be cleaned without deleting"
            echo "  --age DAYS            Clean artifacts older than N days (default: 7)"
            echo "  --preserve-reports    Keep HTML/JUnit reports even if build succeeded"
            echo "  --max-size MB         Clean if artifacts exceed MB (default: 500)"
            echo "  --help                Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --dry-run"
            echo "  $0 --age 3 --preserve-reports"
            echo "  $0 --max-size 1000"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

log_info "Starting cleanup process..."
if [ "$DRY_RUN" = true ]; then
    log_warning "DRY RUN MODE - No actual deletions will be made"
fi

# Track cleanup stats
TOTAL_FREED_MB=0
DIRECTORIES_CLEANED=0
FILES_CLEANED=0

# Function to get directory size in MB
get_dir_size_mb() {
    local dir="$1"
    if [ -d "$dir" ]; then
        if command -v du &> /dev/null; then
            du -sm "$dir" 2>/dev/null | cut -f1
        else
            echo "0"
        fi
    else
        echo "0"
    fi
}

# Function to safely remove directory
cleanup_directory() {
    local dir="$1"
    local reason="${2:-general cleanup}"
    
    if [ ! -d "$dir" ]; then
        log_info "Directory not found: $dir (skipping)"
        return 0
    fi
    
    local size_mb=$(get_dir_size_mb "$dir")
    
    if [ "$DRY_RUN" = true ]; then
        log_warning "Would remove directory: $dir (${size_mb}MB) - $reason"
        TOTAL_FREED_MB=$((TOTAL_FREED_MB + size_mb))
        return 0
    fi
    
    log_info "Removing directory: $dir (${size_mb}MB) - $reason"
    rm -rf "$dir"
    log_success "Removed: $dir (freed ${size_mb}MB)"
    TOTAL_FREED_MB=$((TOTAL_FREED_MB + size_mb))
    DIRECTORIES_CLEANED=$((DIRECTORIES_CLEANED + 1))
}

# Function to safely remove file
cleanup_file() {
    local file="$1"
    local reason="${2:-general cleanup}"
    
    if [ ! -f "$file" ]; then
        return 0
    fi
    
    if [ "$DRY_RUN" = true ]; then
        log_warning "Would remove file: $file - $reason"
        FILES_CLEANED=$((FILES_CLEANED + 1))
        return 0
    fi
    
    log_info "Removing file: $file - $reason"
    rm -f "$file"
    log_success "Removed: $file"
    FILES_CLEANED=$((FILES_CLEANED + 1))
}

# Function to clean old files by age
cleanup_old_files() {
    local dir="$1"
    local days="$2"
    local pattern="${3:-*}"
    
    if [ ! -d "$dir" ]; then
        return 0
    fi
    
    log_info "Cleaning files in $dir older than $days days..."
    
    if [ "$DRY_RUN" = true ]; then
        local count=$(find "$dir" -name "$pattern" -type f -mtime +$days 2>/dev/null | wc -l)
        log_warning "Would remove $count files from $dir"
    else
        find "$dir" -name "$pattern" -type f -mtime +$days -delete 2>/dev/null || true
        log_success "Cleaned old files from $dir"
    fi
}

# Check artifact size and clean if too large
check_artifact_size() {
    local total_size=0
    
    for dir in "test-results" "playwright-report"; do
        if [ -d "$dir" ]; then
            local size=$(get_dir_size_mb "$dir")
            total_size=$((total_size + size))
        fi
    done
    
    log_info "Total artifact size: ${total_size}MB (max: ${MAX_ARTIFACT_SIZE_MB}MB)"
    
    if [ "$total_size" -gt "$MAX_ARTIFACT_SIZE_MB" ]; then
        log_warning "Artifacts exceed maximum size, forcing cleanup..."
        return 1
    fi
    
    return 0
}

# Clean test artifacts based on build status
cleanup_test_artifacts() {
    local build_status="${BUILD_STATUS:-success}"
    
    if [ "$PRESERVE_REPORTS" = true ]; then
        log_info "Preserving reports (--preserve-reports flag set)"
        return 0
    fi
    
    if [ "$SELECTIVE_CLEANUP" = true ]; then
        log_info "Selective cleanup mode: cleaning artifacts older than $CLEANUP_AGE_DAYS days"
        cleanup_old_files "test-results" "$CLEANUP_AGE_DAYS"
        cleanup_old_files "playwright-report" "$CLEANUP_AGE_DAYS"
    elif [ "$build_status" = "success" ]; then
        log_success "Build successful - cleaning up test artifacts"
        cleanup_directory "test-results" "successful build"
        cleanup_directory "playwright-report" "successful build"
    else
        log_warning "Build failed - preserving test artifacts for debugging"
        log_info "Test results preserved at: test-results/"
        log_info "HTML report preserved at: playwright-report/"
    fi
}

# Clean temporary files
cleanup_temp_files() {
    log_info "Cleaning up temporary files..."
    
    # Node.js cache
    cleanup_directory "node_modules/.cache" "node cache"
    
    # Playwright cache (only if very old)
    if [ -d "$HOME/.cache/ms-playwright" ]; then
        local cache_age=$(find "$HOME/.cache/ms-playwright" -type f -mtime +30 2>/dev/null | wc -l)
        if [ "$cache_age" -gt 0 ]; then
            log_warning "Found old Playwright cache files (30+ days old)"
            cleanup_old_files "$HOME/.cache/ms-playwright" 30
        fi
    fi
    
    # Temporary files in workspace
    find . -maxdepth 1 -name "*.tmp" -o -name "*.log" -o -name ".DS_Store" 2>/dev/null | while read file; do
        cleanup_file "$file" "temporary file"
    done
    
    # Old log files
    if [ -d "logs" ]; then
        cleanup_old_files "logs" "$CLEANUP_AGE_DAYS" "*.log"
    fi
}

# Clean up running processes
cleanup_processes() {
    log_info "Checking for running Playwright processes..."
    
    PLAYWRIGHT_PIDS=$(pgrep -f "playwright" 2>/dev/null || true)
    if [ -n "$PLAYWRIGHT_PIDS" ]; then
        if [ "$DRY_RUN" = true ]; then
            log_warning "Would terminate Playwright processes: $PLAYWRIGHT_PIDS"
        else
            log_warning "Found running Playwright processes, terminating..."
            echo "$PLAYWRIGHT_PIDS" | xargs kill -9 2>/dev/null || true
            log_success "Terminated Playwright processes"
        fi
    else
        log_info "No running Playwright processes found"
    fi
    
    log_info "Checking for orphaned browser processes..."
    BROWSER_PIDS=$(pgrep -f "chrome|firefox|webkit" 2>/dev/null || true)
    if [ -n "$BROWSER_PIDS" ]; then
        if [ "$DRY_RUN" = true ]; then
            log_warning "Would terminate browser processes: $BROWSER_PIDS"
        else
            log_warning "Found running browser processes, terminating..."
            echo "$BROWSER_PIDS" | xargs kill -9 2>/dev/null || true
            log_success "Terminated browser processes"
        fi
    else
        log_info "No orphaned browser processes found"
    fi
}

# Clean up workspace if specified
cleanup_workspace() {
    if [ "${CLEANUP_WORKSPACE:-false}" = "true" ]; then
        log_warning "Full workspace cleanup requested..."
        cleanup_directory "node_modules" "workspace cleanup"
        cleanup_file "package-lock.json" "workspace cleanup"
        log_warning "Workspace cleaned - dependencies will need to be reinstalled"
    fi
}

# Display disk usage
display_disk_usage() {
    log_info "Disk usage:"
    if command -v df &> /dev/null; then
        df -h . 2>/dev/null | head -2
    elif command -v du &> /dev/null; then
        du -sh . 2>/dev/null
    else
        log_warning "Unable to display disk usage (df/du commands not available)"
    fi
}

# Display cleanup summary
display_summary() {
    echo ""
    log_success "Cleanup Summary:"
    echo "   📊 Directories cleaned:  $DIRECTORIES_CLEANED"
    echo "   📄 Files cleaned:        $FILES_CLEANED"
    echo "   💾 Space freed:          ${TOTAL_FREED_MB}MB"
    
    if [ "$DRY_RUN" = true ]; then
        log_info "(DRY RUN - no actual changes made)"
    fi
    
    echo ""
    display_disk_usage
}

# Main execution
main() {
    check_artifact_size || log_warning "Artifact size check failed, proceeding with cleanup"
    cleanup_test_artifacts
    cleanup_temp_files
    cleanup_processes
    cleanup_workspace
    display_summary
    
    log_success "Cleanup completed successfully!"
}

main