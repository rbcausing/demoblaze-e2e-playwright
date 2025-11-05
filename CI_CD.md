# CI/CD Pipeline Documentation

## 🔄 Overview

This document provides comprehensive documentation for the Continuous Integration and Continuous Deployment (CI/CD) pipelines implemented for the Demoblaze E2E Testing Framework. We utilize both Jenkins (self-hosted) and GitHub Actions (cloud-based) for robust automation.

---

## 🏗️ Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Developer Workflow                              │
│  (Local Development → Git Push → Pull Request)               │
└────────────────────┬─────────────────────────────────────────┘
                     │
            ┌────────┴─────────┐
            │                  │
            ▼                  ▼
┌───────────────────┐  ┌───────────────────┐
│  GitHub Actions   │  │     Jenkins       │
│  (Cloud CI/CD)    │  │  (Self-Hosted)    │
└────────┬──────────┘  └────────┬──────────┘
         │                      │
         │  Smoke Tests         │  Full Regression
         │  Quick Feedback      │  Comprehensive Validation
         │  PR Validation       │  Nightly Builds
         │                      │
         ▼                      ▼
┌─────────────────────────────────────────┐
│        Test Execution                   │
│  (Playwright Test Runner)               │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│        Reporting & Artifacts            │
│  (HTML, Allure, JUnit, Screenshots)     │
└─────────────────────────────────────────┘
```

---

## 🐙 GitHub Actions Pipeline

### Pipeline File

**Location**: `.github/workflows/playwright.yml`

### Workflow Configuration

```yaml
name: Playwright E2E Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * *'  # Nightly at 2 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  smoke-tests:
    name: Smoke Tests (Chromium)
    runs-on: ubuntu-latest
    timeout-minutes: 10
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      - name: Run smoke tests
        run: npm run test:smoke
        env:
          BASE_URL: https://www.demoblaze.com
          CI: true
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-smoke
          path: playwright-report/
          retention-days: 7
  
  regression-tests:
    name: Regression Tests (${{ matrix.browser }})
    needs: smoke-tests
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps ${{ matrix.browser }}
      
      - name: Run regression tests
        run: npx playwright test --project=${{ matrix.browser }} --grep=@regression
        env:
          BASE_URL: https://www.demoblaze.com
          CI: true
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/
          retention-days: 30
      
      - name: Upload Allure results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: allure-results-${{ matrix.browser }}
          path: allure-results/
          retention-days: 30
