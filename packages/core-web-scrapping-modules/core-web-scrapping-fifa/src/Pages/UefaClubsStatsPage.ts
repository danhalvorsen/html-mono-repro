
import { Page, Locator } from 'playwright';
import { pipe, filter, map } from 'remeda';

export class UefaClubsStatsPage {
  /**
   * Returns the Playwright Locator for the main stats table DOM element.
   */
  getTableDom(): Locator {
    return this.table;
  }
  /**
   * Returns the current table data as JSON (array of objects), using remeda for processing.
   */
  async getTableDataAsJson(): Promise<Record<string, string>[]> {
    const rows = await this.getClubRows();
    const rowCount = await rows.count();
    if (rowCount === 0) return [];
    const headerCells = await this.table.locator('thead tr th').allTextContents();
    const data: Record<string, string>[] = [];
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const cellValues = await row.locator('td').allTextContents();
      const rowObj: Record<string, string> = {};
      for (let j = 0; j < headerCells.length; j++) {
        rowObj[headerCells[j] || `col${j+1}`] = cellValues[j] || '';
      }
      data.push(rowObj);
    }
    // Example remeda usage: sort by Goals descending if present
    return pipe(
      data,
      map(x => x), // identity, but you can add more remeda transforms here
    );
  }

    /**
     * Returns club names with at least the given number of goals using remeda.
     */
    async getClubNamesWithMinGoals(minGoals: number): Promise<string[]> {
    const rows = await this.getClubRows();
    const rowCount = await rows.count();
    if (rowCount === 0) return [];
    const headerCells = await this.table.locator('thead tr th').allTextContents();
    const data: Record<string, string>[] = [];
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const cellValues = await row.locator('td').allTextContents();
      const rowObj: Record<string, string> = {};
      for (let j = 0; j < headerCells.length; j++) {
        rowObj[headerCells[j] || `col${j+1}`] = cellValues[j] || '';
      }
      data.push(rowObj);
    }
    const result = pipe(
      data,
      filter(club => Number(club.Goals) >= minGoals),
      map(club => club.Club)
    );
    console.log(`getClubNamesWithMinGoals(${minGoals}):`, result);
    return result;
    }
  readonly page: Page;
  readonly table: Locator;
  readonly searchInput: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('table'); // Adjust selector as needed
    this.searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    this.nextButton = page.locator('button, a', { hasText: 'Next' });
  }

  async goto() {
    await this.page.goto('https://www.uefa.com/uefachampionsleague/statistics/clubs/');
  }

  async getClubRows() {
    return this.table.locator('tbody tr');
  }

  async getClubNames(): Promise<string[]> {
    const rows = await this.getClubRows();
    return rows.allTextContents();
  }

  async searchClub(name: string) {
    await this.searchInput.fill(name);
    await this.page.waitForTimeout(500); // Wait for results to update
  }

  async nextPage() {
    await this.nextButton.click();
  }

  async clickKeyStats() {
    await this.page.getByRole('button', { name: 'Key stats' }).click();
  }

  async clickGoals() {
    await this.page.getByRole('button', { name: 'Goals' }).click();
  }

  async clickAttempts() {
    await this.page.getByRole('button', { name: 'Attempts' }).click();
  }

  async clickDistribution() {
    await this.page.getByRole('button', { name: 'Distribution' }).click();
  }

  async clickAttacking() {
    await this.page.getByRole('button', { name: 'Attacking' }).click();
  }

  async clickDefending() {
    await this.page.getByRole('button', { name: 'Defending' }).click();
  }

  async clickGoalkeeping() {
    await this.page.getByRole('button', { name: 'Goalkeeping' }).click();
  }

  async clickDisciplinary() {
    await this.page.getByRole('button', { name: 'Disciplinary' }).click();
  }

  /**
   * Logs the table data as JSON to the console.
   */
  async logTableDataAsJson() {
    const rows = await this.getClubRows();
    const rowCount = await rows.count();
    if (rowCount === 0) {
      console.log(JSON.stringify([]));
      return;
    }
    const headerCells = await this.table.locator('thead tr th').allTextContents();
    const data = [];
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const cellValues = await row.locator('td').allTextContents();
      const rowObj: Record<string, string> = {};
      for (let j = 0; j < headerCells.length; j++) {
        rowObj[headerCells[j] || `col${j+1}`] = cellValues[j] || '';
      }
      data.push(rowObj);
    }
    console.log(JSON.stringify(data, null, 2));
  }
}
