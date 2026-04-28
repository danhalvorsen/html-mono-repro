import { expect, type Page } from "@playwright/test";

import { AudioPlaybackExpectationFactory } from "./AudioPlaybackTestDefaults.js";
import { BrowserPlaybackAssertions } from "./BrowserPlaybackAssertions.js";

const MultiVoiceRoute = {
  TwoVoicesTwoOscillators: "/audible-two-voices-two-oscillators.html?durationMs=5000",
} as const;

const MultiVoiceSelector = {
  PlayTwoVoices: "#play-two-voices",
  State: "#voice-state",
  VoiceCount: "#voice-count",
  Voice1Oscillators: "#voice-1-oscillators",
  Voice2Oscillators: "#voice-2-oscillators",
  Frequencies: "#voice-frequencies",
  ElapsedMilliseconds: "#voice-elapsed-ms",
  Error: "#voice-error",
} as const;

const PageState = {
  Idle: "idle",
  Playing: "playing",
  Stopped: "stopped",
} as const;

const ExpectedValue = {
  VoiceCount: "2",
  Voice1Oscillators: "osc-v1-a,osc-v1-b",
  Voice2Oscillators: "osc-v2-a,osc-v2-b",
  Frequencies: "261.63,329.63,392,523.25",
} as const;

export class MultiVoicePage {
  private readonly expectedPlayback = AudioPlaybackExpectationFactory.createDefault();

  public constructor(
    private readonly page: Page,
  ) {}

  public async shouldKeepOscillatorsBoundToVoicesWhilePlayingAudibleSound(): Promise<void> {
    await this.page.goto(MultiVoiceRoute.TwoVoicesTwoOscillators);

    await expect(this.page.locator(MultiVoiceSelector.State)).toHaveText(PageState.Idle);
    await expect(this.page.locator(MultiVoiceSelector.VoiceCount)).toHaveText(ExpectedValue.VoiceCount);
    await expect(this.page.locator(MultiVoiceSelector.Voice1Oscillators)).toHaveText(
      ExpectedValue.Voice1Oscillators,
    );
    await expect(this.page.locator(MultiVoiceSelector.Voice2Oscillators)).toHaveText(
      ExpectedValue.Voice2Oscillators,
    );
    await expect(this.page.locator(MultiVoiceSelector.Frequencies)).toHaveText(ExpectedValue.Frequencies);
    await expect(this.page.locator(MultiVoiceSelector.Error)).toHaveText("");

    await this.page.locator(MultiVoiceSelector.PlayTwoVoices).click();

    await expect(this.page.locator(MultiVoiceSelector.State)).toHaveText(PageState.Playing);

    await expect(this.page.locator(MultiVoiceSelector.State)).toHaveText(PageState.Stopped, {
      timeout: this.expectedPlayback.timeoutMilliseconds,
    });

    await BrowserPlaybackAssertions.shouldHaveElapsedWithinRange(
      this.page.locator(MultiVoiceSelector.ElapsedMilliseconds),
      this.expectedPlayback,
    );

    await expect(this.page.locator(MultiVoiceSelector.Error)).toHaveText("");
  }
}
