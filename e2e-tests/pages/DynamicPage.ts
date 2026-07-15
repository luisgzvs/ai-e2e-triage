import { Locator, Page } from '@playwright/test';

export class DynamicPage {
  readonly page: Page;
  readonly triggerButton: Locator;
  readonly spinner: Locator;
  readonly resultBox: Locator;
  readonly statusCode: Locator;

  constructor(page: Page) {
    this.page = page;
    this.triggerButton = page.locator('[data-testid="trigger-dynamic-btn"]');
    this.spinner = page.locator('[data-testid="dynamic-spinner"]');
    this.resultBox = page.locator('[data-testid="dynamic-result-box"]');
    this.statusCode = page.locator('[data-testid="dynamic-status-code"]');
  }

  async triggerRequest() {
    await this.triggerButton.click();
  }
}
