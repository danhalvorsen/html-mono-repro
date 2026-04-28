import { test as base } from "@playwright/test";

import { SynthBrowserPage } from "./SynthBrowserPage.js";

export interface ISynthPlaywrightFixtures {
  readonly synthPage: SynthBrowserPage;
}

export const test = base.extend<ISynthPlaywrightFixtures>({
  synthPage: async ({ page }, use) => {
    await use(new SynthBrowserPage(page));
  },
});

export { expect } from "@playwright/test";
