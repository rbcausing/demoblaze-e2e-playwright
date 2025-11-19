# DemoBlaze E2E Test Suite

[![Playwright Tests](https://github.com/rbcausing/demoblaze-e2e-playwright/actions/workflows/playwright.yml/badge.svg)](https://github.com/rbcausing/demoblaze-e2e-playwright/actions)
[![Playwright](https://img.shields.io/badge/playwright-1.48+-blue.svg)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/node-20.x-green.svg)](https://nodejs.org/)

> **Production-grade end-to-end testing framework for DemoBlaze e-commerce platform**

A comprehensive, maintainable Playwright test suite demonstrating industry-standard QA engineering practices. This repository showcases professional test automation with resilient locators, Page Object Model pattern, CI/CD integration, and production-ready code quality.

---

## 🎯 Why This Suite is Production-Grade

This test suite demonstrates senior QA engineering practices that would pass a FAANG interview panel:

### ✅ **Resilient Locators Only**
- Uses **exclusively** Playwright's resilient locator methods: `getByRole()`, `getByText()`, `getByTestId()`, `getByLabel()`, `getByPlaceholder()`
- **Zero** brittle selectors: no `nth-child`, no long CSS chains, no XPath
- Locators are maintainable and survive UI changes

### ✅ **Page Object Model (POM) Architecture**
- Clean separation of concerns with dedicated page classes
- All pages extend `BasePage` with common functionality
- Reusable, maintainable code structure

### ✅ **StorageState Authentication**
- Pre-authenticated sessions using Playwright's `storageState` fixture
- Eliminates redundant login operations
- Faster test execution and reduced flakiness

### ✅ **CI-First Design**
- GitHub Actions workflow with proper caching
- Artifact uploads for failed tests (reports + traces)
- Runs on every push and pull request
- Node 20, Ubuntu-latest, with browser caching

### ✅ **Zero Hardcoded Waits**
- Uses Playwright's auto-waiting exclusively
- `waitForLoadState('networkidle')` for page loads
- No `waitForTimeout()` calls - tests are reliable and fast

### ✅ **Professional Test Organization**
- Logical test grouping (registration, login, cart, checkout, logout)
- Clear, descriptive test names
- Comprehensive test plan with traceability matrix
- 15-25 focused, maintainable tests

### ✅ **Production-Ready Configuration**
- Single, clean `playwright.config.ts`
- Trace collection on first retry
- Video recording on failure
- Proper retry mechanisms for CI

### ✅ **AI-Assisted, Human-Reviewed**
- Code quality maintained through linting and formatting
- TypeScript for type safety
- Professional documentation and test planning

---

## 📊 Test Coverage

**Coverage Goal: ≥80% of critical user journeys**

| Feature | Test Count | Status |
|---------|-----------|--------|
| User Registration | 4 tests | ✅ Complete |
| User Login | 5 tests | ✅ Complete |
| Add to Cart | 5 tests | ✅ Complete |
| Checkout Flow | 6 tests | ✅ Complete |
| User Logout | 2 tests | ✅ Complete |
| **Total** | **22 tests** | ✅ **Complete** |

See [tests/plan.md](./tests/plan.md) for detailed test plan and traceability matrix.

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [Playwright](https://playwright.dev/) | ^1.48.0 | E2E testing framework |
| [TypeScript](https://www.typescriptlang.org/) | ^5.0.0 | Type-safe test development |
| [Node.js](https://nodejs.org/) | 20.x | Runtime environment |
| [GitHub Actions](https://github.com/features/actions) | Latest | CI/CD pipeline |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/rbcausing/demoblaze-e2e-playwright.git
cd demoblaze-e2e-playwright

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps
```

### Run Tests

```bash
# Run all tests
npm test

# Run smoke tests only
npm run test:smoke

# Run in UI mode (interactive)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Run specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Debug mode
npm run test:debug
```

### View Test Reports

```bash
# Open HTML report
npm run report
```

---

## 📁 Project Structure

```
.
├── playwright.config.ts          # Playwright configuration
├── package.json                  # Dependencies and scripts
├── tests/
│   ├── plan.md                   # Detailed test plan
│   ├── pages/                    # Page Object Model classes
│   │   ├── BasePage.ts
│   │   ├── HomePage.ts
│   │   ├── ProductPage.ts
│   │   ├── CartPage.ts
│   │   └── CheckoutPage.ts
│   ├── fixtures/                 # Test fixtures
│   │   └── auth.setup.ts         # Authentication setup
│   ├── specs/                    # Test specifications
│   │   ├── registration.spec.ts
│   │   ├── login.spec.ts
│   │   ├── add-to-cart.spec.ts
│   │   ├── checkout.spec.ts
│   │   └── logout.spec.ts
│   └── data/                     # Test data
├── .github/workflows/
│   └── playwright.yml            # CI/CD workflow
└── README.md                     # This file
```

---

## 🧪 Test Examples

### Example: Add Product to Cart

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { CartPage } from '../pages/CartPage';

test('should add product to cart', async ({ page }) => {
  const homePage = new HomePage(page);
  const cartPage = new CartPage(page);

  await homePage.navigate();
  await homePage.selectPhonesCategory();
  await homePage.clickFirstProduct();
  await homePage.addToCartFromProductPage();

  await cartPage.navigateToCart();
  const cartItems = await cartPage.getCartItemsCount();
  expect(cartItems).toBe(1);
});
```

### Example: Authenticated User Test

```typescript
import { test, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

test.describe('Authenticated User', () => {
  test.use({ storageState: authFile });

  test('should show welcome message', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/');
    await expect(page.getByText(/Welcome/)).toBeVisible();
  });
});
```

---

## 🔧 Configuration

### Playwright Config

Key settings in `playwright.config.ts`:

- **Test Directory**: `./tests/specs`
- **Base URL**: `https://www.demoblaze.com`
- **Trace**: Collected on first retry
- **Video**: Recorded on failure
- **Retries**: 2 retries in CI, 0 locally
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari

### Environment Variables

```bash
# Override base URL
BASE_URL=https://staging.demoblaze.com npm test

# Skip mobile tests
SKIP_MOBILE=true npm test
```

---

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/playwright.yml`) provides:

- ✅ Automatic test execution on push and pull requests
- ✅ Multi-browser testing (Chromium, Firefox, WebKit)
- ✅ Browser caching for faster execution
- ✅ Artifact uploads (reports + traces) on failure
- ✅ Node 20 on Ubuntu-latest

View workflow status: [![Playwright Tests](https://github.com/rbcausing/demoblaze-e2e-playwright/actions/workflows/playwright.yml/badge.svg)](https://github.com/rbcausing/demoblaze-e2e-playwright/actions)

---

## 📝 Best Practices

This suite follows industry best practices:

1. **Resilient Locators**: Only use `getByRole()`, `getByText()`, `getByTestId()`, `getByLabel()`, `getByPlaceholder()`
2. **Page Object Model**: Separate page logic from test logic
3. **No Hardcoded Waits**: Use Playwright's auto-waiting
4. **StorageState**: Reuse authenticated sessions
5. **Clear Test Names**: Descriptive test descriptions
6. **One Journey Per File**: Logical test organization
7. **Trace Collection**: Debug failures with traces
8. **CI-First**: Tests run reliably in CI/CD

---

## 🐛 Troubleshooting

### Tests Fail Locally

1. Ensure browsers are installed: `npx playwright install --with-deps`
2. Check network connectivity to https://www.demoblaze.com
3. Run in headed mode to see what's happening: `npm run test:headed`
4. Check test reports: `npm run report`

### CI Failures

1. Check GitHub Actions logs
2. Download artifacts (reports and traces) from failed runs
3. Review trace files in Playwright trace viewer
4. Ensure all dependencies are in `package.json`

---

## 📚 Documentation

- [Test Plan](./tests/plan.md) - Comprehensive test plan with traceability matrix
- [Playwright Documentation](https://playwright.dev/) - Official Playwright docs
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - TypeScript reference

---

## 🤝 Contributing

This is a professional portfolio project demonstrating QA engineering best practices. For questions or suggestions, please open an issue.

---

## 📄 License

ISC

---

## 🎓 Learning Resources

This test suite demonstrates:

- ✅ Production-grade Playwright test automation
- ✅ Page Object Model pattern
- ✅ Resilient locator strategies
- ✅ CI/CD integration with GitHub Actions
- ✅ TypeScript for type-safe testing
- ✅ Professional test organization and documentation

Perfect for:
- QA engineers preparing for senior roles
- Developers learning E2E testing
- Teams establishing testing standards
- Interview preparation (FAANG-level practices)

---

**Built with ❤️ using Playwright and TypeScript**
