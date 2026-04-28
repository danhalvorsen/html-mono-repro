import { AudioPlaybackExpectationFactory } from "../support/AudioPlaybackTestDefaults.js";
import { expect, test } from "../support/SynthPlaywrightFixtures.js";

const TestPage = {
  OscillatorEnvelope: "/oscillator-envelope.html",
} as const;

const Selector = {
  EnvelopeKind: "#envelope-kind",
  Frequency: "#oscillator-frequency",
  Attack: "#envelope-attack",
  Decay: "#envelope-decay",
  Sustain: "#envelope-sustain",
  Release: "#envelope-release",
} as const;

const ExpectedPlayback = AudioPlaybackExpectationFactory.createDefault();

test.describe("Oscillator plus ADSR envelope browser integration", () => {
  test("should play one oscillator through an ADSR envelope graph", async ({ synthPage, page }) => {
    await synthPage.open(TestPage.OscillatorEnvelope);

    await synthPage.shouldBeIdle();

    await expect(page.locator(Selector.EnvelopeKind)).toHaveText("adsr");
    await expect(page.locator(Selector.Frequency)).toHaveText("440");
    await expect(page.locator(Selector.Attack)).toHaveText("0.05");
    await expect(page.locator(Selector.Decay)).toHaveText("0.2");
    await expect(page.locator(Selector.Sustain)).toHaveText("0.65");
    await expect(page.locator(Selector.Release)).toHaveText("0.4");

    await synthPage.play();

    await synthPage.shouldStopWithin({
      timeoutMilliseconds: ExpectedPlayback.timeoutMilliseconds,
      minimumElapsedMilliseconds: ExpectedPlayback.minimumElapsedMilliseconds,
      maximumElapsedMilliseconds: ExpectedPlayback.maximumElapsedMilliseconds,
    });
  });
});
