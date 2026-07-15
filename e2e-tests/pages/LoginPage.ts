import { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly spinner: Locator;
  readonly successMessage: Locator;
  readonly logoutButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-testid="username-input"]');
    this.passwordInput = page.locator('[data-testid="password-input"]');
    this.submitButton = page.locator('[data-testid="login-submit-btn"]');
    this.spinner = page.locator('[data-testid="login-spinner"]');
    this.successMessage = page.locator('[data-testid="login-success-message"]');
    this.logoutButton = page.locator('[data-testid="logout-btn"]');
    this.errorMessage = page.locator('[data-testid="login-error-message"]');
  }

  async navigate() {
    await this.page.goto('/');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async logout() {
    await this.logoutButton.click();
  }
}
