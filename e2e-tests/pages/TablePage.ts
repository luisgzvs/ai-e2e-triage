import { Locator, Page } from '@playwright/test';

export class TablePage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly statusFilter: Locator;
  readonly table: Locator;
  readonly rows: Locator;
  readonly emptyMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('[data-testid="table-search-input"]');
    this.statusFilter = page.locator('[data-testid="table-status-filter"]');
    this.table = page.locator('[data-testid="users-table"]');
    this.rows = page.locator('table[data-testid="users-table"] tbody tr');
    this.emptyMessage = page.locator('[data-testid="table-empty-msg"]');
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async selectStatus(status: 'all' | 'active' | 'inactive') {
    await this.statusFilter.selectOption(status);
  }

  async getRowCount(): Promise<number> {
    return await this.rows.count();
  }

  getUserNameLocator(index: number): Locator {
    return this.page.locator(`[data-testid="user-name-${index}"]`);
  }

  getUserRoleLocator(index: number): Locator {
    return this.page.locator(`[data-testid="user-role-${index}"]`);
  }

  getUserStatusLocator(index: number): Locator {
    return this.page.locator(`[data-testid="user-status-${index}"]`);
  }
}