```

### Workflow Stages

#### 1. **Trigger Events**
- **Push to main/develop**: Automatic execution
- **Pull Request**: Required check before merge
- **Schedule**: Nightly regression at 2 AM UTC
- **Manual**: On-demand execution via UI

#### 2. **Smoke Tests** (Fast Feedback)
- Duration: ~2 minutes
- Browser: Chromium only
- Purpose: Quick validation of critical paths
- Blocks: PR merge if failed

#### 3. **Regression Tests** (Comprehensive)
- Duration: ~12-15 minutes
- Browsers: Chromium, Firefox, WebKit (parallel)
- Purpose: Full feature validation
- Reports: HTML, Allure, artifacts

### GitHub Actions Benefits

✅ **Zero Infrastructure**: No server management  
✅ **Scalability**: Unlimited parallel jobs  
✅ **Fast Setup**: Pre-configured environments  
✅ **GitHub Integration**: Native PR checks  
✅ **Cost-Effective**: Free for public repos

---

## 🔧 Jenkins Pipeline

### Pipeline File

**Location**: `Jenkinsfile`

### Pipeline Overview

The Jenkins pipeline is a sophisticated, enterprise-grade implementation with multiple stages, parallel execution, and comprehensive error handling.

### Pipeline Stages

#### 1. **Pipeline Initialization** 🚀

```groovy
stage('🚀 Pipeline Initialization') {
  steps {
    script {
      echo """
      ╔═══════════════════════════════════════════════════════════╗
      ║         Demoblaze E2E Test Pipeline                       ║
      ╠═══════════════════════════════════════════════════════════╣
      ║ Environment:     ${params.ENVIRONMENT}
      ║ Test Suite:      ${params.TEST_SUITE}
      ║ Browser:         ${params.BROWSER}
      ║ Base URL:        ${env.BASE_URL}
      ╚═══════════════════════════════════════════════════════════╝
      """
    }
  }
}
```

**Purpose**: Display pipeline configuration and set build metadata

#### 2. **Setup & Dependencies** 📦

```groovy
stage('📦 Setup & Dependencies') {
  when {
    expression { return !params.SKIP_INSTALL }
  }
  steps {
    sh '''
      npm ci --prefer-offline --no-audit
      npx playwright install --with-deps
      npx playwright --version
    '''
  }
}
```

**Purpose**: Install Node.js dependencies and Playwright browsers

**Features**:
- Clean install for reproducibility
- Optional skip for cached dependencies
- Version verification

#### 3. **Test Execution** 🧪

##### Smoke Tests (Parallel)

```groovy
stage('Smoke Tests') {
  parallel {
    stage('Chromium Smoke') {
      steps {
        runTests('chromium', 'smoke', '@smoke')
      }
    }
    stage('Firefox Smoke') {
      steps {
        runTests('firefox', 'smoke', '@smoke')
      }
    }
    stage('WebKit Smoke') {
      steps {
        runTests('webkit', 'smoke', '@smoke')
      }
    }
  }
}
```

**Features**:
- Parallel execution across browsers
- 3x faster than sequential
- Immediate feedback on failures

##### Full Test Suite

```groovy
stage('Full Test Suite') {
  when {
    allOf {
      expression { params.TEST_SUITE == 'full' }
      branch 'main'
    }
  }
  parallel {
    stage('Chromium Full') { ... }
    stage('Firefox Full') { ... }
    stage('WebKit Full') { ... }
  }
}
```

**Conditions**:
- Only on main/master branch
- Only for full test suite parameter
- Parallel execution

##### Regression Tests

```groovy
stage('Regression Tests') {
  steps {
    sh """
      npx playwright test \
        --grep="@regression" \
        --retries=${env.RETRY_COUNT} \
        --workers=${env.MAX_WORKERS}
    """
  }
}
```

**Features**:
- Configurable retry count
- Dynamic worker allocation
- Tagged test execution

##### Mobile Tests

```groovy
stage('Mobile Tests') {
  when {
    anyOf {
      branch 'main'
      expression { params.ENVIRONMENT == 'production' }
    }
  }
  parallel {
    stage('Mobile Chrome') { ... }
    stage('Mobile Safari') { ... }
  }
}
```

**Conditions**:
- Main branch or production environment
- Parallel mobile device testing

#### 4. **Test Analysis & Reporting** 📊

```groovy
stage('📊 Test Analysis & Reporting') {
  steps {
    archiveArtifacts artifacts: 'test-results/**/*'
    archiveArtifacts artifacts: 'playwright-report/**/*'
    
    publishHTML([
      reportDir: 'playwright-report',
      reportFiles: 'index.html',
      reportName: 'Playwright Test Report'
    ])
    
    junit testResults: 'test-results/results.xml'
    
    generateTestMetrics()
  }
}
```

**Artifacts**:
- HTML test reports
- JUnit XML for trending
- Screenshots (failures only)
- Videos (failures only)
- Trace files (on retry)

### Pipeline Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `ENVIRONMENT` | Choice | `dev` | Target environment (dev/staging/production) |
| `TEST_SUITE` | Choice | `smoke` | Test suite to run (smoke/full/regression/mobile/all) |
| `BROWSER` | Choice | `all` | Browser selection (all/chromium/firefox/webkit) |
| `SKIP_INSTALL` | Boolean | `false` | Skip dependency installation |
| `SLACK_CHANNEL` | String | `#qa-automation` | Slack notification channel |

### Pipeline Variables

```groovy
environment {
  NODE_VERSION = '20'
  CI = 'true'
  
  // Environment-specific URLs
  BASE_URL = "${params.ENVIRONMENT == 'production' ? 
                'https://www.demoblaze.com' : 
                'https://dev.demoblaze.com'}"
  
  // Test execution settings
  MAX_WORKERS = "${env.BRANCH_NAME == 'main' ? '2' : '4'}"
  RETRY_COUNT = "${params.ENVIRONMENT == 'production' ? '3' : '2'}"
  
  // Notification settings
  NOTIFY_ON_SUCCESS = "${env.BRANCH_NAME == 'main' ? 'true' : 'false'}"
  NOTIFY_ON_FAILURE = 'true'
}
```

