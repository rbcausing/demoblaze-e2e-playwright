#!/bin/bash

# Jenkins Setup Helper Script
# This script helps automate Jenkins configuration for the Demoblaze E2E Testing Framework

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
JENKINS_URL="${JENKINS_URL:-http://localhost:8080}"
JOB_NAME="Demoblaze-E2E-Tests"
REQUIRED_PLUGINS=(
    "workflow-aggregator"
    "git"
    "nodejs"
    "htmlpublisher"
    "junit"
    "github"
    "timestamper"
    "ansicolor"
)

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

log_section() {
    echo -e "\n${CYAN}=== $@ ===${NC}\n"
}

# Print welcome message
print_welcome() {
    echo -e "${CYAN}"
    cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║          Demoblaze E2E Testing - Jenkins Setup              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    log_info "This script will help you set up Jenkins for the Demoblaze E2E testing framework"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    log_section "Checking Prerequisites"
    
    # Check if Jenkins is running
    log_info "Checking Jenkins availability at $JENKINS_URL..."
    if command -v curl &> /dev/null; then
        if curl -s -o /dev/null -w "%{http_code}" "$JENKINS_URL" | grep -q "200\|403"; then
            log_success "Jenkins is accessible at $JENKINS_URL"
        else
            log_error "Jenkins is not accessible at $JENKINS_URL"
            log_warning "Please ensure Jenkins is running and accessible"
            exit 1
        fi
    else
        log_warning "curl not found, skipping Jenkins connectivity check"
    fi
    
    # Check if Node.js is installed
    if command -v node &> /dev/null; then
        log_success "Node.js found: $(node --version)"
    else
        log_error "Node.js not found. Please install Node.js 18 or higher"
        exit 1
    fi
    
    # Check if Git is installed
    if command -v git &> /dev/null; then
        log_success "Git found: $(git --version | head -1)"
    else
        log_error "Git not found. Please install Git"
        exit 1
    fi
}

# Display required plugins
display_required_plugins() {
    log_section "Required Jenkins Plugins"
    
    log_info "The following plugins are required for this project:"
    echo ""
    
    for plugin in "${REQUIRED_PLUGINS[@]}"; do
        echo "   📦 $plugin"
    done
    
    echo ""
    log_info "To install plugins via Jenkins CLI:"
    echo "   java -jar jenkins-cli.jar -s $JENKINS_URL install-plugin ${REQUIRED_PLUGINS[@]}"
    echo ""
    log_info "Or install manually via Jenkins UI:"
    echo "   Manage Jenkins → Plugins → Available Plugins"
    echo ""
}

# Generate Jenkinsfile template
generate_jenkinsfile_info() {
    log_section "Jenkinsfile Configuration"
    
    if [ -f "Jenkinsfile" ]; then
        log_success "Jenkinsfile already exists in the project"
        log_info "Location: $(pwd)/Jenkinsfile"
    else
        log_warning "Jenkinsfile not found"
        log_info "Create one using the template in jenkins/examples/Jenkinsfile"
    fi
}

# Display NodeJS configuration instructions
display_nodejs_config() {
    log_section "NodeJS Tool Configuration"
    
    echo "Configure NodeJS in Jenkins:"
    echo ""
    echo "1. Go to: Manage Jenkins → Tools"
    echo "2. Scroll to 'NodeJS installations'"
    echo "3. Click 'Add NodeJS'"
    echo "4. Configure as follows:"
    echo "   Name:                Node-20"
    echo "   Install automatically: ✓ (checked)"
    echo "   Version:             NodeJS 20.x (LTS)"
    echo ""
    log_info "This name 'Node-20' must match the 'tools' section in your Jenkinsfile"
    echo ""
}

# Display pipeline job creation steps
display_pipeline_creation() {
    log_section "Pipeline Job Creation"
    
    echo "Create a new Pipeline job in Jenkins:"
    echo ""
    echo "1. Go to Jenkins Dashboard"
    echo "2. Click 'New Item'"
    echo "3. Enter name: '$JOB_NAME'"
    echo "4. Select 'Pipeline'"
    echo "5. Click 'OK'"
    echo ""
    echo "Configure the Pipeline:"
    echo ""
    echo "6. In 'Build Triggers' (optional):"
    echo "   □ GitHub hook trigger for GITScm polling"
    echo ""
    echo "7. In 'Pipeline' section:"
    echo "   Definition:       Pipeline script from SCM"
    echo "   SCM:             Git"
    echo "   Repository URL:  <your-github-repo-url>"
    echo "   Credentials:     <add-github-credentials>"
    echo "   Branch:          */main"
    echo "   Script Path:     Jenkinsfile"
    echo ""
    echo "8. Click 'Save'"
    echo ""
}

# Display credentials setup
display_credentials_setup() {
    log_section "Credentials Configuration"
    
    echo "Set up credentials in Jenkins (if needed):"
    echo ""
    echo "1. Go to: Manage Jenkins → Credentials"
    echo "2. Click on '(global)' domain"
    echo "3. Click 'Add Credentials'"
    echo ""
    echo "For GitHub access:"
    echo "   Kind:        Username with password (or GitHub token)"
    echo "   Username:    <your-github-username>"
    echo "   Password:    <your-github-token-or-password>"
    echo "   ID:          github-credentials"
    echo "   Description: GitHub Access for E2E Tests"
    echo ""
}

