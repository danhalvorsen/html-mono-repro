import { AudioPlaybackExpectationFactory } from "../support/AudioPlaybackTestDefaults.js";
import { expect, test } from "../support/SynthPlaywrightFixtures.js";

const TestPage = {
  TwoOscTwoAdsrs: "/two-osc-two-adsrs.html",
} as const;

const Selector = {
  LayerCount: "#voice-layer-count",
  OscillatorCount: "#voice-oscillator-count",
  EnvelopeCount: "#voice-envelope-count",
  Frequencies: "#voice-frequencies",
  EnvelopeReleases: "#voice-envelope-releases",
} as const;

const ExpectedPlayback = AudioPlaybackExpectationFactory.createDefault();

test.describe("Two oscillators with two ADSRs in one Voice browser integration", () => {
  test("should play oscillator 1 with ADSR 1 and oscillator 2 with ADSR 2 inside the same voice", async ({ synthPage, page }) => {
    await synthPage.open(TestPage.TwoOscTwoAdsrs);

    await synthPage.shouldBeIdle();

    await expect(page.locator(Selector.LayerCount)).toHaveText("2");
    await expect(page.locator(Selector.OscillatorCount)).toHaveText("2");
    await expect(page.locator(Selector.EnvelopeCount)).toHaveText("2");
    await expect(page.locator(Selector.Frequencies)).toHaveText("261.63,392");
    await expect(page.locator(Selector.EnvelopeReleases)).toHaveText("0.2,0.6");

    await synthPage.play();

    await synthPage.shouldStopWithin({
      timeoutMilliseconds: ExpectedPlayback.timeoutMilliseconds,
      minimumElapsedMilliseconds: ExpectedPlayback.minimumElapsedMilliseconds,
      maximumElapsedMilliseconds: ExpectedPlayback.maximumElapsedMilliseconds,
    });
  });
});
