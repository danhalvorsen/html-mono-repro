import { BrowserAudioPlaybackDurationConfiguration } from "./support/BrowserAudioPlaybackDurationConfiguration.js";
import "@monorepo/music-core-synthesizer-oscillators-web-ui";

import type {
  OscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import { BasicOscillatorDefinitionFactory } from "./support/BasicOscillatorDefinitionFactory.js";
import { BasicOscillatorDefinitionGuard } from "./support/BasicOscillatorDefinitionGuard.js";
import { BrowserAudioOscillatorPlayer } from "./support/BrowserAudioOscillatorPlayer.js";
import { BrowserElementResolver } from "./support/BrowserElementResolver.js";
import { PlaybackState, type PlaybackStateValue } from "./support/PlaybackState.js";

const BrowserElementId = {
  OscillatorControl: "oscillator-control",
  PlayOscillator: "play-oscillator",
  OscillatorState: "oscillator-state",
  OscillatorWaveform: "oscillator-waveform",
  OscillatorFrequency: "oscillator-frequency",
  OscillatorElapsedMilliseconds: "oscillator-elapsed-ms",
  OscillatorError: "oscillator-error",
} as const;

const OscillatorControlEvent = {
  DefinitionChanged: "oscillator-control-definition-changed",
} as const;

const TestAudio = {
  FrequencyHz: 440,
  DurationSeconds: BrowserAudioPlaybackDurationConfiguration.resolve().durationSeconds,
  OutputGain: 1,
  SafePerOscillatorGain: 0.18,
} as const;

interface IOscillatorDefinitionChangedDetail {
  readonly definition: OscillatorDefinition;
}

interface IOscillatorControlElement extends HTMLElement {
  definition: OscillatorDefinition;
}

class OneOscillatorCompositionRoot {
  public compose(): OneOscillatorApplication {
    return new OneOscillatorApplication(
      BrowserElementResolver.getRequiredElement<IOscillatorControlElement>(
        BrowserElementId.OscillatorControl,
      ),
      BrowserElementResolver.getRequiredElement<HTMLButtonElement>(
        BrowserElementId.PlayOscillator,
      ),
      new BrowserOscillatorPresenter(
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.OscillatorState,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.OscillatorWaveform,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.OscillatorFrequency,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.OscillatorElapsedMilliseconds,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.OscillatorError,
        ),
      ),
      new BrowserAudioOscillatorPlayer(performance),
      BasicOscillatorDefinitionFactory.create({
        frequencyHz: TestAudio.FrequencyHz,
      }),
    );
  }
}

class OneOscillatorApplication {
  private currentDefinition: OscillatorDefinition;
  private isPlaying = false;

  public constructor(
    private readonly oscillatorControl: IOscillatorControlElement,
    private readonly playButton: HTMLButtonElement,
    private readonly presenter: IOscillatorPresenter,
    private readonly player: BrowserAudioOscillatorPlayer,
    initialDefinition: OscillatorDefinition,
  ) {
    this.currentDefinition = initialDefinition;
  }

  public async start(): Promise<void> {
    await customElements.whenDefined(BrowserElementId.OscillatorControl);

    this.oscillatorControl.definition = this.currentDefinition;

    this.presenter.presentDefinition(this.currentDefinition);
    this.presenter.presentState(PlaybackState.Idle);
    this.presenter.presentElapsedMilliseconds(0);
    this.presenter.presentError(null);

    this.oscillatorControl.addEventListener(
      OscillatorControlEvent.DefinitionChanged,
      this.onDefinitionChanged,
    );

    this.playButton.addEventListener("click", this.onPlayClicked);
  }

  private readonly onDefinitionChanged = (event: Event): void => {
    const customEvent = event as CustomEvent<IOscillatorDefinitionChangedDetail>;
    this.currentDefinition = customEvent.detail.definition;
    this.presenter.presentDefinition(this.currentDefinition);
  };

  private readonly onPlayClicked = (): void => {
    void this.play();
  };

  private async play(): Promise<void> {
    if (this.isPlaying) {
      return;
    }

    this.isPlaying = true;
    this.presenter.presentState(PlaybackState.Playing);
    this.presenter.presentElapsedMilliseconds(0);
    this.presenter.presentError(null);

    try {
      const result = await this.player.play({
        oscillators: [
          BasicOscillatorDefinitionGuard.require(this.currentDefinition),
        ],
        durationSeconds: TestAudio.DurationSeconds,
        outputGain: TestAudio.OutputGain,
        maximumGainPerOscillator: TestAudio.SafePerOscillatorGain,
      });

      this.presenter.presentElapsedMilliseconds(result.elapsedMilliseconds);
      this.presenter.presentState(PlaybackState.Stopped);
    } catch (error) {
      this.presenter.presentError(error instanceof Error ? error.message : String(error));
      this.presenter.presentState(PlaybackState.Stopped);
    } finally {
      this.isPlaying = false;
    }
  }
}

interface IOscillatorPresenter {
  presentDefinition(definition: OscillatorDefinition): void;
  presentState(state: PlaybackStateValue): void;
  presentElapsedMilliseconds(elapsedMilliseconds: number): void;
  presentError(error: string | null): void;
}

class BrowserOscillatorPresenter implements IOscillatorPresenter {
  public constructor(
    private readonly stateOutput: HTMLOutputElement,
    private readonly waveformOutput: HTMLOutputElement,
    private readonly frequencyOutput: HTMLOutputElement,
    private readonly elapsedOutput: HTMLOutputElement,
    private readonly errorOutput: HTMLOutputElement,
  ) {}

  public presentDefinition(definition: OscillatorDefinition): void {
    const basicDefinition = BasicOscillatorDefinitionGuard.require(definition);

    this.waveformOutput.value = basicDefinition.waveform;
    this.frequencyOutput.value = String(basicDefinition.frequencyHz);
  }

  public presentState(state: PlaybackStateValue): void {
    this.stateOutput.value = state;
  }

  public presentElapsedMilliseconds(elapsedMilliseconds: number): void {
    this.elapsedOutput.value = String(elapsedMilliseconds);
  }

  public presentError(error: string | null): void {
    this.errorOutput.value = error ?? "";
  }
}

const application = new OneOscillatorCompositionRoot().compose();
await application.start();
