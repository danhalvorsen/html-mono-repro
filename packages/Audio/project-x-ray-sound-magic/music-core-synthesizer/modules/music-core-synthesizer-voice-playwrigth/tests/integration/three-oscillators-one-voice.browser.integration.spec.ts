import { expect, test } from "../support/SynthPlaywrightFixtures.js";

const TestPage = {
  ThreeOscillatorsOneVoice: "/three-oscillators-one-voice.html",
} as const;

const Selector = {
  OscillatorCount: "#voice-oscillator-count",
  Frequencies: "#voice-frequencies",
} as const;

const ExpectedPlayback = {
  TimeoutMilliseconds: 4_000,
  MinimumElapsedMilliseconds: 2_800,
  MaximumElapsedMilliseconds: 3_500,
} as const;

test.describe("Three oscillators in one Voice browser integration", () => {
  test("should play oscillator 1 through oscillator 3 in one voice with different frequencies", async ({ synthPage, page }) => {
    await synthPage.open(TestPage.ThreeOscillatorsOneVoice);

    await synthPage.shouldBeIdle();

    await expect(page.locator(Selector.OscillatorCount)).toHaveText("3");
    await expect(page.locator(Selector.Frequencies)).toHaveText(
      "261.63,329.63,392",
    );

    await synthPage.play();

    await synthPage.shouldStopWithin({
      timeoutMilliseconds: ExpectedPlayback.TimeoutMilliseconds,
      minimumElapsedMilliseconds: ExpectedPlayback.MinimumElapsedMilliseconds,
      maximumElapsedMilliseconds: ExpectedPlayback.MaximumElapsedMilliseconds,
    });
  });
});
