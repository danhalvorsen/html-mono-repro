import { expect, type Page } from "@playwright/test";

import { AudioPlaybackExpectationFactory } from "./AudioPlaybackTestDefaults.js";
import { BrowserPlaybackAssertions } from "./BrowserPlaybackAssertions.js";

const OneVoiceRoute = {
  AudibleVoiceState: "/audible-voice-state.html?durationMs=5000",
  OneOscillator: "/one-oscillator-3sec.html",
  OscillatorEnvelope: "/oscillator-envelope.html",
  ThreeOscillatorsOneVoice: "/three-oscillators-one-voice.html",
  TwoOscTwoAdsrs: "/two-osc-two-adsrs.html",
} as const;

const OneVoiceSelector = {
  CreateVoice: "#create-voice",
  PlayVoice: "#play-voice",
  PlayOscillator: "#play-oscillator",
  PlayEnvelopeVoice: "#play-envelope-voice",
  Reset: "#reset",

  OscillatorControl: "#oscillator-control",

  VoiceState: "#voice-state",
  OscillatorState: "#oscillator-state",
  EnvelopeState: "#envelope-state",

  VoiceFrequency: "#voice-frequency",
  VoiceVelocity: "#voice-velocity",
  OscillatorFrequency: "#oscillator-frequency",

  VoiceElapsedMilliseconds: "#voice-elapsed-ms",
  OscillatorElapsedMilliseconds: "#oscillator-elapsed-ms",
  EnvelopeElapsedMilliseconds: "#envelope-elapsed-ms",

  VoiceError: "#voice-error",
  OscillatorError: "#oscillator-error",
  EnvelopeError: "#envelope-error",

  VoiceOscillatorCount: "#voice-oscillator-count",
  VoiceLayerCount: "#voice-layer-count",
  VoiceEnvelopeCount: "#voice-envelope-count",
  VoiceFrequencies: "#voice-frequencies",
  VoiceEnvelopeReleases: "#voice-envelope-releases",

  EnvelopeKind: "#envelope-kind",
  EnvelopeAttack: "#envelope-attack",
  EnvelopeDecay: "#envelope-decay",
  EnvelopeSustain: "#envelope-sustain",
  EnvelopeRelease: "#envelope-release",
} as const;

const PageState = {
  NotCreated: "not-created",
  Idle: "idle",
  Active: "active",
  Released: "released",
  Playing: "playing",
  Stopped: "stopped",
} as const;

const ExpectedValue = {
  None: "none",
  Zero: "0",
  VoiceFrequencyHz: "440",
  VoiceVelocity: "0.75",
  OneOscillatorFrequencyHz: "440",
  ThreeOscillatorCount: "3",
  ThreeOscillatorFrequencies: "261.63,329.63,392",
  TwoLayerCount: "2",
  TwoOscillatorCount: "2",
  TwoEnvelopeCount: "2",
  TwoOscillatorFrequencies: "261.63,392",
  TwoEnvelopeReleases: "0.2,0.6",
  EnvelopeKind: "adsr",
  EnvelopeAttack: "0.05",
  EnvelopeDecay: "0.2",
  EnvelopeSustain: "0.65",
  EnvelopeRelease: "0.4",
} as const;

export class OneVoicePage {
  private readonly expectedPlayback = AudioPlaybackExpectationFactory.createDefault();

  public constructor(
    private readonly page: Page,
  ) {}

  public async shouldCreateVoiceAndPlayAudibleSoundDuringActiveState(): Promise<void> {
    await this.page.goto(OneVoiceRoute.AudibleVoiceState);

    await this.shouldBeNotCreated();

    await this.page.locator(OneVoiceSelector.CreateVoice).click();

    await this.shouldHaveVoiceStateIdle();

    await this.page.locator(OneVoiceSelector.PlayVoice).click();

    await expect(this.page.locator(OneVoiceSelector.VoiceState)).toHaveText(PageState.Active);
    await expect(this.page.locator(OneVoiceSelector.VoiceFrequency)).toHaveText(ExpectedValue.VoiceFrequencyHz);
    await expect(this.page.locator(OneVoiceSelector.VoiceVelocity)).toHaveText(ExpectedValue.VoiceVelocity);

    await expect(this.page.locator(OneVoiceSelector.VoiceState)).toHaveText(PageState.Released, {
      timeout: this.expectedPlayback.timeoutMilliseconds,
    });

    await BrowserPlaybackAssertions.shouldHaveElapsedWithinRange(
      this.page.locator(OneVoiceSelector.VoiceElapsedMilliseconds),
      this.expectedPlayback,
    );

    await expect(this.page.locator(OneVoiceSelector.VoiceVelocity)).toHaveText(ExpectedValue.Zero);
    await expect(this.page.locator(OneVoiceSelector.VoiceError)).toHaveText("");

    await this.page.locator(OneVoiceSelector.Reset).click();

    await this.shouldBeNotCreated();
  }

