import { test } from "@playwright/test";

import { AudibleVoiceStatePage } from "../support/AudibleVoiceStatePage.js";

test.describe("Voice browser integration", () => {
  test("should create a voice and play audible sound during the active state", async ({ page }) => {
    const voicePage = new AudibleVoiceStatePage(page);

    await voicePage.open();

    await voicePage.shouldBeNotCreated();

    await voicePage.createVoice();

    await voicePage.shouldBeIdle();

    await voicePage.playVoice();

    await voicePage.shouldBeActive();

    await voicePage.shouldBeReleasedAfterAudiblePlayback();

    await voicePage.reset();

    await voicePage.shouldBeNotCreated();
  });
});