### Post-Pipeline Actions

#### Success 🎉

```groovy
success {
  script {
    echo '✅ All tests passed'
    echo '📊 Test reports available'
    
    if (env.NOTIFY_ON_SUCCESS == 'true') {
      sendNotifications('SUCCESS')
    }
  }
}
```

#### Failure ❌

```groovy
failure {
  script {
    echo '❌ Pipeline failed'
    echo '🔍 Check test reports for details'
    
    sendNotifications('FAILURE')
  }
}
```

#### Cleanup 🧹

```groovy
cleanup {
  sh '''
    rm -rf test-results/.cache/
    rm -rf node_modules/.cache/
    find test-results -type f -name "*.webm" -mtime +7 -delete
  '''
}
```

### Helper Functions

#### runTests()

```groovy
def runTests(String browser, String testType, String grepPattern) {
  script {
    def grepFlag = grepPattern ? "--grep=\"${grepPattern}\"" : ""
    
    sh """
      npx playwright test \
        --project=${browser} \
        ${grepFlag} \
        --workers=${env.MAX_WORKERS} \
        --reporter=html,json,junit || true
    """
  }
  
  archiveTestResults(testType)
}
```

#### sendNotifications()

```groovy
def sendNotifications(String status) {
  def color = status == 'SUCCESS' ? 'good' : 'danger'
  def emoji = status == 'SUCCESS' ? '✅' : '❌'
  
  // Slack notification
  slackSend(
    channel: params.SLACK_CHANNEL,
    color: color,
    message: "${emoji} Demoblaze E2E Tests - ${status}"
  )
  
  // Email notification
  emailext(
    subject: "${emoji} Test Results - ${status}",
    body: "Test execution completed with status: ${status}",
    to: '${DEFAULT_RECIPIENTS}'
  )
}
```

---

## 📊 Reporting & Artifacts

### Report Types

#### 1. Playwright HTML Report

**Access**: `http://jenkins-server/job/demoblaze-e2e/lastBuild/Playwright_20Test_20Report/`

**Features**:
- Interactive test results
- Failure screenshots
- Video recordings
- Detailed error messages
- Execution timeline

#### 2. Allure Report

**Generation**: 
```bash
npm run allure:generate
npm run allure:open
```

**Features**:
- Historical trends
- Test categorization
- Suite breakdown
- Duration analysis
- Flaky test detection

#### 3. JUnit XML

**Location**: `test-results/results.xml`

**Usage**:
- Jenkins test result trending
- Build health metrics
- Test stability graphs

#### 4. Custom Summary Report

**Location**: `test-results/summary.html`

**Features**:
- Executive dashboard
- Pass/fail metrics
- Browser breakdown
- Duration statistics

### Artifact Management

```groovy
archiveArtifacts(
  artifacts: 'test-results/**/*.png,test-results/**/*.webm',
  allowEmptyArchive: true,
  fingerprint: true
)
```

**Retention Policy**:
- HTML reports: 30 days
- Screenshots: 14 days
- Videos: 7 days (cleaned up automatically)
- Logs: 90 days

---

## 🔔 Notifications

### Slack Integration

```groovy
slackSend(
  channel: '#qa-automation',
  color: 'good',
  message: """
    ✅ Demoblaze E2E Tests - SUCCESS
    Environment: production
    Browser: All
    Duration: 12 minutes
    Report: View Report
  """
)
```

**Setup**:
1. Install Slack Notification Plugin
2. Create Slack App and Bot
3. Add `slack-token` to Jenkins credentials
4. Configure channel in pipeline parameters

### Email Integration

```groovy
emailext(
  subject: "✅ Demoblaze E2E Tests - SUCCESS",
  body: """
    <html>
    <body>
      <h2>Test Execution Summary</h2>
      <table>
        <tr><td>Environment:</td><td>production</td></tr>
        <tr><td>Status:</td><td>SUCCESS</td></tr>
        <tr><td>Duration:</td><td>12 minutes</td></tr>
      </table>
    </body>
    </html>
  """,
  mimeType: 'text/html',
  to: '${DEFAULT_RECIPIENTS}'
)
```

**Setup**:
1. Install Email Extension Plugin
2. Configure SMTP settings in Jenkins
3. Add recipient email addresses

