# DemoBlaze E2E Test Plan

## Overview

This test plan covers end-to-end testing for the DemoBlaze e-commerce platform (https://www.demoblaze.com/). The test suite is designed to validate critical user journeys and ensure the application functions correctly across different browsers and devices.

## Coverage Goal

**Target Coverage: ≥80% of critical user journeys**

The test suite focuses on the most important user flows that directly impact business value:
- User registration and authentication
- Product browsing and selection
- Shopping cart management
- Checkout and order completion
- User session management

## Test Traceability Matrix

| Test ID | Priority | Feature | Description | Preconditions | Steps | Test Data | Expected Result |
|---------|----------|---------|-------------|---------------|-------|-----------|-----------------|
| REG-001 | High | Registration | Open sign up modal | User on homepage | Click "Sign up" link | N/A | Sign up modal opens |
| REG-002 | High | Registration | Register new user successfully | User on homepage | Click "Sign up", fill form, submit | Unique username, password | User registered successfully |
| REG-003 | Medium | Registration | Show error for duplicate username | User on homepage, existing user | Register user, try to register again with same username | Duplicate username | Error message displayed |
| REG-004 | Low | Registration | Close sign up modal | User on homepage, modal open | Click close button | N/A | Modal closes |
| LOG-001 | High | Login | Open login modal | User on homepage | Click "Log in" link | N/A | Login modal opens |
| LOG-002 | High | Login | Login with valid credentials | User on homepage, registered user | Click "Log in", fill form, submit | Valid username, password | User logged in, welcome message shown |
| LOG-003 | Medium | Login | Show error for invalid login | User on homepage | Click "Log in", fill with invalid credentials | Invalid username, password | Error message displayed |
| LOG-004 | Low | Login | Close login modal | User on homepage, modal open | Click close button | N/A | Modal closes |
| LOG-005 | High | Login | Show welcome message when logged in (authenticated) | Authenticated user session | Navigate to homepage | StorageState fixture | Welcome message visible |
| CART-001 | High | Add to Cart | Add single product to cart | User on homepage | Select category, click product, add to cart | Product from Phones category | Product added to cart |
| CART-002 | Medium | Add to Cart | Add multiple quantities of same product | User on homepage | Select product, add to cart 3 times | Same product | 3 items in cart |
| CART-003 | Medium | Add to Cart | Add different products to cart | User on homepage | Add phone, add laptop | Phone and laptop | 2 different products in cart |
| CART-004 | Low | Add to Cart | Show success message when adding | User on product page | Click "Add to cart" | N/A | Success dialog appears |
| CART-005 | Medium | Add to Cart | Verify product details in cart | User on product page | Add product, navigate to cart | Product details | Product details match in cart |
| CHECK-001 | High | Checkout | Complete full checkout process | User with item in cart | Fill checkout form, place order | Valid order data | Order confirmation displayed |
| CHECK-002 | Medium | Checkout | Validate required fields | User with item in cart, checkout modal open | Try to place order without filling fields | N/A | Modal stays open, order not placed |
| CHECK-003 | High | Checkout | Handle form submission with valid data | User with item in cart | Fill all fields, place order | Valid order data | Order placed successfully |
| CHECK-004 | Medium | Checkout | Display order details correctly | User with item in cart | Complete checkout | Valid order data | Order ID, amount, card, name displayed |
| CHECK-005 | Low | Checkout | Close order modal after completion | User with completed order | Click OK button | N/A | Modal closes, back to cart |
| CHECK-006 | Medium | Checkout | Extract order ID and amount | User with completed order | Complete checkout, extract details | Valid order data | Order ID and amount extracted |
| LOGOUT-001 | High | Logout | Handle logout functionality | Logged in user | Click "Log out" | N/A | User logged out, login link visible |
| LOGOUT-002 | High | Logout | Logout from authenticated session | Authenticated user (storageState) | Click "Log out" | StorageState fixture | User logged out |

## Test Environment

- **Application URL**: https://www.demoblaze.com/
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile Devices**: Pixel 5 (Chrome), iPhone 12 (Safari)
- **Test Framework**: Playwright v1.48+
- **Language**: TypeScript

## Tools & Technologies

- **Playwright**: v1.48+ - Modern end-to-end testing framework
- **TypeScript**: Type-safe test development
- **Page Object Model (POM)**: Maintainable test structure
- **StorageState Fixtures**: Reusable authenticated sessions
- **GitHub Actions**: CI/CD pipeline

## Risks & Mitigations

### Risk 1: Flaky Locators
**Risk**: Tests fail due to brittle selectors (CSS chains, nth-child, XPath)
**Mitigation**: 
- Use ONLY resilient Playwright locators: `getByRole()`, `getByText()`, `getByTestId()`, `getByLabel()`, `getByPlaceholder()`
- Avoid nth-child, long CSS chains, and XPath unless absolutely no alternative exists
- All page objects use role-based and text-based locators
- Comments added suggesting data-testid attributes for future improvements

### Risk 2: Authentication Timeouts
**Risk**: Login operations timeout or fail intermittently
**Mitigation**:
- Use `storageState` fixture for authenticated sessions
- Pre-authenticate once in setup project, reuse session across tests
- Proper wait strategies using `waitForLoadState()` instead of hardcoded timeouts
- Retry mechanism configured (2 retries in CI)

### Risk 3: Network Flakiness
**Risk**: Network requests fail or timeout
**Mitigation**:
- Use `waitForLoadState('networkidle')` for page loads
- Configure appropriate timeouts (60s test timeout, 20s navigation timeout)
- Retry failed tests automatically in CI
- Trace collection on first retry for debugging

### Risk 4: Dialog Handling
**Risk**: JavaScript alert dialogs not handled correctly
**Mitigation**:
- Set up dialog handlers before triggering actions
- Use `page.waitForEvent('dialog')` with proper timeouts
- Accept dialogs explicitly in all add-to-cart operations
- Verify dialog messages in tests

### Risk 5: Mobile Responsiveness
**Risk**: Tests fail on mobile viewports due to responsive design
**Mitigation**:
- Test on mobile devices (Pixel 5, iPhone 12)
- Use role-based locators that work across viewports
- Avoid viewport-specific selectors
- Test mobile menu expansion if needed

### Risk 6: Test Data Conflicts
**Risk**: Tests interfere with each other due to shared test data
**Mitigation**:
- Generate unique usernames using timestamps
- Each test creates its own test data
- StorageState fixture uses unique credentials
- No shared state between tests

## Test Execution Strategy

### Local Execution
```bash
# Run all tests
npm test

# Run smoke tests only
npm run test:smoke

# Run specific browser
npm run test:chromium

# Run in UI mode
npm run test:ui

# Debug mode
npm run test:debug
```

### CI Execution
- Runs on every push and pull request
- Executes on Ubuntu-latest with Node 20
- Tests run in parallel across browsers
- Artifacts (reports, traces) uploaded on failure
- Playwright browsers cached for faster execution

## Test Maintenance

### Adding New Tests
1. Create test file in `tests/specs/` directory
2. Use Page Object Model pattern
3. Use only resilient locators
4. Add test to traceability matrix
5. Update test plan if coverage changes

### Updating Page Objects
1. All locators must use resilient methods only
2. Extend BasePage for common functionality
3. Use `waitForLoad()` instead of hardcoded waits
4. Document any necessary workarounds

### Best Practices
- One logical journey per test file
- Clear, descriptive test names
- Proper use of test tags (@smoke, @regression)
- Parameterized tests for positive/negative cases
- No hardcoded waits - use auto-waiting
- Trace collection on first retry
- Video recording on failure

## Success Criteria

- ✅ All tests pass 100% locally
- ✅ Zero non-resilient locators
- ✅ Zero hardcoded waits (no waitForTimeout)
- ✅ Clean, maintainable code structure
- ✅ CI pipeline passes consistently
- ✅ 15-25 focused, well-organized tests
- ✅ ≥80% coverage of critical user journeys

## Future Enhancements

1. **Add data-testid attributes**: Suggest to DemoBlaze team to add data-testid for better testability
2. **API Testing**: Add API tests for backend validation
3. **Performance Testing**: Add performance metrics collection
4. **Visual Regression**: Add visual comparison testing
5. **Accessibility Testing**: Add a11y checks using Playwright's accessibility features

