import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DynamicPage } from '../pages/DynamicPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { TablePage } from '../pages/TablePage';
import { faker } from '@faker-js/faker';

// Import credentials fixture
import * as credentials from '../fixtures/credentials.json';

test.describe('E2E Testing Playground Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to baseURL configured in playwright.config.ts
    await page.goto('/');
  });

  // CHALLENGE 1: ACCESS CONTROL (LOGIN)
  test.describe('Access Control (Login)', () => {
    
    test('should authenticate successfully with valid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);
      
      // Pull valid password from env variable, fallback to admin123
      const validPassword = process.env.VALID_PASSWORD || 'admin123';
      
      await loginPage.login(credentials.validUsername, validPassword);
      
      // Spinner should appear and success message should become visible
      await expect(loginPage.successMessage).toBeVisible();
      await expect(loginPage.successMessage).toContainText('Access Authorized!');
      await expect(loginPage.usernameInput).not.toBeVisible();
    });

    test('should display alert banner with invalid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page);
      
      await loginPage.login(credentials.invalidUsername, credentials.invalidPassword);
      
      // Error element should be shown
      await expect(loginPage.errorMessage).toBeVisible();
      await expect(loginPage.errorMessage).toContainText('Invalid credentials');
      await expect(loginPage.successMessage).not.toBeVisible();
    });

    test('should allow logging out to restore login state', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const validPassword = process.env.VALID_PASSWORD || 'admin123';

      await loginPage.login(credentials.validUsername, validPassword);
      await expect(loginPage.successMessage).toBeVisible();

      // Click logout and verify form returns
      await loginPage.logout();
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.successMessage).not.toBeVisible();
    });
  });

  // CHALLENGE 2: DYNAMIC ELEMENTS
  test.describe('Dynamic Elements', () => {
    
    test('should render dynamic data after simulated network latency', async ({ page }) => {
      const dynamicPage = new DynamicPage(page);

      await dynamicPage.triggerRequest();
      
      // Loader spinner should display during wait state
      await expect(dynamicPage.spinner).toBeVisible();
      
      // Playwright auto-waits for the dynamic box to become visible
      await expect(dynamicPage.resultBox).toBeVisible({ timeout: 5000 });
      await expect(dynamicPage.resultBox).toContainText('Data Loaded Successfully!');
      await expect(dynamicPage.statusCode).toHaveText('200 OK');
      await expect(dynamicPage.spinner).not.toBeVisible();
    });
  });

  // CHALLENGE 3: REGISTRATION FORM
  test.describe('Registration Form', () => {
    
    test('should submit successfully with faker-generated user profile', async ({ page }) => {
      const regPage = new RegistrationPage(page);
      
      // Use faker to generate dynamic mock values
      const fakeEmail = faker.internet.email();
      const chosenRole = 'tester';
      
      await regPage.register(fakeEmail, chosenRole, 'premium', true);
      
      // Assert form submission succeeds and displays generated details
      await expect(regPage.successMessage).toBeVisible();
      await expect(regPage.summaryText).toContainText(fakeEmail);
      await expect(regPage.summaryText).toContainText('QA Specialist');
      await expect(regPage.summaryText).toContainText('Premium (Pro)');
    });

    test('should trigger validation errors on empty fields', async ({ page }) => {
      const regPage = new RegistrationPage(page);
      
      // Click register with blank inputs
      await regPage.submitButton.click();
      
      // Error text alerts should show up
      await expect(regPage.emailError).toBeVisible();
      await expect(regPage.roleError).toBeVisible();
      await expect(regPage.termsError).toBeVisible();
    });

    test('should validate invalid email formats', async ({ page }) => {
      const regPage = new RegistrationPage(page);
      
      // Send malformed email string
      await regPage.register('not-an-email', 'developer', 'free', true);
      
      await expect(regPage.emailError).toBeVisible();
      await expect(regPage.roleError).not.toBeVisible();
    });

    test('should allow resetting the form after a successful registration', async ({ page }) => {
      const regPage = new RegistrationPage(page);
      const fakeEmail = faker.internet.email();

      await regPage.register(fakeEmail, 'manager', 'free', true);
      await expect(regPage.successMessage).toBeVisible();

      // Reset and verify inputs are cleared and form is restored
      await regPage.resetForm();
      await expect(regPage.emailInput).toBeVisible();
      await expect(regPage.emailInput).toHaveValue('');
      await expect(regPage.successMessage).not.toBeVisible();
    });
  });

  // CHALLENGE 4: DATA TABLE & LIVE FILTERS
  test.describe('Data Table & Live Filters', () => {
    
    test('should render six initial rows by default', async ({ page }) => {
      const tablePage = new TablePage(page);
      
      const count = await tablePage.getRowCount();
      expect(count).toBe(6);
    });

    test('should search by name or role matches', async ({ page }) => {
      const tablePage = new TablePage(page);

      // Search matching two developers
      await tablePage.search('Developer');
      
      const count = await tablePage.getRowCount();
      expect(count).toBe(3); // Alice Smith, Diana Prince, Fiona Gallagher
      
      // Check that names matches
      await expect(tablePage.getUserNameLocator(0)).toHaveText('Alice Smith');
      await expect(tablePage.getUserNameLocator(1)).toHaveText('Diana Prince');
      await expect(tablePage.getUserNameLocator(2)).toHaveText('Fiona Gallagher');
    });

    test('should filter by active/inactive status', async ({ page }) => {
      const tablePage = new TablePage(page);

      await tablePage.selectStatus('inactive');
      
      const count = await tablePage.getRowCount();
      expect(count).toBe(2); // Charlie Brown, Diana Prince
      
      await expect(tablePage.getUserStatusLocator(0)).toHaveText('Inactive');
      await expect(tablePage.getUserStatusLocator(1)).toHaveText('Inactive');
    });

    test('should combine search query and status filter constraints', async ({ page }) => {
      const tablePage = new TablePage(page);

      await tablePage.search('Developer');
      await tablePage.selectStatus('active');
      
      const count = await tablePage.getRowCount();
      expect(count).toBe(2); // Alice Smith, Fiona Gallagher
      
      await expect(tablePage.getUserNameLocator(0)).toHaveText('Alice Smith');
      await expect(tablePage.getUserNameLocator(1)).toHaveText('Fiona Gallagher');
    });

    test('should render empty table text when query yields no matches', async ({ page }) => {
      const tablePage = new TablePage(page);

      await tablePage.search('Nonexistent User Query');
      
      const count = await tablePage.getRowCount();
      expect(count).toBe(0);
      await expect(tablePage.emptyMessage).toBeVisible();
      await expect(tablePage.emptyMessage).toHaveText('No users matched your query.');
    });
  });

});
