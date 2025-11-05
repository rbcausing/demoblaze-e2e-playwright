# 📊 Test Reporting Guide

This document explains the comprehensive reporting system implemented in the Demoblaze E2E testing framework.

## Available Reports

### 1. **Custom HTML Summary Report** ⭐
Our custom-branded test summary with beautiful visualizations.

**Location:** `test-results/summary.html`

**Features:**
- 🎨 Demoblaze-branded design
- 📊 Interactive test statistics
- 📈 Visual pass rate indicators
- 🌐 Browser-specific breakdowns
- 📋 Detailed test results table

**How to view:**
```bash
npm run report:summary
```

### 2. **Playwright HTML Report**
Standard Playwright test report with trace viewer integration.

**Location:** `playwright-report/index.html`

**Features:**
- Test execution timeline
- Screenshots and videos
- Trace viewer for debugging
- Error stack traces
- Retry information

**How to view:**
```bash
npm run test:report
```

### 3. **Allure Report** 🎯
Enterprise-grade test reporting with trends and analytics.

**Location:** `allure-report/index.html`

**Features:**
- Test execution trends
- Historical data
- Test categorization
- Detailed test suites
- Environment information
- Attachments (screenshots, videos)

**How to generate:**
```bash
# Generate report
npm run allure:generate

# Open report
npm run allure:open

# Or serve directly from results
npm run allure:serve
```

### 4. **Markdown Summary**
Quick text-based summary for documentation or README updates.

**Location:** `test-results/SUMMARY.md`

**Features:**
- Markdown formatted tables
- Easy to copy/paste
- GitHub-friendly
- Suitable for PR comments

**How to view:**
```bash
cat test-results/SUMMARY.md
```

### 5. **JSON Summary**
Machine-readable summary for CI/CD integration.

**Location:** `test-results/summary.json`

**Features:**
- Complete test metrics
- Browser-specific results
- Detailed test outcomes
- Easy CI/CD parsing

**How to use:**
```bash
# View in terminal
cat test-results/summary.json | jq

# Use in scripts
node -e "console.log(require('./test-results/summary.json'))"
```

### 6. **JUnit XML Report**
Standard JUnit format for Jenkins and other CI tools.

**Location:** `test-results/results.xml`

**Features:**
- Jenkins integration
- Test trending
- Historical comparisons
- Standard CI/CD format

## Viewing All Reports

To view all reports at once:
```bash
npm run report:all
```

This will:
1. Open Playwright HTML report
2. Open custom summary report
3. Generate and serve Allure report

## CI/CD Integration

### Jenkins
Jenkins automatically publishes:
- HTML Report (via HTML Publisher plugin)
- JUnit Report (for test trending)
- Artifacts (screenshots, videos)

Access reports from Jenkins build page:
- **Test Trends**: Main dashboard
- **HTML Report**: "Playwright Test Report" link
- **Artifacts**: "Build Artifacts" section

### GitHub Actions
GitHub Actions workflow publishes:
- Test results as artifacts
- Summary in PR comments
- Failed test screenshots

## Report Generation Workflow
