import { expect, test } from "../support/SynthPlaywrightFixtures.js";

const TestPage = {
  TwoOscTwoAdsrs: "/two-osc-two-adsrs.html",
} as const;

const Selector = {
  PlayVoice: "#play-voice",
  State: "#voice-state",
  LayerCount: "#voice-layer-count",
  OscillatorCount: "#voice-oscillator-count",
  EnvelopeCount: "#voice-envelope-count",
  Frequencies: "#voice-frequencies",
  EnvelopeReleases: "#voice-envelope-releases",
  ElapsedMilliseconds: "#voice-elapsed-ms",
  Error: "#voice-error",
} as const;

const ExpectedPlayback = {
  TimeoutMilliseconds: 3_000,
  MinimumElapsedMilliseconds: 1_700,
  MaximumElapsedMilliseconds: 2_400,
} as const;

test.describe("Two oscillators with two ADSRs in one Voice browser integration", () => {
  test("should play oscillator 1 with ADSR 1 and oscillator 2 with ADSR 2 inside the same voice", async ({ page }) => {
    await page.goto(TestPage.TwoOscTwoAdsrs);

    await expect(page.locator(Selector.PlayVoice)).toBeVisible();
    await expect(page.locator(Selector.State)).toHaveText("idle");
    await expect(page.locator(Selector.LayerCount)).toHaveText("2");
    await expect(page.locator(Selector.OscillatorCount)).toHaveText("2");
    await expect(page.locator(Selector.EnvelopeCount)).toHaveText("2");
    await expect(page.locator(Selector.Frequencies)).toHaveText("261.63,392");
    await expect(page.locator(Selector.EnvelopeReleases)).toHaveText("0.2,0.6");
    await expect(page.locator(Selector.ElapsedMilliseconds)).toHaveText("0");
    await expect(page.locator(Selector.Error)).toHaveText("");

    await page.locator(Selector.PlayVoice).click();

    await expect(page.locator(Selector.State)).toHaveText("playing");

    await expect(page.locator(Selector.State)).toHaveText("stopped", {
      timeout: ExpectedPlayback.TimeoutMilliseconds,
    });

    const elapsedText = await page
      .locator(Selector.ElapsedMilliseconds)
      .textContent();

    const elapsedMilliseconds = Number(elapsedText);

    expect(Number.isFinite(elapsedMilliseconds)).toBe(true);
    expect(elapsedMilliseconds).toBeGreaterThanOrEqual(
      ExpectedPlayback.MinimumElapsedMilliseconds,
    );
    expect(elapsedMilliseconds).toBeLessThanOrEqual(
      ExpectedPlayback.MaximumElapsedMilliseconds,
    );

    await expect(page.locator(Selector.Error)).toHaveText("");
  });
});
