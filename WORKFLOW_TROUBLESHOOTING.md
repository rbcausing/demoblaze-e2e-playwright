# 🔧 Troubleshooting Your Failed GitHub Actions Workflows

## Current Failed Workflows

Based on your GitHub Actions history:
- ❌ **Demoblaze E2E Tests (Comprehensive)** #5 - Failed (2m 55s)
- ❌ **Demoblaze E2E Tests (Basic)** #10 - Failed (8m 5s)

## Common Causes & Solutions

### 1. Test Failures (Most Likely)

**Symptoms**: Workflows run but tests fail
**Possible Causes**:
- Flaky tests (timing issues)
- Website changes (Demoblaze.com updates)
- Timeout issues
- Browser-specific failures (especially WebKit)

**Solutions**:

#### Check Test Logs
```bash
# View the actual error from GitHub Actions:
# 1. Go to: https://github.com/rbcausing/demoblaze-e2e-playwright/actions
# 2. Click on the failed workflow run
# 3. Click on the failed job (e.g., "Smoke Tests (webkit)")
# 4. Read the error messages
```

#### Run Tests Locally First
```bash
# Test the exact same command that's failing in CI:
npx playwright test tests/demoblaze/ --grep="@smoke" --project=chromium

# If it fails, debug it:
npx playwright test tests/demoblaze/ --grep="@smoke" --project=chromium --headed --debug
```

#### Common Test Issues in Your Project

Based on your test file `tests/demoblaze/laptops-luxury-checkout.spec.ts`:

**Issue**: Long timeouts for Demoblaze dialogs
**Fix**: Your test already has `test.setTimeout(60000)` for complex tests ✅

**Issue**: WebKit-specific timing
**Fix**: Add extra waits for WebKit:
```typescript
if (browserName === 'webkit') {
  await page.waitForTimeout(2000);
}
```

**Issue**: Cart items not loading
**Fix**: Your code already uses dynamic waits ✅

### 2. Dependency Installation Issues

**Symptoms**: "playwright: command not found" or "Module not found"

**Solution**: Ensure `package-lock.json` is committed:
```bash
git add package-lock.json
git commit -m "fix: add package-lock.json for consistent CI dependencies"
git push
```

Your workflow uses `npm ci` which requires `package-lock.json` ✅

### 3. Browser Installation Failures

**Symptoms**: "Executable doesn't exist" or "Browser not installed"

**Solution**: Your workflows already use correct syntax:
```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps ${{ matrix.browser }}
```
This is correct ✅

### 4. Timeout Issues

**Symptoms**: "Test timeout of 60000ms exceeded"

**Current Config** (from `playwright.config.ts`):
```typescript
timeout: 60000, // 60 seconds per test
```

**If tests are timing out**:
```typescript
// In playwright.config.ts, increase timeout:
timeout: 90000, // 90 seconds for slower Demoblaze pages
```

### 5. Flaky Tests (Intermittent Failures)

**Symptoms**: Tests pass locally but fail in CI, or pass/fail randomly

**Current Config**:
```typescript
retries: process.env.CI ? 2 : 0, // Already have retries ✅
```

**Additional Fixes**:

**a) Increase wait times for Demoblaze:**
```typescript
// In playwright.config.ts
use: {
  actionTimeout: 20000, // Increase from 15000
  navigationTimeout: 30000, // Increase from 20000
}
```

**b) Stabilize dialog handling:**
```typescript
// In your tests - already using this pattern ✅
page.once('dialog', dialog => dialog.accept());
```

**c) Wait for network idle:**
```typescript
await page.goto('/', { waitUntil: 'networkidle' });
```

### 6. Workflow Configuration Issues

**Check workflow syntax:**
```yaml
# Your workflows use correct reporter syntax ✅
--reporter=html --reporter=json --reporter=junit

# NOT this (incorrect):
--reporter=html,json,junit
```

Your Code Quality workflow validates this automatically ✅

### 7. Environment Variable Issues

**Verify BASE_URL is set:**

Your workflows already set this:
```yaml
env:
  BASE_URL: https://www.demoblaze.com
```
This is correct ✅

## 🎯 Immediate Action Plan

### Step 1: Identify Exact Failure
```bash
# Check GitHub Actions logs:
# 1. Go to Actions tab
# 2. Click failed workflow
# 3. Click failed job
# 4. Find the error message (usually in "Run smoke tests" step)
```

### Step 2: Reproduce Locally
```bash
# Set CI environment
export CI=true  # On Windows: $env:CI="true"

# Run the exact failing test
npx playwright test tests/demoblaze/ --grep="@smoke" --project=chromium
```

### Step 3: Fix and Verify
```bash
# After fixing, test all browsers locally:
npx playwright test tests/demoblaze/ --grep="@smoke"

# If all pass, push:
git add .
git commit -m "fix: resolve test failures"
git push
```

## 📋 Debugging Checklist

- [ ] Check GitHub Actions logs for exact error
- [ ] Reproduce failure locally with `CI=true`
- [ ] Verify tests pass on all browsers locally
- [ ] Check if Demoblaze.com is accessible
- [ ] Ensure `package-lock.json` is committed
- [ ] Verify Playwright version is consistent
- [ ] Check for recent changes that might cause issues

## 🔍 Advanced Debugging

### Enable Verbose Logging
```typescript
// In your test file:
test.use({ 
  trace: 'on',
  video: 'on',
  screenshot: 'on'
});
```

### Check Browser Console Logs
```typescript
page.on('console', msg => console.log('BROWSER:', msg.text()));
page.on('pageerror', err => console.log('PAGE ERROR:', err));
```

### Capture Network Requests
```typescript
page.on('request', request => 
  console.log('>>', request.method(), request.url())
);
page.on('response', response => 
  console.log('<<', response.status(), response.url())
);
```

## 🚀 Prevention Best Practices

To prevent CI failures:
- ✅ Test locally before pushing
- ✅ Use proper selectors and waits
- ✅ Handle errors gracefully
- ✅ Follow Playwright best practices
- ✅ Run smoke tests before creating PRs

## 📊 Next Steps

1. **Immediate**: Check your latest GitHub Actions logs to see the exact error
2. **Short-term**: Fix the failing tests based on the error
3. **Long-term**: Test locally and follow best practices to prevent issues

**Need help with the actual error?** Share the error message from GitHub Actions, and I can provide specific fixes!

---

**Quick Links**:
- [Your GitHub Actions](https://github.com/rbcausing/demoblaze-e2e-playwright/actions)
- [Playwright Documentation](https://playwright.dev)

