# 🔧 Quick Fix Reference - Smoke Test Failures

## What Was Wrong? ❌

### 1. Wrong Configuration
```yaml
# GitHub Actions was using:
--grep="@smoke"  # Wrong!
```

### 2. Missing Browser Projects
```typescript
// Only had chromium-smoke
// Firefox and WebKit failed!
```

### 3. Flaky Modal Test
```typescript
page.evaluate(() => { /* DOM manipulation */ })  // Bad!
waitForTimeout(500)  // Bad!
waitForLoadState('networkidle')  // Times out!
```

---

## What's Fixed? ✅

### 1. Correct Configuration
```yaml
# Now using:
--config=playwright-smoke.config.ts
--project=${{ matrix.browser }}-smoke
```

### 2. All Browser Projects Added
```typescript
projects: [
  'chromium-smoke',
  'firefox-smoke',  // NEW
  'webkit-smoke',   // NEW
]
```

### 3. Stable Modal Test
```typescript
// Proper Playwright waits:
await autoModal.waitFor({ state: 'visible', timeout: 2000 })
await expect(modal).toBeHidden({ timeout: 3000 })
await expect(backdrop).toHaveCount(0, { timeout: 2000 })
```

---

## Files Changed 📝

1. `.github/workflows/playwright-tests.yml` - Line 56
2. `playwright-smoke.config.ts` - Added firefox/webkit projects + optimized timeouts
3. `tests/smoke/smoke-tests.spec.ts` - Fixed modal test

---

## Commit & Push 🚀

```bash
git add .
git commit -m "fix: resolve smoke test failures across all browsers

- Use dedicated playwright-smoke.config.ts in workflow
- Add firefox-smoke and webkit-smoke projects
- Fix flaky modal test with proper synchronization
- Remove DOM manipulation and hard-coded timeouts

Fixes #19"
git push
```

---

## Expected Result ✅

- ✅ Chromium tests: PASS
- ✅ Firefox tests: PASS
- ✅ WebKit tests: PASS
- ⏱️ Execution time: ~1-2 min per browser (down from ~2m 41s with failures)

---

## Local Verification ✅

Already tested locally - **ALL TESTS PASS:**

```
✅ should load homepage successfully @smoke (2.9s)
✅ should navigate to product categories @smoke (2.9s)
✅ should add product to cart @smoke (4.7s)
✅ should proceed to checkout @smoke (5.0s)
✅ should open user authentication modals @smoke (5.9s)

5 passed (8.2s)
```

---

**Ready to push!** 🎉

