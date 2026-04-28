import { expect, test } from "../support/SynthPlaywrightFixtures.js";

const TestPage = {
  OscillatorEnvelope: "/oscillator-envelope.html",
} as const;

const Selector = {
  Play: "#play-envelope-voice",
  State: "#envelope-state",
  EnvelopeKind: "#envelope-kind",
  Frequency: "#oscillator-frequency",
  Attack: "#envelope-attack",
  Decay: "#envelope-decay",
  Sustain: "#envelope-sustain",
  Release: "#envelope-release",
  ElapsedMilliseconds: "#envelope-elapsed-ms",
  Error: "#envelope-error",
} as const;

const ExpectedPlayback = {
  TimeoutMilliseconds: 3_000,
  MinimumElapsedMilliseconds: 1_550,
  MaximumElapsedMilliseconds: 2_100,
} as const;

test.describe("Oscillator plus ADSR envelope browser integration", () => {
  test("should play one oscillator through an ADSR envelope graph", async ({ page }) => {
    await page.goto(TestPage.OscillatorEnvelope);

    await expect(page.locator(Selector.Play)).toBeVisible();
    await expect(page.locator(Selector.State)).toHaveText("idle");
    await expect(page.locator(Selector.EnvelopeKind)).toHaveText("adsr");
    await expect(page.locator(Selector.Frequency)).toHaveText("440");
    await expect(page.locator(Selector.Attack)).toHaveText("0.05");
    await expect(page.locator(Selector.Decay)).toHaveText("0.2");
    await expect(page.locator(Selector.Sustain)).toHaveText("0.65");
    await expect(page.locator(Selector.Release)).toHaveText("0.4");
    await expect(page.locator(Selector.ElapsedMilliseconds)).toHaveText("0");
    await expect(page.locator(Selector.Error)).toHaveText("");

    await page.locator(Selector.Play).click();

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