  public async shouldUseOscillatorControlAndPlayOneOscillator(): Promise<void> {
    await this.page.goto(OneVoiceRoute.OneOscillator);

    await this.page.waitForFunction(async () => {
      await customElements.whenDefined("oscillator-control");
      return document.querySelector("#oscillator-control") !== null;
    });

    await expect(this.page.locator(OneVoiceSelector.OscillatorControl)).toBeVisible();
    await expect(this.page.locator(OneVoiceSelector.OscillatorFrequency)).toHaveText(
      ExpectedValue.OneOscillatorFrequencyHz,
    );

    await this.shouldBeIdle({
      stateSelector: OneVoiceSelector.OscillatorState,
      elapsedSelector: OneVoiceSelector.OscillatorElapsedMilliseconds,
      errorSelector: OneVoiceSelector.OscillatorError,
    });

    await this.playAndShouldStop({
      playSelector: OneVoiceSelector.PlayOscillator,
      stateSelector: OneVoiceSelector.OscillatorState,
      elapsedSelector: OneVoiceSelector.OscillatorElapsedMilliseconds,
      errorSelector: OneVoiceSelector.OscillatorError,
    });
  }

  public async shouldPlayOscillatorThroughAdsrEnvelopeGraph(): Promise<void> {
    await this.page.goto(OneVoiceRoute.OscillatorEnvelope);

    await this.shouldBeIdle({
      stateSelector: OneVoiceSelector.EnvelopeState,
      elapsedSelector: OneVoiceSelector.EnvelopeElapsedMilliseconds,
      errorSelector: OneVoiceSelector.EnvelopeError,
    });

    await expect(this.page.locator(OneVoiceSelector.EnvelopeKind)).toHaveText(ExpectedValue.EnvelopeKind);
    await expect(this.page.locator(OneVoiceSelector.OscillatorFrequency)).toHaveText(
      ExpectedValue.OneOscillatorFrequencyHz,
    );
    await expect(this.page.locator(OneVoiceSelector.EnvelopeAttack)).toHaveText(ExpectedValue.EnvelopeAttack);
    await expect(this.page.locator(OneVoiceSelector.EnvelopeDecay)).toHaveText(ExpectedValue.EnvelopeDecay);
    await expect(this.page.locator(OneVoiceSelector.EnvelopeSustain)).toHaveText(ExpectedValue.EnvelopeSustain);
    await expect(this.page.locator(OneVoiceSelector.EnvelopeRelease)).toHaveText(ExpectedValue.EnvelopeRelease);

    await this.playAndShouldStop({
      playSelector: OneVoiceSelector.PlayEnvelopeVoice,
      stateSelector: OneVoiceSelector.EnvelopeState,
      elapsedSelector: OneVoiceSelector.EnvelopeElapsedMilliseconds,
      errorSelector: OneVoiceSelector.EnvelopeError,
    });
  }

  public async shouldPlayThreeOscillatorsInOneVoice(): Promise<void> {
    await this.page.goto(OneVoiceRoute.ThreeOscillatorsOneVoice);

    await this.shouldBeIdle({
      stateSelector: OneVoiceSelector.VoiceState,
      elapsedSelector: OneVoiceSelector.VoiceElapsedMilliseconds,
      errorSelector: OneVoiceSelector.VoiceError,
    });

    await expect(this.page.locator(OneVoiceSelector.VoiceOscillatorCount)).toHaveText(
      ExpectedValue.ThreeOscillatorCount,
    );
    await expect(this.page.locator(OneVoiceSelector.VoiceFrequencies)).toHaveText(
      ExpectedValue.ThreeOscillatorFrequencies,
    );

    await this.playAndShouldStop({
      playSelector: OneVoiceSelector.PlayVoice,
      stateSelector: OneVoiceSelector.VoiceState,
      elapsedSelector: OneVoiceSelector.VoiceElapsedMilliseconds,
      errorSelector: OneVoiceSelector.VoiceError,
    });
  }

