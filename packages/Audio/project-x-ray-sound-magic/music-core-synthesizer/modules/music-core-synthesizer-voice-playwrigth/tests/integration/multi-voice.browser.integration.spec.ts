import { test } from "../support/SynthPlaywrightFixtures.js";

test.describe("Multi Voice browser integration", () => {
  test("should keep oscillators bound to their voice while playing audible sound", async ({ multiVoicePage }) => {
    await multiVoicePage.shouldKeepOscillatorsBoundToVoicesWhilePlayingAudibleSound();
  });
});
