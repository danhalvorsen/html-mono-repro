import { test as base } from "@playwright/test";

import { SynthBrowserPage } from "./SynthBrowserPage.js";
import { VoiceControlPage } from "./VoiceControlPage.js";

export interface ISynthPlaywrightFixtures {
  readonly synthPage: SynthBrowserPage;
  readonly voiceControlPage: VoiceControlPage;
}

export const test = base.extend<ISynthPlaywrightFixtures>({
  synthPage: async ({ page }, use) => {
    await use(new SynthBrowserPage(page));
  },

  voiceControlPage: async ({ page }, use) => {
    await use(new VoiceControlPage(page));
  },
});

export { expect } from "@playwright/test";
