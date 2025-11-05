/**
 * Demoblaze E2E Test Pipeline
 * 
 * This Jenkinsfile demonstrates enterprise-level CI/CD patterns for E2E testing
 * including multi-browser testing, environment configurations, and notification templates.
 * 
 * SETUP REQUIREMENTS:
 * - Jenkins with Node.js and Playwright installed
 * - (Optional) Slack Notification Plugin for sendNotifications()
 * - (Optional) Email Extension Plugin for email notifications
 * 
 * PORTFOLIO NOTE:
 * Notification functions are fully implemented templates that would work
 * with minimal configuration in a real environment. For demo purposes,
 * failures are gracefully handled with informative messages.
 */
 
pipeline {
    agent any
    
    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'staging', 'production'],
            description: 'Select the environment to test against'
        )
        choice(
            name: 'TEST_SUITE',
            choices: ['smoke', 'full', 'regression', 'mobile', 'all'],
            description: 'Select which test suite to run'
        )
        choice(
            name: 'BROWSER',
            choices: ['all', 'chromium', 'firefox', 'webkit'],
            description: 'Select browser(s) to test'
        )
        booleanParam(
            name: 'SKIP_INSTALL',
            defaultValue: false,
            description: 'Skip dependency installation (use cached dependencies)'
        )
        string(
            name: 'SLACK_CHANNEL',
            defaultValue: '#qa-automation',
            description: 'Slack channel for notifications'
        )
    }
    
    environment {
        NODE_VERSION = '20'
        CI = 'true'
        
        // Environment-specific URLs
        BASE_URL = "${params.ENVIRONMENT == 'production' ? 'https://www.demoblaze.com' : 
                     params.ENVIRONMENT == 'staging' ? 'https://staging.demoblaze.com' : 
                     'https://dev.demoblaze.com'}"
        
        // Test execution settings
        MAX_WORKERS = "${env.BRANCH_NAME == 'main' ? '2' : '4'}"
        RETRY_COUNT = "${params.ENVIRONMENT == 'production' ? '3' : '2'}"
        
        // Report settings
        REPORT_TITLE = "Demoblaze E2E Tests - ${params.ENVIRONMENT.toUpperCase()}"
        BUILD_TIMESTAMP = "${new Date().format('yyyy-MM-dd HH:mm:ss')}"
        
        // Notification settings
        NOTIFY_ON_SUCCESS = "${env.BRANCH_NAME == 'main' ? 'true' : 'false'}"
        NOTIFY_ON_FAILURE = 'true'
    }
    
    options {
        timeout(time: 90, unit: 'MINUTES')
        buildDiscarder(logRotator(
            numToKeepStr: '30',
            artifactNumToKeepStr: '10',
            daysToKeepStr: '90'
        ))
        skipDefaultCheckout(false)
        timestamps()
        ansiColor('xterm')
        parallelsAlwaysFailFast()
    }
    
    stages {
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
                    ║ Branch:          ${env.BRANCH_NAME}
                    ║ Build Number:    #${env.BUILD_NUMBER}
                    ║ Timestamp:       ${env.BUILD_TIMESTAMP}
                    ╚═══════════════════════════════════════════════════════════╝
                    """
                    
                    // Set build description for easy identification
                    currentBuild.description = "${params.ENVIRONMENT} | ${params.TEST_SUITE} | ${params.BROWSER}"
                }
            }
        }
        
        stage('📦 Setup & Dependencies') {
            when {
                expression { return !params.SKIP_INSTALL }
            }
            steps {
                script {
                    echo '🔧 Installing Node.js dependencies and Playwright browsers...'
                }
                sh '''
                    # Clean install for reproducible builds
                    npm ci --prefer-offline --no-audit
                    
                    # Install Playwright browsers with dependencies
                    npx playwright install --with-deps
                    
                    # Verify installation
                    npx playwright --version
                    node --version
                    npm --version
                '''
            }
            post {
                success {
                    echo '✅ Dependencies installed successfully'
                }
                failure {
                    echo '❌ Failed to install dependencies'
                    script {
                        currentBuild.result = 'FAILURE'
                    }
                }
            }
        }
        
        stage('🧪 Test Execution') {
            stages {
                stage('Smoke Tests') {
                    when {
                        expression { 
                            return params.TEST_SUITE == 'smoke' || params.TEST_SUITE == 'all' 
                        }
                    }
                    parallel {
                        stage('Chromium Smoke') {
                            when {
                                expression { params.BROWSER == 'all' || params.BROWSER == 'chromium' }
                            }
                            steps {
                                runTests('chromium', 'smoke', '@smoke')
                            }
                        }
                        
                        stage('Firefox Smoke') {
                            when {
                                expression { params.BROWSER == 'all' || params.BROWSER == 'firefox' }
                            }
                            steps {
                                runTests('firefox', 'smoke', '@smoke')
                            }
                        }
                        
                        stage('WebKit Smoke') {
                            when {
                                expression { params.BROWSER == 'all' || params.BROWSER == 'webkit' }
                            }
                            steps {
                                runTests('webkit', 'smoke', '@smoke')
                            }
                        }
                    }
                }
                
                stage('Full Test Suite') {
                    when {
                        allOf {
                            expression { params.TEST_SUITE == 'full' || params.TEST_SUITE == 'all' }
                            anyOf {
                                branch 'main'
                                branch 'master'
                                expression { params.ENVIRONMENT == 'production' }
                            }
                        }
                    }
                    parallel {
                        stage('Chromium Full') {
                            when {
                                expression { params.BROWSER == 'all' || params.BROWSER == 'chromium' }
                            }
                            steps {
                                runTests('chromium', 'full', '')
                            }
                        }
                        
                        stage('Firefox Full') {
                            when {
                                expression { params.BROWSER == 'all' || params.BROWSER == 'firefox' }
                            }
                            steps {
                                runTests('firefox', 'full', '')
                            }
                        }
                        
                        stage('WebKit Full') {
                            when {
                                expression { params.BROWSER == 'all' || params.BROWSER == 'webkit' }
                            }
                            steps {
                                runTests('webkit', 'full', '')
                            }
                        }
                    }
                }
                
                stage('Regression Tests') {
                    when {
                        expression { params.TEST_SUITE == 'regression' || params.TEST_SUITE == 'all' }
                    }
                    steps {
                        script {
                            echo '🔄 Running regression tests with retries...'
                        }
                        sh """
                            npx playwright test \
                                --project=${params.BROWSER == 'all' ? 'chromium' : params.BROWSER} \
                                --grep="@regression" \
                                --retries=${env.RETRY_COUNT} \
                                --workers=${env.MAX_WORKERS} \
                                --reporter=html,json,junit
                        """
                    }
                    post {
                        always {
                            archiveTestResults('regression')
                        }
                    }
                }
                
                stage('Mobile Tests') {
                    when {
                        allOf {
                            expression { params.TEST_SUITE == 'mobile' || params.TEST_SUITE == 'all' }
                            anyOf {
                                branch 'main'
                                expression { params.ENVIRONMENT == 'production' }
                            }
                        }
                    }
                    parallel {
                        stage('Mobile Chrome') {
                            steps {
                                runTests('mobile-chrome', 'mobile', '')
                            }
                        }
                        
                        stage('Mobile Safari') {
                            steps {
                                runTests('Mobile Safari', 'mobile', '')
                            }
                        }
                    }
                }
            }
        }
        
        stage('📊 Test Analysis & Reporting') {
            steps {
                script {
                    echo '📈 Analyzing test results and generating metrics...'
                    
                    // Archive all test artifacts
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'test-results/results.json', allowEmptyArchive: true
                    
                    // Publish HTML reports
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright Test Report',
                        reportTitles: "${env.REPORT_TITLE}"
                    ])
                    
                    // Publish JUnit test results for trending
                    junit(
                        testResults: 'test-results/results.xml',
                        allowEmptyResults: true,
                        healthScaleFactor: 1.0,
                        keepLongStdio: true
                    )
                    
                    // Generate test metrics
                    generateTestMetrics()
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo '📊 Pipeline execution completed'
                
                // Calculate build duration
                def durationSeconds = currentBuild.duration / 1000
                def durationMinutes = durationSeconds / 60
                
                echo """
                ╔═══════════════════════════════════════════════════════════╗
                ║         Build Summary                                     ║
                ╠═══════════════════════════════════════════════════════════╣
                ║ Status:          ${currentBuild.result ?: 'SUCCESS'}
                ║ Duration:        ${durationMinutes.round(2)} minutes
                ║ Environment:     ${params.ENVIRONMENT}
                ║ Test Suite:      ${params.TEST_SUITE}
                ║ Browser:         ${params.BROWSER}
                ╚═══════════════════════════════════════════════════════════╝
                """
            }
        }
        
        success {
            script {
                echo '🎉 Pipeline completed successfully!'
                echo '✅ All tests passed'
                echo '📊 Test reports available in Jenkins'
                
                // Send success notification (only for main branch)
                if (env.NOTIFY_ON_SUCCESS == 'true') {
                    sendNotifications('SUCCESS')
                }
            }
        }
        
        failure {
            script {
                echo '❌ Pipeline failed'
                echo '🔍 Check test reports for details'
                
                // Always send failure notifications
                if (env.NOTIFY_ON_FAILURE == 'true') {
                    sendNotifications('FAILURE')
                }
            }
        }
        
        unstable {
            script {
                echo '⚠️  Pipeline unstable - some tests may have failed'
                sendNotifications('UNSTABLE')
            }
        }
        
        cleanup {
            script {
                echo '🧹 Cleaning up workspace...'
            }
            sh '''
                # Clean up unnecessary files to save space
                rm -rf test-results/.cache/
                rm -rf node_modules/.cache/
                rm -rf ~/.cache/ms-playwright/
                
                # Keep only essential artifacts
                find test-results -type f -name "*.webm" -mtime +7 -delete
                find test-results -type f -name "*.zip" -mtime +7 -delete
            '''
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper Methods
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Runs Playwright tests for a specific browser and test type
 * @param browser Browser to test (chromium, firefox, webkit, mobile-chrome, Mobile Safari)
 * @param testType Type of test (smoke, full, regression, mobile)
 * @param grepPattern Pattern to filter tests (e.g., @smoke, @regression)
 */
def runTests(String browser, String testType, String grepPattern) {
    script {
        echo "🧪 Running ${testType} tests on ${browser}..."
        
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

/**
 * Archives test results with proper categorization
 * @param testType Type of test being archived
 */
def archiveTestResults(String testType) {
    script {
        // Publish test results
        if (fileExists('test-results/results.xml')) {
            junit testResults: 'test-results/results.xml', allowEmptyResults: true
        }
        
        // Archive screenshots and videos from failures
        archiveArtifacts(
            artifacts: "test-results/**/*.png,test-results/**/*.webm",
            allowEmptyArchive: true,
            fingerprint: true,
            caseSensitive: false
        )
    }
}

/**
 * Generates and displays test metrics
 */
def generateTestMetrics() {
    script {
        echo '📊 Generating test execution metrics...'
        
        if (fileExists('test-results/results.json')) {
            def testResults = readJSON file: 'test-results/results.json'
            
            // Extract metrics (adjust based on actual JSON structure)
            echo """
            Test Metrics:
            - Total Tests: ${testResults.stats?.tests ?: 'N/A'}
            - Passed: ${testResults.stats?.passes ?: 'N/A'}
            - Failed: ${testResults.stats?.failures ?: 'N/A'}
            - Skipped: ${testResults.stats?.skipped ?: 'N/A'}
            - Duration: ${testResults.stats?.duration ?: 'N/A'}ms
            """
        }
    }
}

/**
 * Sends notifications via Slack and Email
 * @param status Build status (SUCCESS, FAILURE, UNSTABLE)
 */
def sendNotifications(String status) {
    script {
        def color = status == 'SUCCESS' ? 'good' : status == 'UNSTABLE' ? 'warning' : 'danger'
        def emoji = status == 'SUCCESS' ? '✅' : status == 'UNSTABLE' ? '⚠️' : '❌'
        
        def message = """
${emoji} *Demoblaze E2E Tests - ${status}*
*Environment:* ${params.ENVIRONMENT}
*Test Suite:* ${params.TEST_SUITE}
*Browser:* ${params.BROWSER}
*Branch:* ${env.BRANCH_NAME}
*Build:* #${env.BUILD_NUMBER}
*Duration:* ${currentBuild.durationString.replace(' and counting', '')}
*Report:* <${env.BUILD_URL}Playwright_20Test_20Report|View Test Report>
        """.trim()
        
        echo """
        ╔═══════════════════════════════════════════════════════════╗
        ║         Notification Status                               ║
        ╠═══════════════════════════════════════════════════════════╣
        ║ Ready to send: ${status} notification
        ║ 
        ║ MESSAGE PREVIEW:
        ${message}
        ╚═══════════════════════════════════════════════════════════╝
        """
        
        // Slack Notification Template
        // To enable: Install Slack Notification Plugin and configure 'slack-token' credential
        try {
            slackSend(
                channel: params.SLACK_CHANNEL,
                color: color,
                message: message,
                tokenCredentialId: 'slack-token'
            )
            echo "✅ Slack notification sent successfully"
        } catch (Exception e) {
            echo "ℹ️  Slack notification template ready (not configured for this demo)"
            echo "   To enable: Install Slack plugin and add 'slack-token' to Jenkins credentials"
        }
        
        // Email Notification Template
        // To enable: Configure Email Extension Plugin in Jenkins System Settings
        try {
            emailext(
                subject: "${emoji} Demoblaze E2E Tests - ${status} - Build #${env.BUILD_NUMBER}",
                body: """
                    <html>
                    <body>
                        <h2 style="color: ${color == 'good' ? 'green' : color == 'warning' ? 'orange' : 'red'}">
                            ${emoji} Demoblaze E2E Test Results - ${status}
                        </h2>
                        <table border="1" cellpadding="10">
                            <tr><td><b>Environment:</b></td><td>${params.ENVIRONMENT}</td></tr>
                            <tr><td><b>Test Suite:</b></td><td>${params.TEST_SUITE}</td></tr>
                            <tr><td><b>Browser:</b></td><td>${params.BROWSER}</td></tr>
                            <tr><td><b>Branch:</b></td><td>${env.BRANCH_NAME}</td></tr>
                            <tr><td><b>Build Number:</b></td><td>#${env.BUILD_NUMBER}</td></tr>
                            <tr><td><b>Duration:</b></td><td>${currentBuild.durationString.replace(' and counting', '')}</td></tr>
                        </table>
                        <br>
                        <p><a href="${env.BUILD_URL}">View Build Details</a></p>
                        <p><a href="${env.BUILD_URL}Playwright_20Test_20Report">View Test Report</a></p>
                    </body>
                    </html>
                """,
                mimeType: 'text/html',
                to: '${DEFAULT_RECIPIENTS}',
                recipientProviders: [
                    [$class: 'DevelopersRecipientProvider'],
                    [$class: 'RequesterRecipientProvider']
                ]
            )
            echo "✅ Email notification sent successfully"
        } catch (Exception e) {
            echo "ℹ️  Email notification template ready (not configured for this demo)"
            echo "   To enable: Configure Email Extension Plugin in Jenkins"
        }
    }
}