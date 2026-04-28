import { test } from "@playwright/test";

import { AudibleTwoVoicesPage } from "../support/AudibleTwoVoicesPage.js";

test.describe("two voices with two oscillators each", () => {
  test("keeps osc-v1 and osc-v2 bound to the voice they belong to while playing audible sound", async ({ page }) => {
    const voicePage = new AudibleTwoVoicesPage(page);

    await voicePage.open();

    await voicePage.shouldHaveBoundOscillators();

    await voicePage.play();

    await voicePage.shouldStopAfterAudiblePlayback();
  });
});
