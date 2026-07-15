import { Locator, Page } from '@playwright/test';

export class RegistrationPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly roleSelect: Locator;
  readonly planFreeRadio: Locator;
  readonly planPremiumRadio: Locator;
  readonly termsCheckbox: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly summaryText: Locator;
  readonly resetButton: Locator;
  readonly emailError: Locator;
  readonly roleError: Locator;
  readonly termsError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="reg-email-input"]');
    this.roleSelect = page.locator('[data-testid="reg-role-select"]');
    this.planFreeRadio = page.locator('[data-testid="plan-free-radio"]');
    this.planPremiumRadio = page.locator('[data-testid="plan-premium-radio"]');
    this.termsCheckbox = page.locator('[data-testid="reg-terms-checkbox"]');
    this.submitButton = page.locator('[data-testid="register-submit-btn"]');
    this.successMessage = page.locator('[data-testid="register-success-msg"]');
    this.summaryText = page.locator('[data-testid="register-summary-text"]');
    this.resetButton = page.locator('[data-testid="reset-register-btn"]');
    this.emailError = page.locator('[data-testid="email-error-text"]');
    this.roleError = page.locator('[data-testid="role-error-text"]');
    this.termsError = page.locator('[data-testid="terms-error-text"]');
  }

  async register(email: string, role: string, plan: 'free' | 'premium', acceptTerms: boolean) {
    await this.emailInput.fill(email);
    await this.roleSelect.selectOption(role);
    
    if (plan === 'premium') {
      await this.planPremiumRadio.check();
    } else {
      await this.planFreeRadio.check();
    }

    if (acceptTerms) {
      await this.termsCheckbox.check();
    } else {
      await this.termsCheckbox.uncheck();
    }

    await this.submitButton.click();
  }

  async resetForm() {
    await this.resetButton.click();
  }
}
