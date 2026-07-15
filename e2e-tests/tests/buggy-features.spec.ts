import { test, expect } from '@playwright/test';

test.describe('E2E Testing Playground - Staging Bug Checks', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // CHALLENGE 5: CART PRICE CALCULATOR
  test('should compute cart total correctly with percentage discount and tax', async ({ page }) => {
    await page.fill('[data-testid="calc-price-input"]', '100');
    await page.fill('[data-testid="calc-quantity-input"]', '2');
    await page.fill('[data-testid="calc-discount-input"]', '10'); // 10%
    await page.fill('[data-testid="calc-tax-input"]', '5'); // 5%
    await page.click('[data-testid="calc-submit-btn"]');

    // Assert correct behavior:
    // Subtotal = $200.00
    // Discount = 10% of $200 = $20.00
    // Tax = 5% of $180 = $9.00
    // Total = $189.00
    //
    // The buggy app will subtract $10 flat discount and calculate total incorrectly.
    await expect(page.locator('[data-testid="calc-subtotal"]')).toHaveText('$200.00');
    await expect(page.locator('[data-testid="calc-discount-amount"]')).toHaveText('$20.00');
    await expect(page.locator('[data-testid="calc-tax-amount"]')).toHaveText('$9.00');
    await expect(page.locator('[data-testid="calc-total"]')).toHaveText('$189.00');
  });

  // CHALLENGE 6: PASSWORD STRENGTH METER
  test('should evaluate password strength correctly at length boundaries', async ({ page }) => {
    const passwordInput = page.locator('[data-testid="strength-password-input"]');
    const strengthText = page.locator('[data-testid="strength-text"]');

    // "P@ss1234" is exactly 8 characters, has a digit, and a special character.
    // It should evaluate as "Strong".
    await passwordInput.fill('P@ss1234');
    await expect(strengthText).toHaveText('Strong');
  });

  // CHALLENGE 7: TO-DO PLANNER
  test('should retain active tasks and clear completed tasks', async ({ page }) => {
    const todoInput = page.locator('[data-testid="todo-input"]');
    const todoAddBtn = page.locator('[data-testid="todo-add-btn"]');
    const clearBtn = page.locator('[data-testid="todo-clear-btn"]');

    // Add Task A and Task B
    await todoInput.fill('Task A');
    await todoAddBtn.click();
    await todoInput.fill('Task B');
    await todoAddBtn.click();

    // Mark Task A as completed
    await page.click('[data-testid="todo-check-0"]');

    // Click Clear Completed
    await clearBtn.click();

    // Assert that Task A is removed and Task B is still present
    await expect(page.locator('[data-testid="todo-text-0"]')).toHaveText('Task B');
    await expect(page.locator('[data-testid="todo-text-1"]')).not.toBeVisible();
  });

  // CHALLENGE 8: DATE RANGE VALIDATOR
  test('should consider matching start and end dates as valid', async ({ page }) => {
    const startInput = page.locator('[data-testid="date-start-input"]');
    const endInput = page.locator('[data-testid="date-end-input"]');
    const errorMessage = page.locator('[data-testid="date-error-message"]');
    const successMessage = page.locator('[data-testid="date-success-message"]');

    await startInput.fill('2026-07-15');
    await endInput.fill('2026-07-15');

    // Equal dates are valid, so error message should be hidden and success message should be shown
    await expect(errorMessage).not.toBeVisible();
    await expect(successMessage).toBeVisible();
  });

  // CHALLENGE 9: FEEDBACK WIZARD
  test('should submit selected category correctly in feedback summary', async ({ page }) => {
    const categorySelect = page.locator('[data-testid="wizard-category-select"]');
    const nextBtn = page.locator('[data-testid="wizard-next-btn"]');
    const commentsInput = page.locator('[data-testid="wizard-comments-input"]');
    const submitBtn = page.locator('[data-testid="wizard-submit-btn"]');
    const summaryText = page.locator('[data-testid="wizard-summary-text"]');

    // Select Technical Support
    await categorySelect.selectOption('technical');
    await nextBtn.click();

    // Input comments and submit
    await commentsInput.fill('Need support with workspace integration.');
    await submitBtn.click();

    // Assert that summary confirms category: Technical Support
    await expect(summaryText).toContainText('Technical Support');
  });

});
