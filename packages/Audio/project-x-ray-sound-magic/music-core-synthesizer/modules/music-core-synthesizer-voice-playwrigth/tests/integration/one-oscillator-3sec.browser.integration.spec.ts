import { expect, test } from "../support/SynthPlaywrightFixtures.js";

const TestPage = {
  OneOscillator: "/one-oscillator-3sec.html",
} as const;

const Selector = {
  OscillatorControl: "#oscillator-control",
  Frequency: "#oscillator-frequency",
} as const;

const ExpectedPlayback = {
  TimeoutMilliseconds: 4_000,
  MinimumElapsedMilliseconds: 2_800,
  MaximumElapsedMilliseconds: 3_500,
} as const;

test.describe("Oscillator UI browser integration", () => {
  test("should use oscillator-control and play one oscillator for approximately three seconds", async ({ synthPage, page }) => {
    await synthPage.open(TestPage.OneOscillator);

    await page.waitForFunction(async () => {
      await customElements.whenDefined("oscillator-control");
      return document.querySelector("#oscillator-control") !== null;
    });

    await expect(page.locator(Selector.OscillatorControl)).toBeVisible();
    await expect(page.locator(Selector.Frequency)).toHaveText("440");
    await synthPage.shouldBeIdle();

    await synthPage.play();

    await synthPage.shouldStopWithin({
      timeoutMilliseconds: ExpectedPlayback.TimeoutMilliseconds,
      minimumElapsedMilliseconds: ExpectedPlayback.MinimumElapsedMilliseconds,
      maximumElapsedMilliseconds: ExpectedPlayback.MaximumElapsedMilliseconds,
    });
  });
});
