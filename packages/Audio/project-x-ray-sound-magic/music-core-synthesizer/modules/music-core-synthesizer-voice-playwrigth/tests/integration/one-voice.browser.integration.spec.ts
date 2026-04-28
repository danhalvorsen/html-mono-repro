import { test } from "../support/SynthPlaywrightFixtures.js";

test.describe("One Voice browser integration", () => {
  test("should create a voice and play audible sound during the active state", async ({ oneVoicePage }) => {
    await oneVoicePage.shouldCreateVoiceAndPlayAudibleSoundDuringActiveState();
  });

  test("should use oscillator-control and play one oscillator for approximately the configured audio duration", async ({ oneVoicePage }) => {
    await oneVoicePage.shouldUseOscillatorControlAndPlayOneOscillator();
  });

  test("should play one oscillator through an ADSR envelope graph", async ({ oneVoicePage }) => {
    await oneVoicePage.shouldPlayOscillatorThroughAdsrEnvelopeGraph();
  });

  test("should play oscillator 1 through oscillator 3 in one voice with different frequencies", async ({ oneVoicePage }) => {
    await oneVoicePage.shouldPlayThreeOscillatorsInOneVoice();
  });

  test("should play oscillator 1 with ADSR 1 and oscillator 2 with ADSR 2 inside the same voice", async ({ oneVoicePage }) => {
    await oneVoicePage.shouldPlayTwoOscillatorsWithTwoAdsrsInOneVoice();
  });
});
