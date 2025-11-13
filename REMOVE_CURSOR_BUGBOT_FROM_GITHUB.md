# How to Remove Cursor Bugbot from GitHub Checks

This guide walks you through completely removing Cursor Bugbot integration from your GitHub repository.

---

## 📋 Overview

Cursor Bugbot can be integrated with GitHub in two ways:
1. **As a GitHub App** (installed in your repository)
2. **As a Required Status Check** (in branch protection rules)

You need to remove both to completely disable it.

---

## 🔧 Step 1: Disable Cursor Bugbot in Cursor Dashboard

### Instructions

1. **Open your web browser** and go to: [cursor.com/dashboard](https://cursor.com/dashboard)

2. **Sign in** to your Cursor account

3. **Navigate to the Bugbot section:**
   - Look for a "Bugbot" tab or menu item in the dashboard
   - You should see a list of your connected repositories

4. **Find your repository:**
   - Look for `rbcausing/demoblaze-e2e-playwright` in the list

5. **Disable Bugbot:**
   - Click the **toggle** or **"Disable"** button next to your repository
   - If there's a settings/gear icon, click it and disable the integration
   - Confirm the action if prompted

6. **Verify:**
   - The repository should now show as "Disabled" or be removed from the active list

---

## 🗑️ Step 2: Remove Cursor Bugbot from GitHub Branch Protection

### 2.1 Navigate to Branch Protection Settings

1. Go to your repository on GitHub:
   ```
   https://github.com/rbcausing/demoblaze-e2e-playwright
   ```

2. Click on **Settings** (top navigation bar)

3. In the left sidebar, click on **Branches**

4. Find your branch protection rule for `main` (or whichever branch you have protected)

5. Click the **Edit** button (pencil icon) next to the rule

### 2.2 Remove Bugbot from Required Status Checks

1. Scroll down to **"Require status checks to pass before merging"**

2. Look for any of these check names:
   - ✅ `Cursor Bugbot`
   - ✅ `Cursor Bugbot / Review`
   - ✅ `cursor-bugbot`
   - ✅ Any variation with "Cursor" or "Bugbot"

3. **Remove the check:**
   - Click the **"X"** icon next to the Cursor Bugbot check name
   - This will remove it from the required checks list

4. **Save changes:**
   - Scroll to the bottom of the page
   - Click **"Save changes"**

### Visual Reference

**Before:**
```
☑ Require status checks to pass before merging
  ├─ ☑ Cursor Bugbot                    ← Remove this!
  ├─ ☑ 🔍 Lint & Validate
  └─ ☑ 🔥 Smoke Tests (chromium)
```

**After:**
```
☑ Require status checks to pass before merging
  ├─ ☑ 🔍 Lint & Validate
  └─ ☑ 🔥 Smoke Tests (chromium)
```

---

## 🔌 Step 3: Uninstall Cursor GitHub App (If Installed)

If Cursor Bugbot was installed as a GitHub App, you also need to uninstall it:

### Instructions

1. **Go to GitHub Settings:**
   ```
   https://github.com/settings/installations
   ```

2. **Find "Cursor" in the list of installed apps**

3. **Click "Configure"** next to Cursor

4. **Two options:**
   
   **Option A: Remove access to this specific repository**
   - Scroll down to "Repository access"
   - If you see your repository listed, remove it from the list
   - Click **"Save"**

   **Option B: Uninstall the app completely**
   - Scroll to the bottom
   - Click **"Uninstall"**
   - Confirm the uninstallation

---

## ✅ Step 4: Verify Removal

### 4.1 Check on a Pull Request

1. **Create a test PR** (or use an existing one):
   ```bash
   git checkout -b test/verify-bugbot-removed
   git commit --allow-empty -m "test: verify bugbot removed"
   git push origin test/verify-bugbot-removed
   ```

2. **Go to the PR on GitHub**

3. **Check the status checks section**
   - You should **NOT** see any "Cursor Bugbot" checks
   - Only your other checks (Code Quality, Smoke Tests, etc.) should appear

### 4.2 Check Branch Protection

1. Go back to **Settings → Branches → Edit rule**

2. Verify that:
   - ✅ Cursor Bugbot is not in the required checks list
   - ✅ Only your desired checks are listed

---

## 🎯 What Should Remain

After removing Cursor Bugbot, your repository will still have:

✅ **Pre-commit hooks** (local quality checks)
✅ **Code Quality workflow** (GitHub Actions)
✅ **E2E test workflows** (Playwright tests)
✅ **Branch protection rules** (without Bugbot)

These will continue to work as before!

---

## 🔍 Troubleshooting

### Issue: Can't find Cursor Bugbot in the dashboard

**Possible reasons:**
- It was never actually enabled (only documented as a guide)
- It's under a different name or section
- Your account doesn't have Bugbot access

**Solution:** If you can't find it in the dashboard, it's likely not enabled. Just proceed to remove it from GitHub branch protection.

---

### Issue: Cursor Bugbot still shows up on PRs

**Solution:**
1. Wait 5-10 minutes for GitHub to update
2. Close and reopen the PR
3. Create a new commit to trigger checks again
4. Check if the GitHub App is still installed (Step 3)

---

### Issue: Don't remember if Cursor Bugbot was enabled

**How to check:**
1. Look at an existing PR
2. Check the "Checks" tab
3. If you see "Cursor Bugbot" listed, it's enabled
4. If you don't see it, it was never enabled (just documented)

**Likely scenario:** Based on your repository, it looks like Cursor Bugbot was only documented as a recommendation but never actually enabled. The "Bugbot" in your project was just the custom code quality workflow.

---

## 📊 Summary Checklist

Use this checklist to ensure complete removal:

- [ ] **Disabled Bugbot in Cursor Dashboard** (if it was enabled)
- [ ] **Removed from GitHub branch protection** (required status checks)
- [ ] **Uninstalled Cursor GitHub App** (if it was installed)
- [ ] **Verified on a test PR** (no Bugbot checks appear)
- [ ] **Deleted Bugbot documentation files** (already done ✅)
- [ ] **Updated workflow references** (already done ✅)

---

## 🎉 You're Done!

Your repository is now free of Cursor Bugbot integration. Your code quality checks (pre-commit hooks and GitHub Actions) will continue to work as before.

### What's Next?

After fixing your merge conflicts:
1. Push your changes
2. Create or update your PR
3. The only checks that should run are:
   - 🤖 Code Quality
   - 🔥 Smoke Tests
   - 🎯 Full Test Suite
   - 📱 Mobile Tests

No Cursor Bugbot charges or credits will be used! 💰

---

**Need help?** If you encounter any issues, share screenshots of your branch protection settings or PR checks, and I can help troubleshoot!

