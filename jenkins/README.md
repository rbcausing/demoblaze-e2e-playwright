# Jenkins CI/CD Integration Guide

This guide provides comprehensive instructions for setting up and configuring Jenkins to run the Demoblaze E2E Testing Framework.

## 📋 Prerequisites

- Windows 10/11 or Linux system
- Java 8 or higher
- Git installed
- Internet connection for downloading dependencies

## 🚀 Jenkins Installation

### Windows Installation

1. **Download Jenkins**
   - Visit [Jenkins.io](https://www.jenkins.io/download/)
   - Download the Windows installer (jenkins.msi)

2. **Install Jenkins**
   - Run the installer as Administrator
   - Follow the installation wizard
   - Choose "Install as a service" option
   - Set up initial admin user when prompted

3. **Access Jenkins**
   - Open browser and navigate to `http://localhost:8080`
   - Enter the initial admin password (found in Jenkins installation directory)
   - Complete the setup wizard

### Linux Installation

```bash
# Ubuntu/Debian
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo apt-key add -
sudo sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt update
sudo apt install jenkins

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

## 🔧 Required Plugins

Install the following plugins in Jenkins:

1. **Pipeline Plugin** (usually pre-installed)
2. **NodeJS Plugin**
3. **HTML Publisher Plugin**
4. **GitHub Plugin**
5. **JUnit Plugin**

### Installing Plugins

1. Go to **Manage Jenkins** → **Manage Plugins**
2. Click on **Available** tab
3. Search for each plugin and install:
   - Pipeline
   - NodeJS
   - HTML Publisher
   - GitHub
   - JUnit
4. Restart Jenkins after installation

## ⚙️ Global Tool Configuration

### Configure NodeJS

1. Go to **Manage Jenkins** → **Global Tool Configuration**
2. Find **NodeJS** section
3. Click **Add NodeJS**
4. Configure:
   - **Name**: `NodeJS-20`
   - **Version**: `20.x` (or latest LTS)
   - **Global npm packages**: Leave empty
5. Click **Save**

## 🏗️ Creating the Pipeline Job

### Step 1: Create New Job

1. Click **New Item** on Jenkins dashboard
2. Enter job name: `Demoblaze-E2E-Tests`
3. Select **Pipeline** project type
4. Click **OK**

### Step 2: Configure Pipeline

1. **General Settings**
   - ✅ Discard old builds
   - ✅ GitHub project (optional)
   - Project url: `https://github.com/rbcausing/demoblaze-e2e-playwright`

2. **Build Triggers**
   - ✅ GitHub hook trigger for GITScm polling
   - ✅ Poll SCM: `H/5 * * * *` (every 5 minutes)

3. **Pipeline Configuration**
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: `https://github.com/rbcausing/demoblaze-e2e-playwright.git`
   - **Branch**: `*/main` or `*/master`
   - **Script Path**: `Jenkinsfile`

### Step 3: Save and Build

1. Click **Save**
2. Click **Build Now** to test the pipeline
3. Monitor the build progress in the console output

## 🔗 GitHub Integration

### Setting Up Webhooks

1. Go to your GitHub repository
2. Navigate to **Settings** → **Webhooks**
3. Click **Add webhook**
4. Configure:
   - **Payload URL**: `http://your-jenkins-server:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Which events**: Just the push event
   - ✅ Active
5. Click **Add webhook**

### GitHub Credentials (if using private repo)

1. Go to **Manage Jenkins** → **Manage Credentials**
2. Click **Global** → **Add Credentials**
3. Configure:
   - **Kind**: Username with password
   - **Username**: Your GitHub username
   - **Password**: Your GitHub personal access token
   - **ID**: `github-credentials`
4. Click **OK**

## 📊 Pipeline Stages Explained

### Stage 1: Install Dependencies
- Installs Node.js dependencies (`npm ci`)
- Installs Playwright browsers
- Sets up the testing environment

### Stage 2: Smoke Tests (Parallel)
- Runs critical tests across all browsers
- Chromium, Firefox, and WebKit in parallel
- Fast feedback on core functionality

### Stage 3: Full Test Suite
- Runs complete test suite on main branches
- Comprehensive testing across browsers
- Only runs on main/master branches

### Stage 4: Regression Tests
- Runs with retries for flaky tests
- Comprehensive regression testing
- Generates detailed reports

### Stage 5: Mobile Tests
- Tests on mobile Chrome
- Ensures mobile compatibility
- Only runs on main branches

## 📈 Test Reports and Artifacts

### HTML Reports
- Published automatically after each build
- Accessible via **HTML Publisher** plugin
- Contains detailed test results, screenshots, and videos

### JUnit Reports
- XML format for integration with other tools
- Published via **JUnit** plugin
- Shows test trends and history

### Artifacts
- Test results and screenshots archived
- Available for download from build page
- Retained for 10 builds (configurable)

## 🛠️ Troubleshooting

### Common Issues

1. **Node.js Not Found**
   - Ensure NodeJS plugin is installed
   - Configure NodeJS in Global Tool Configuration
   - Check Node.js version compatibility

2. **Playwright Installation Fails**
   - Check internet connectivity
   - Verify sufficient disk space
   - Try running `npx playwright install --with-deps` manually

3. **Tests Fail with Timeout**
   - Increase timeout values in `playwright.config.ts`
   - Check if Demoblaze website is accessible
   - Verify network connectivity

4. **GitHub Webhook Not Working**
   - Check webhook URL is correct
   - Verify Jenkins is accessible from internet
   - Check GitHub webhook delivery logs

### Build Log Analysis

1. **Console Output**: Check for error messages
2. **Test Results**: Review failed test details
3. **Artifacts**: Download and examine screenshots/videos
4. **HTML Report**: View detailed test execution report

## 🔧 Customization

### Environment Variables

Add custom environment variables in Jenkins job configuration:

```groovy
environment {
    BASE_URL = 'https://www.demoblaze.com'
    HEADLESS = 'true'
    TIMEOUT = '30000'
    RETRIES = '2'
}
```

### Build Parameters

Add build parameters for flexible testing:

1. Go to job configuration
2. Check **This project is parameterized**
3. Add parameters:
   - **Choice Parameter**: `BROWSER` (chromium, firefox, webkit)
   - **Boolean Parameter**: `RUN_MOBILE_TESTS`
   - **String Parameter**: `TEST_TAGS` (@smoke, @regression)

### Notification Setup

Configure email notifications:

1. Install **Email Extension** plugin
2. Configure SMTP settings in **Manage Jenkins** → **Configure System**
3. Add post-build action **Editable Email Notification**

## 📚 Additional Resources

- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Playwright Jenkins Integration](https://playwright.dev/docs/ci#jenkins)
- [NodeJS Plugin Documentation](https://plugins.jenkins.io/nodejs/)
- [HTML Publisher Plugin](https://plugins.jenkins.io/htmlpublisher/)

## 🎯 Best Practices

1. **Use Declarative Pipelines**: More readable and maintainable
2. **Parallel Execution**: Run tests in parallel for faster feedback
3. **Artifact Management**: Archive important test results
4. **Cleanup**: Remove temporary files after builds
5. **Monitoring**: Set up build notifications for failures
6. **Security**: Use credentials for sensitive information
7. **Backup**: Regular backup of Jenkins configuration

## 🚀 Next Steps

After successful setup:

1. **Monitor Builds**: Check build status regularly
2. **Optimize Performance**: Adjust parallel execution based on resources
3. **Add More Tests**: Expand test coverage
4. **Integrate with Slack**: Set up notifications
5. **Performance Testing**: Add performance metrics collection

---

For support or questions, please refer to the main project documentation or create an issue in the GitHub repository.
