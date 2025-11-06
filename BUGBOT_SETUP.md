# 🤖 Bugbot Setup Guide

## What is Bugbot?

"Bugbot" is our automated code quality and validation system that catches errors **before** they reach CI/CD pipelines. It consists of:

1. **GitHub Actions Workflow** - Validates code on every push
2. **Pre-commit Hooks** - Catches issues before committing
3. **Linting & Formatting** - Ensures code quality standards

---

## 🚀 Quick Setup

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- ESLint (code linting)
- Prettier (code formatting)
- Husky (Git hooks manager)
- TypeScript compiler

### Step 2: Initialize Husky

```bash
npm run prepare
```

This creates the `.husky` directory and sets up Git hooks.

### Step 3: Make Pre-commit Hook Executable (Linux/Mac only)

```bash
chmod +x .husky/pre-commit
```

On Windows, this step is not necessary.

---

## 🔍 What Bugbot Checks

### Pre-Commit Checks (Local)

When you run `git commit`, Bugbot automatically:

1. ✅ **Code Formatting** - Checks if code follows Prettier standards
2. ✅ **Linting** - Runs ESLint to catch common errors
3. ✅ **TypeScript Compilation** - Ensures no TypeScript errors
4. ✅ **Test Discovery** - Validates that Playwright can find tests

If any check fails, the commit is blocked until you fix the issues.

### GitHub Actions Checks (CI/CD)

The Code Quality workflow (`.github/workflows/code-quality.yml`) runs on:
- Every push to main, master, develop, or feature branches
- Every pull request

It performs:
1. 🎨 Code formatting validation
2. 🔍 TypeScript linting
3. 🧪 Test file compilation check
4. 📋 Test discovery validation
5. ✅ Workflow syntax validation

---

## 🛠️ Manual Commands

### Run All Checks Locally

```bash
npm run check
```

### Check Code Formatting

```bash
npm run format:check
```

### Auto-fix Formatting Issues

```bash
npm run format
```

### Run Linter

```bash
npm run lint
```

### Validate TypeScript Compilation

```bash
npx tsc --noEmit
```

### List All Tests

```bash
npx playwright test --list
```

---

## 🐛 Common Issues & Fixes

### Issue: "eslint is not recognized"

**Fix:** Run `npm install` to install dependencies

### Issue: Pre-commit hook not running

**Fix:** 
```bash
npm run prepare
chmod +x .husky/pre-commit  # Linux/Mac only
```

### Issue: "Formatting issues found"

**Fix:** Run `npm run format` to auto-fix

### Issue: TypeScript compilation errors

**Fix:** Check the error messages and fix TypeScript errors in your code

### Issue: Tests not discoverable

**Fix:** Ensure test files are in the `tests/` directory and end with `.spec.ts`

---

## 📊 Workflow Integration

### Bypassing Checks (Not Recommended)

To skip pre-commit hooks (emergency only):
```bash
git commit --no-verify -m "your message"
```

⚠️ **Warning:** The GitHub Actions workflow will still catch the errors!

### Viewing GitHub Actions Results

1. Go to your repository on GitHub
2. Click the "Actions" tab
3. Look for the "🤖 Code Quality (Bugbot)" workflow
4. Click on any run to see detailed results

---

## 🎯 Benefits

| Benefit | Description |
|---------|-------------|
| **Early Error Detection** | Catch issues before they reach CI/CD |
| **Faster Feedback** | Fix problems locally vs waiting for CI |
| **Code Quality** | Maintain consistent code standards |
| **CI/CD Reliability** | Prevent failed builds from simple errors |
| **Team Productivity** | Less time debugging CI failures |

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `.eslintrc.json` | ESLint configuration |
| `.prettierrc.json` | Prettier formatting rules |
| `.husky/pre-commit` | Pre-commit hook script |
| `.github/workflows/code-quality.yml` | GitHub Actions workflow |

---

## 📝 Customization

### Modify ESLint Rules

Edit `.eslintrc.json`:
```json
{
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

### Modify Prettier Rules

Edit `.prettierrc.json`:
```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100
}
```

### Add More Pre-commit Checks

Edit `.husky/pre-commit` and add your custom checks.

---

## 🎓 Best Practices

1. ✅ **Always run checks before pushing** - Use `npm run check`
2. ✅ **Fix issues locally** - Don't push broken code
3. ✅ **Review GitHub Actions results** - Even if local checks pass
4. ✅ **Keep dependencies updated** - Run `npm update` regularly
5. ✅ **Don't bypass checks** - Unless absolutely necessary

---

## 📚 Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## 🆘 Support

If you encounter issues with Bugbot:

1. Check this documentation
2. Run `npm install` to ensure dependencies are installed
3. Verify Node.js version is 20.x or higher
4. Check GitHub Actions logs for detailed error messages
5. Review the error output from the pre-commit hook

---

*Last updated: November 5, 2025*



