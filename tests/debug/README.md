# Debug Tests Directory

This directory is reserved for **temporary debugging and exploratory testing** during development.

## Purpose

Use this folder for:
- Quick troubleshooting of selector issues
- Network connectivity debugging
- Exploratory tests for new features
- Temporary test isolation when debugging failures
- Prototype tests before moving to proper test suites

## Rules

⚠️ **Important Guidelines:**

1. **Never commit debug test files** - All `.spec.ts` files in this directory are gitignored
2. **Temporary only** - Debug tests should be deleted after solving the issue
3. **Not for CI/CD** - These tests are excluded from automated test runs
4. **Use proper test suites** - Move finalized tests to appropriate directories:
   - `tests/shopping/` - Shopping cart and checkout flows
   - `tests/product/` - Product browsing and search
   - `tests/user/` - User authentication and registration
   - `tests/smoke/` - Critical path smoke tests
   - `tests/demoblaze/` - Demoblaze-specific integration tests

## Quick Start

Create a debug test for quick experimentation:

```typescript
import { test, expect } from '@playwright/test';

test('debug - [describe your issue]', async ({ page }) => {
  // Your debugging code here
  await page.goto('https://www.demoblaze.com/');
  
  // Add temporary console.logs as needed
  console.log('Debugging...');
});
```

## Running Debug Tests

```bash
# Run only debug tests
npx playwright test tests/debug/

# Run a specific debug test
npx playwright test tests/debug/my-debug.spec.ts

# Run with headed browser to see what's happening
npx playwright test tests/debug/ --headed
```

## Cleanup

Remember to delete your debug tests when done:

```bash
# PowerShell
Remove-Item tests\debug\*.spec.ts

# Bash
rm tests/debug/*.spec.ts
```

---

**Note:** This README will remain tracked in version control. All `.spec.ts` files are intentionally gitignored.