#!/bin/bash

# Jenkins Test Execution Script
# This script runs Playwright tests with Jenkins-friendly configuration

set -e  # Exit on any error

# Default values
BROWSER="chromium"
TEST_TYPE="smoke"
REPORTER="html,junit"
RETRIES=2
WORKERS=1
HEADED=false
VIDEO="off"
SCREENSHOT="only-on-failure"
TIMEOUT=30000
TEST_PATH=""
DRY_RUN=false
TRACE="retain-on-failure"

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
        --browser)
            BROWSER="$2"
            shift 2
            ;;
        --test-type)
            TEST_TYPE="$2"
            shift 2
            ;;
        --test-path)
            TEST_PATH="$2"
            shift 2
            ;;
        --reporter)
            REPORTER="$2"
            shift 2
            ;;
        --retries)
            RETRIES="$2"
            shift 2
            ;;
        --workers)
            WORKERS="$2"
            shift 2
            ;;
        --headed)
            HEADED=true
            shift
            ;;
        --video)
            VIDEO="$2"
            shift 2
            ;;
        --screenshot)
            SCREENSHOT="$2"
            shift 2
            ;;
        --timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        --trace)
            TRACE="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --browser BROWSER       Browser to use (chromium, firefox, webkit, mobile-chrome, all)"
            echo "  --test-type TYPE        Test type (smoke, full, regression, shopping, product, user, demoblaze)"
            echo "  --test-path PATH        Specific test file or directory to run"
            echo "  --reporter REPORTER     Reporter format (html,junit,json,list)"
            echo "  --retries NUM           Number of retries for failed tests (default: 2)"
            echo "  --workers NUM           Number of parallel workers (default: 1)"
            echo "  --headed                Run tests in headed mode (visible browser)"
            echo "  --video MODE            Video recording mode (on, off, retain-on-failure) (default: off)"
            echo "  --screenshot MODE       Screenshot mode (on, off, only-on-failure) (default: only-on-failure)"
            echo "  --timeout MS            Test timeout in milliseconds (default: 30000)"
            echo "  --trace MODE            Trace mode (on, off, retain-on-failure) (default: retain-on-failure)"
            echo "  --dry-run               Show what would be executed without running tests"
            echo "  --help                  Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --test-type smoke --browser chromium"
            echo "  $0 --test-type shopping --browser all --workers 3"
            echo "  $0 --test-path tests/demoblaze/laptops-luxury-checkout.spec.ts --headed"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

log_info "Starting test execution..."
echo ""
log_info "📊 Configuration:"
echo "   Browser:      $BROWSER"
echo "   Test Type:    $TEST_TYPE"
echo "   Test Path:    ${TEST_PATH:-<auto from test type>}"
echo "   Reporter:     $REPORTER"
echo "   Retries:      $RETRIES"
echo "   Workers:      $WORKERS"
echo "   Headed:       $HEADED"
echo "   Video:        $VIDEO"
echo "   Screenshot:   $SCREENSHOT"
echo "   Trace:        $TRACE"
echo "   Timeout:      ${TIMEOUT}ms"
echo ""

# Set environment variables
export CI=${CI:-true}
export BASE_URL=${BASE_URL:-"https://www.demoblaze.com"}
export HEADLESS=$([ "$HEADED" = true ] && echo "false" || echo "true")
export TIMEOUT=$TIMEOUT

log_info "🌐 Base URL: $BASE_URL"
log_info "🎭 Headless: $HEADLESS"

# Build the Playwright command
PLAYWRIGHT_CMD="npx playwright test"

# Add project (browser) if specified
if [ "$BROWSER" != "all" ]; then
    PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --project=$BROWSER"
fi

# Add test type filter or specific path
if [ -n "$TEST_PATH" ]; then
    log_info "📂 Running specific test path: $TEST_PATH"
    PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD $TEST_PATH"
