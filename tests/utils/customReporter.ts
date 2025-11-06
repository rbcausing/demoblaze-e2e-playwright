import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

class CustomDemoblazeReporter implements Reporter {
  private startTime: number = 0;
  private endTime: number = 0;
  private totalTests: number = 0;
  private passedTests: number = 0;
  private failedTests: number = 0;
  private skippedTests: number = 0;
  private testResults: any[] = [];
  private browsers: Set<string> = new Set();

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   🛍️  Demoblaze E2E Test Execution Started              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    this.countTests(suite);
    console.log(`📊 Total tests to run: ${this.totalTests}`);
    console.log(`🌐 Testing on ${config.projects.length} browser configurations\n`);
  }

  onTestBegin(test: TestCase, _result: TestResult) {
    const projectName = test.parent.project()?.name || 'unknown';
    this.browsers.add(projectName);
    console.log(`🧪 Running: ${test.title} [${projectName}]`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const status = result.status;
    const projectName = test.parent.project()?.name || 'unknown';
    const duration = result.duration;

    this.testResults.push({
      title: test.title,
      status: status,
      browser: projectName,
      duration: duration,
      file: test.location?.file,
      line: test.location?.line,
      error: result.error?.message,
      retries: result.retry,
    });

    if (status === 'passed') {
      this.passedTests++;
      console.log(`   ✅ PASSED [${projectName}] - ${duration}ms`);
    } else if (status === 'failed') {
      this.failedTests++;
      console.log(`   ❌ FAILED [${projectName}] - ${duration}ms`);
      if (result.error?.message) {
        console.log(`   📝 Error: ${result.error.message.split('\n')[0]}`);
      }
    } else if (status === 'skipped') {
      this.skippedTests++;
      console.log(`   ⏭️  SKIPPED [${projectName}]`);
    }
  }

  async onEnd(_result: FullResult) {
    this.endTime = Date.now();
    const duration = (this.endTime - this.startTime) / 1000;
    const passRate = ((this.passedTests / this.totalTests) * 100).toFixed(2);

    // Console Summary
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   📊 Demoblaze E2E Test Execution Summary                ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║ Total Tests:     ${String(this.totalTests).padEnd(39)}║`);
    console.log(`║ ✅ Passed:       ${String(this.passedTests).padEnd(39)}║`);
    console.log(`║ ❌ Failed:       ${String(this.failedTests).padEnd(39)}║`);
    console.log(`║ ⏭️  Skipped:      ${String(this.skippedTests).padEnd(39)}║`);
    console.log(`║ 📈 Pass Rate:    ${String(passRate + '%').padEnd(39)}║`);
    console.log(`║ ⏱️  Duration:     ${String(duration.toFixed(2) + 's').padEnd(39)}║`);
    console.log(`║ 🌐 Browsers:     ${String(Array.from(this.browsers).join(', ')).padEnd(39)}║`);
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Generate detailed HTML summary
    await this.generateHTMLSummary(duration, passRate);

    // Generate markdown summary
    await this.generateMarkdownSummary(duration, passRate);

    // Generate JSON summary for CI/CD
    await this.generateJSONSummary(duration, passRate);
  }

  private countTests(suite: Suite) {
    suite.allTests().forEach(() => {
      this.totalTests++;
    });
  }

  private async generateHTMLSummary(duration: number, passRate: string) {
    const reportDir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demoblaze E2E Test Summary</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8f9fa;
        }
        
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .stat-card .value {
            font-size: 2.5em;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .stat-card .label {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .stat-card.passed .value { color: #27ae60; }
        .stat-card.failed .value { color: #e74c3c; }
        .stat-card.skipped .value { color: #f39c12; }
        .stat-card.duration .value { color: #3498db; }
        .stat-card.rate .value { color: #9b59b6; }
        
        .test-details {
            padding: 40px;
        }
        
        .test-details h2 {
            margin-bottom: 20px;
            color: #2c3e50;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }
        
        .test-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        .test-table th {
            background: #34495e;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        
        .test-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #ecf0f1;
        }
        
        .test-table tr:hover {
            background: #f8f9fa;
        }
        
        .status-badge {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
            display: inline-block;
        }
        
        .status-passed { background: #d4edda; color: #155724; }
        .status-failed { background: #f8d7da; color: #721c24; }
        .status-skipped { background: #fff3cd; color: #856404; }
        
        .browser-badge {
            background: #e3f2fd;
            color: #1565c0;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 0.8em;
            font-family: monospace;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            color: #666;
            font-size: 0.9em;
        }
        
        .chart-container {
            padding: 40px;
            background: white;
        }
        
        .progress-bar {
            width: 100%;
            height: 30px;
            background: #ecf0f1;
            border-radius: 15px;
            overflow: hidden;
            margin: 20px 0;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #27ae60 0%, #2ecc71 100%);
            transition: width 1s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛍️ Demoblaze E2E Test Report</h1>
            <p class="subtitle">Comprehensive Test Execution Summary</p>
            <p style="margin-top: 15px; font-size: 0.9em;">Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="label">Total Tests</div>
                <div class="value">${this.totalTests}</div>
            </div>
            <div class="stat-card passed">
                <div class="label">Passed</div>
                <div class="value">✅ ${this.passedTests}</div>
            </div>
            <div class="stat-card failed">
                <div class="label">Failed</div>
                <div class="value">❌ ${this.failedTests}</div>
            </div>
            <div class="stat-card skipped">
                <div class="label">Skipped</div>
                <div class="value">⏭️ ${this.skippedTests}</div>
            </div>
            <div class="stat-card duration">
                <div class="label">Duration</div>
                <div class="value">⏱️ ${duration.toFixed(2)}s</div>
            </div>
            <div class="stat-card rate">
                <div class="label">Pass Rate</div>
                <div class="value">📈 ${passRate}%</div>
            </div>
        </div>
        
        <div class="chart-container">
            <h2 style="color: #2c3e50; margin-bottom: 15px;">Test Success Rate</h2>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${passRate}%">${passRate}%</div>
            </div>
        </div>
        
        <div class="test-details">
            <h2>📋 Detailed Test Results</h2>
            <table class="test-table">
                <thead>
                    <tr>
                        <th>Test Name</th>
                        <th>Browser</th>
                        <th>Status</th>
                        <th>Duration</th>
                        <th>Retries</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.testResults
                      .map(
                        test => `
                        <tr>
                            <td>${test.title}</td>
                            <td><span class="browser-badge">${test.browser}</span></td>
                            <td><span class="status-badge status-${test.status}">${test.status.toUpperCase()}</span></td>
                            <td>${test.duration}ms</td>
                            <td>${test.retries || 0}</td>
                        </tr>
                    `
                      )
                      .join('')}
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p>🚀 Powered by Playwright | Generated by Custom Demoblaze Reporter</p>
            <p style="margin-top: 5px;">Testing Browsers: ${Array.from(this.browsers).join(', ')}</p>
        </div>
    </div>
</body>
</html>
    `;

    fs.writeFileSync(path.join(reportDir, 'summary.html'), html);
    console.log(`📄 Enhanced HTML summary generated: ${path.join(reportDir, 'summary.html')}`);
  }

  private async generateMarkdownSummary(duration: number, passRate: string) {
    const reportDir = path.join(process.cwd(), 'test-results');

    const markdown = `# 🛍️ Demoblaze E2E Test Execution Summary

**Generated:** ${new Date().toLocaleString()}

## 📊 Test Statistics

| Metric | Value |
|--------|-------|
| Total Tests | ${this.totalTests} |
| ✅ Passed | ${this.passedTests} |
| ❌ Failed | ${this.failedTests} |
| ⏭️ Skipped | ${this.skippedTests} |
| 📈 Pass Rate | ${passRate}% |
| ⏱️ Duration | ${duration.toFixed(2)}s |
| 🌐 Browsers Tested | ${Array.from(this.browsers).join(', ')} |

## 📋 Test Results by Browser

${Array.from(this.browsers)
  .map(browser => {
    const browserTests = this.testResults.filter(t => t.browser === browser);
    const browserPassed = browserTests.filter(t => t.status === 'passed').length;
    const browserTotal = browserTests.length;
    const browserPassRate = ((browserPassed / browserTotal) * 100).toFixed(2);

    return `### ${browser}
- Total: ${browserTotal}
- Passed: ${browserPassed}
- Pass Rate: ${browserPassRate}%
`;
  })
  .join('\n')}

## 🎯 Test Details

| Test Name | Browser | Status | Duration | Retries |
|-----------|---------|--------|----------|---------|
${this.testResults
  .map(
    test =>
      `| ${test.title} | ${test.browser} | ${test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️'} ${test.status} | ${test.duration}ms | ${test.retries || 0} |`
  )
  .join('\n')}

---
*Generated by Custom Demoblaze Reporter*
`;

    fs.writeFileSync(path.join(reportDir, 'SUMMARY.md'), markdown);
    console.log(`📄 Markdown summary generated: ${path.join(reportDir, 'SUMMARY.md')}`);
  }

  private async generateJSONSummary(duration: number, passRate: string) {
    const reportDir = path.join(process.cwd(), 'test-results');

    const summary = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.totalTests,
        passed: this.passedTests,
        failed: this.failedTests,
        skipped: this.skippedTests,
        passRate: parseFloat(passRate),
        duration: parseFloat(duration.toFixed(2)),
        browsers: Array.from(this.browsers),
      },
      browserResults: Array.from(this.browsers).map(browser => {
        const browserTests = this.testResults.filter(t => t.browser === browser);
        const browserPassed = browserTests.filter(t => t.status === 'passed').length;
        const browserFailed = browserTests.filter(t => t.status === 'failed').length;
        const browserSkipped = browserTests.filter(t => t.status === 'skipped').length;

        return {
          browser,
          total: browserTests.length,
          passed: browserPassed,
          failed: browserFailed,
          skipped: browserSkipped,
          passRate: ((browserPassed / browserTests.length) * 100).toFixed(2),
        };
      }),
      detailedResults: this.testResults,
    };

    fs.writeFileSync(path.join(reportDir, 'summary.json'), JSON.stringify(summary, null, 2));
    console.log(`📄 JSON summary generated: ${path.join(reportDir, 'summary.json')}`);
  }
}

export default CustomDemoblazeReporter;
