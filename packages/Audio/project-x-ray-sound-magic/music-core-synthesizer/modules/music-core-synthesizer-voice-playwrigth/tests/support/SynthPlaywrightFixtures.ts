import { test as base } from "@playwright/test";

import { MultiVoicePage } from "./MultiVoicePage.js";
import { OneVoicePage } from "./OneVoicePage.js";

export interface ISynthPlaywrightFixtures {
  readonly oneVoicePage: OneVoicePage;
  readonly multiVoicePage: MultiVoicePage;
}

export const test = base.extend<ISynthPlaywrightFixtures>({
  oneVoicePage: async ({ page }, use) => {
    await use(new OneVoicePage(page));
  },

  multiVoicePage: async ({ page }, use) => {
    await use(new MultiVoicePage(page));
  },
});

export { expect } from "@playwright/test";