# Display HTML Publisher configuration
display_html_publisher_config() {
    log_section "HTML Publisher Configuration"
    
    echo "Configure HTML Publisher for test reports:"
    echo ""
    echo "This is configured in the Jenkinsfile, but verify in job configuration:"
    echo ""
    echo "   Report directory:      playwright-report"
    echo "   Index page:           index.html"
    echo "   Report title:         Playwright Test Report"
    echo "   Keep past HTML reports: ✓ (checked)"
    echo ""
    log_info "Reports will be available under 'HTML Reports' link in build sidebar"
    echo ""
}

# Display webhook setup
display_webhook_setup() {
    log_section "GitHub Webhook Setup (Optional)"
    
    echo "Set up GitHub webhook for automatic builds:"
    echo ""
    echo "1. Go to your GitHub repository"
    echo "2. Navigate to: Settings → Webhooks → Add webhook"
    echo "3. Configure as follows:"
    echo "   Payload URL:  $JENKINS_URL/github-webhook/"
    echo "   Content type: application/json"
    echo "   Events:       Just the push event"
    echo "   Active:       ✓ (checked)"
    echo ""
    echo "4. Click 'Add webhook'"
    echo ""
    log_info "Ensure Jenkins is accessible from the internet or use ngrok for local testing"
    echo ""
}

# Display troubleshooting tips
display_troubleshooting() {
    log_section "Troubleshooting Tips"
    
    echo "Common Issues and Solutions:"
    echo ""
    echo "Issue: 'node command not found'"
    echo "   → Ensure NodeJS plugin is installed and configured"
    echo "   → Verify 'Node-20' tool name matches Jenkinsfile"
    echo ""
    echo "Issue: 'Playwright browsers not found'"
    echo "   → Run: npx playwright install --with-deps"
    echo "   → Check install-dependencies.sh script"
    echo ""
    echo "Issue: 'HTML report not displaying'"
    echo "   → Go to: Manage Jenkins → Script Console"
    echo "   → Run: System.setProperty(\"hudson.model.DirectoryBrowserSupport.CSP\", \"\")"
    echo ""
    echo "Issue: 'Tests failing in Jenkins but passing locally'"
    echo "   → Check headless mode configuration"
    echo "   → Verify environment variables"
    echo "   → Check browser dependencies on Jenkins server"
    echo ""
}

# Display next steps
display_next_steps() {
    log_section "Next Steps"
    
    echo "After completing the setup above:"
    echo ""
    echo "1. ✅ Install required Jenkins plugins"
    echo "2. ✅ Configure NodeJS tool (Node-20)"
    echo "3. ✅ Create Pipeline job ($JOB_NAME)"
    echo "4. ✅ Set up GitHub credentials (if using private repo)"
    echo "5. ✅ Configure webhook (for automatic builds)"
    echo "6. ✅ Run first build manually to test"
    echo "7. ✅ Verify HTML reports are generated"
    echo ""
    log_success "Once complete, your Jenkins CI/CD pipeline will be ready!"
    echo ""
}

# Generate configuration file
generate_config_file() {
    local config_file="jenkins-setup-config.txt"
    
    log_info "Generating configuration reference file..."
    
    cat > "$config_file" << EOF
# Jenkins Setup Configuration Reference
# Generated on: $(date)

JENKINS_URL=$JENKINS_URL
JOB_NAME=$JOB_NAME
REPOSITORY_URL=<your-github-repo-url>

# Required Plugins:
$(printf '  - %s\n' "${REQUIRED_PLUGINS[@]}")

# NodeJS Configuration:
  Name: Node-20
  Version: NodeJS 20.x LTS

# GitHub Webhook:
  Payload URL: $JENKINS_URL/github-webhook/

# HTML Publisher:
  Report Directory: playwright-report
  Index Page: index.html

# Environment Variables (set in Jenkinsfile or Jenkins config):
  BASE_URL=https://www.demoblaze.com
  CI=true
  HEADLESS=true
  TIMEOUT=30000

# Useful Commands:
  Install dependencies: ./jenkins/scripts/install-dependencies.sh
  Run tests:           ./jenkins/scripts/run-tests.sh --test-type smoke
  Cleanup:             ./jenkins/scripts/cleanup.sh
EOF
    
    log_success "Configuration reference saved to: $config_file"
}

# Main execution
main() {
    print_welcome
    check_prerequisites
    display_required_plugins
    generate_jenkinsfile_info
    display_nodejs_config
    display_pipeline_creation
    display_credentials_setup
    display_html_publisher_config
    display_webhook_setup
    display_troubleshooting
    generate_config_file
    display_next_steps
    
    log_success "Jenkins setup guide completed!"
    log_info "Review the jenkins-setup-config.txt file for quick reference"
}

# Run main function
main