---

## 🚀 Deployment & Setup

### Jenkins Setup

#### Prerequisites

```bash
# Java (Jenkins requirement)
java -version  # Should be Java 11 or higher

# Node.js
node --version  # Should be v20 or higher

# Git
git --version
```

#### Installation Steps

1. **Install Jenkins**

```bash
# On Ubuntu/Debian
wget -q -O - https://pkg.jenkins.io/debian/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb http://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt update
sudo apt install jenkins

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

2. **Install Required Plugins**

Navigate to: `Manage Jenkins` → `Manage Plugins` → `Available`

Required plugins:
- Pipeline
- Git
- GitHub Integration
- NodeJS Plugin
- HTML Publisher
- JUnit Plugin
- Slack Notification Plugin (optional)
- Email Extension Plugin (optional)

3. **Configure NodeJS**

`Manage Jenkins` → `Global Tool Configuration` → `NodeJS`

- Name: `Node 20`
- Version: `20.x`
- Global npm packages: `playwright`

4. **Create Pipeline Job**

- New Item → Pipeline
- Name: `demoblaze-e2e-tests`
- Pipeline script from SCM
- SCM: Git
- Repository URL: `https://github.com/your-username/demoblaze-e2e-playwright.git`
- Script Path: `Jenkinsfile`

5. **Configure Webhooks** (Optional)

GitHub → Repository → Settings → Webhooks → Add webhook
- Payload URL: `http://your-jenkins-server/github-webhook/`
- Content type: `application/json`
- Events: `Push`, `Pull request`

### GitHub Actions Setup

No server setup required! Just add workflow file:

**Location**: `.github/workflows/playwright.yml`

The workflow will automatically run on push/PR.

---

## 📈 Performance Optimization

### Parallel Execution

```groovy
// Jenkins: 3x faster execution
parallel {
  stage('Chromium') { ... }
  stage('Firefox') { ... }
  stage('WebKit') { ... }
}
```

```yaml
# GitHub Actions: Matrix strategy
strategy:
  matrix:
    browser: [chromium, firefox, webkit]
```

### Caching Strategies

```yaml
# GitHub Actions: Cache npm dependencies
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

```groovy
// Jenkins: Skip installation
parameters {
  booleanParam(name: 'SKIP_INSTALL', defaultValue: false)
}
```

### Resource Allocation

| Environment | Workers | Retry | Timeout |
|-------------|---------|-------|---------|
| Local | Unlimited | 0 | 30s |
| GitHub Actions | 4 | 2 | 30s |
| Jenkins (main) | 2 | 3 | 60s |
| Jenkins (feature) | 4 | 2 | 30s |

---

## 🔐 Security & Best Practices

### Secrets Management

**GitHub Actions**:
```yaml
- name: Run tests
  env:
    API_KEY: ${{ secrets.API_KEY }}
```

**Jenkins**:
```groovy
environment {
  API_KEY = credentials('api-key-credential-id')
}
```

### Best Practices

✅ **DO**:
- Use pipeline-as-code (Jenkinsfile)
- Implement retry logic for flaky tests
- Cache dependencies
- Parallel execution for speed
- Comprehensive reporting
- Automated notifications

❌ **DON'T**:
- Hardcode credentials
- Run all tests sequentially
- Ignore flaky tests
- Skip artifact archiving
- Neglect cleanup processes

---

## 🐛 Troubleshooting

### Common Issues

#### Jenkins: "Playwright not found"

**Solution**:
```groovy
sh 'npx playwright install --with-deps'
```

#### GitHub Actions: "Browser not installed"

**Solution**:
```yaml
- name: Install Playwright browsers
  run: npx playwright install --with-deps
```

#### Pipeline Timeout

**Solution**:
```groovy
options {
  timeout(time: 90, unit: 'MINUTES')
}
```

#### Flaky Tests

**Solution**:
```typescript
// Increase retries
retries: process.env.CI ? 3 : 0
```

---

## 📚 Additional Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright CI Guide](https://playwright.dev/docs/ci)
- [jenkins/README.md](jenkins/README.md) - Detailed Jenkins setup

---

**Document Version**: 1.0  
**Last Updated**: October 2025  
**Maintained By**: DevOps & QA Team