  public async shouldPlayTwoOscillatorsWithTwoAdsrsInOneVoice(): Promise<void> {
    await this.page.goto(OneVoiceRoute.TwoOscTwoAdsrs);

    await this.shouldBeIdle({
      stateSelector: OneVoiceSelector.VoiceState,
      elapsedSelector: OneVoiceSelector.VoiceElapsedMilliseconds,
      errorSelector: OneVoiceSelector.VoiceError,
    });

    await expect(this.page.locator(OneVoiceSelector.VoiceLayerCount)).toHaveText(ExpectedValue.TwoLayerCount);
    await expect(this.page.locator(OneVoiceSelector.VoiceOscillatorCount)).toHaveText(
      ExpectedValue.TwoOscillatorCount,
    );
    await expect(this.page.locator(OneVoiceSelector.VoiceEnvelopeCount)).toHaveText(ExpectedValue.TwoEnvelopeCount);
    await expect(this.page.locator(OneVoiceSelector.VoiceFrequencies)).toHaveText(
      ExpectedValue.TwoOscillatorFrequencies,
    );
    await expect(this.page.locator(OneVoiceSelector.VoiceEnvelopeReleases)).toHaveText(
      ExpectedValue.TwoEnvelopeReleases,
    );

    await this.playAndShouldStop({
      playSelector: OneVoiceSelector.PlayVoice,
      stateSelector: OneVoiceSelector.VoiceState,
      elapsedSelector: OneVoiceSelector.VoiceElapsedMilliseconds,
      errorSelector: OneVoiceSelector.VoiceError,
    });
  }

  private async shouldBeNotCreated(): Promise<void> {
    await expect(this.page.locator(OneVoiceSelector.VoiceState)).toHaveText(PageState.NotCreated);
    await expect(this.page.locator(OneVoiceSelector.VoiceFrequency)).toHaveText(ExpectedValue.None);
    await expect(this.page.locator(OneVoiceSelector.VoiceVelocity)).toHaveText(ExpectedValue.Zero);
    await expect(this.page.locator(OneVoiceSelector.VoiceError)).toHaveText("");
  }

  private async shouldHaveVoiceStateIdle(): Promise<void> {
    await expect(this.page.locator(OneVoiceSelector.VoiceState)).toHaveText(PageState.Idle);
    await expect(this.page.locator(OneVoiceSelector.VoiceFrequency)).toHaveText(ExpectedValue.None);
    await expect(this.page.locator(OneVoiceSelector.VoiceVelocity)).toHaveText(ExpectedValue.Zero);
    await expect(this.page.locator(OneVoiceSelector.VoiceError)).toHaveText("");
  }

  private async shouldBeIdle(request: {
    readonly stateSelector: string;
    readonly elapsedSelector: string;
    readonly errorSelector: string;
  }): Promise<void> {
    await expect(this.page.locator(request.stateSelector)).toHaveText(PageState.Idle);
    await expect(this.page.locator(request.elapsedSelector)).toHaveText(ExpectedValue.Zero);
    await expect(this.page.locator(request.errorSelector)).toHaveText("");
  }

  private async playAndShouldStop(request: {
    readonly playSelector: string;
    readonly stateSelector: string;
    readonly elapsedSelector: string;
    readonly errorSelector: string;
  }): Promise<void> {
    await this.page.locator(request.playSelector).click();

    await expect(this.page.locator(request.stateSelector)).toHaveText(PageState.Playing);

    await expect(this.page.locator(request.stateSelector)).toHaveText(PageState.Stopped, {
      timeout: this.expectedPlayback.timeoutMilliseconds,
    });

    await BrowserPlaybackAssertions.shouldHaveElapsedWithinRange(
      this.page.locator(request.elapsedSelector),
      this.expectedPlayback,
    );

    await expect(this.page.locator(request.errorSelector)).toHaveText("");
  }
}