else
    case $TEST_TYPE in
        smoke)
            PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --grep=@smoke"
            ;;
        regression)
            PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --grep=@regression"
            ;;
        full)
            # No filter for full tests
            ;;
        demoblaze)
            PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD tests/demoblaze/"
            ;;
        shopping)
            PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD tests/shopping/"
            ;;
        product)
            PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD tests/product/"
            ;;
        user)
            PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD tests/user/"
            ;;
        cart)
            PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD tests/shopping/cart-management.spec.ts tests/shopping/add-to-cart.spec.ts"
            ;;
        checkout)
            PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD tests/shopping/checkout-flow.spec.ts"
            ;;
        *)
            log_error "Unknown test type: $TEST_TYPE"
            echo "Valid types: smoke, regression, full, demoblaze, shopping, product, user, cart, checkout"
            exit 1
            ;;
    esac
fi

# Add reporter
PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --reporter=$REPORTER"

# Add retries
PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --retries=$RETRIES"

# Add workers
PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --workers=$WORKERS"

# Add headed mode if specified
if [ "$HEADED" = true ]; then
    PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --headed"
fi

# Additional options via environment variables
export PLAYWRIGHT_VIDEO=$VIDEO
export PLAYWRIGHT_SCREENSHOT=$SCREENSHOT
export PLAYWRIGHT_TRACE=$TRACE

echo ""
log_info "🚀 Executing command:"
echo "   $PLAYWRIGHT_CMD"
echo ""

if [ "$DRY_RUN" = true ]; then
    log_warning "DRY RUN MODE - Command would be executed but not running actual tests"
    log_info "Environment variables:"
    echo "   CI=$CI"
    echo "   BASE_URL=$BASE_URL"
    echo "   HEADLESS=$HEADLESS"
    echo "   TIMEOUT=$TIMEOUT"
    echo "   PLAYWRIGHT_VIDEO=$PLAYWRIGHT_VIDEO"
    echo "   PLAYWRIGHT_SCREENSHOT=$PLAYWRIGHT_SCREENSHOT"
    echo "   PLAYWRIGHT_TRACE=$PLAYWRIGHT_TRACE"
    exit 0
fi

# Execute the tests
START_TIME=$(date +%s)
eval $PLAYWRIGHT_CMD
EXIT_CODE=$?
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
log_info "⏱️  Test execution time: ${DURATION}s"

if [ $EXIT_CODE -eq 0 ]; then
    log_success "All tests passed successfully!"
    
    # Generate HTML report summary
    if [[ "$REPORTER" == *"html"* ]] && [ -f "playwright-report/index.html" ]; then
        log_success "HTML report generated at: playwright-report/index.html"
    fi
    
    # Display JUnit results if available
    if [[ "$REPORTER" == *"junit"* ]] && [ -f "test-results/results.xml" ]; then
        log_success "JUnit report generated at: test-results/results.xml"
    fi
else
    log_error "Some tests failed (Exit code: $EXIT_CODE)"
    
    # Show failed test details
    log_info "🔍 Failed test details:"
    
    if [ -d "test-results" ]; then
        FAILED_COUNT=$(find test-results -name "*.png" -o -name "*.webm" | wc -l)
        log_warning "Found $FAILED_COUNT failure artifacts (screenshots/videos) in test-results/"
        
        # List most recent failures
        log_info "Most recent test failures:"
        find test-results -type f -name "*.png" -o -name "*.webm" | head -5 | while read file; do
            echo "   - $(basename "$file")"
        done
    fi
    
    # Show trace files
    if [ -f "test-results/trace.zip" ]; then
        log_info "📊 Trace file available: test-results/trace.zip"
        log_info "View with: npx playwright show-trace test-results/trace.zip"
    fi
fi

echo ""
log_info "📋 Test Execution Summary:"
echo "   Exit Code:    $EXIT_CODE"
echo "   Duration:     ${DURATION}s"
echo "   Browser:      $BROWSER"
echo "   Test Type:    $TEST_TYPE"
echo "   Report:       playwright-report/index.html"
echo ""

log_info "🏁 Test execution completed"
exit $EXIT_CODE