import { BrowserAudioPlaybackDurationConfiguration } from "./support/BrowserAudioPlaybackDurationConfiguration.js";
import type {
  IVoiceDefinition,
} from "@monorepo/music-core-synthesizer-voice-contracts";

import { BrowserAudioOscillatorPlayer } from "./support/BrowserAudioOscillatorPlayer.js";
import { BrowserElementResolver } from "./support/BrowserElementResolver.js";
import { DefaultThreeOscillatorVoiceDefinitionFactory } from "./support/VoiceDefinitionFactories.js";
import { PlaybackState, type PlaybackStateValue } from "./support/PlaybackState.js";
import { VoiceDefinitionFlattener } from "./support/VoiceDefinitionFlattener.js";

const BrowserElementId = {
  PlayVoice: "play-voice",
  VoiceState: "voice-state",
  VoiceOscillatorCount: "voice-oscillator-count",
  VoiceFrequencies: "voice-frequencies",
  VoiceElapsedMilliseconds: "voice-elapsed-ms",
  VoiceError: "voice-error",
} as const;

const TestAudio = {
  DurationSeconds: BrowserAudioPlaybackDurationConfiguration.resolve().durationSeconds,
  SafePerOscillatorGain: 0.08,
} as const;

class ThreeOscillatorVoiceCompositionRoot {
  public compose(): ThreeOscillatorVoiceApplication {
    return new ThreeOscillatorVoiceApplication(
      DefaultThreeOscillatorVoiceDefinitionFactory.create(),
      BrowserElementResolver.getRequiredElement<HTMLButtonElement>(
        BrowserElementId.PlayVoice,
      ),
      new BrowserVoicePresenter(
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceState,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceOscillatorCount,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceFrequencies,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceElapsedMilliseconds,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceError,
        ),
      ),
      new BrowserAudioOscillatorPlayer(performance),
    );
  }
}

class ThreeOscillatorVoiceApplication {
  private isPlaying = false;

  public constructor(
    private readonly definition: IVoiceDefinition,
    private readonly playButton: HTMLButtonElement,
    private readonly presenter: IVoicePresenter,
    private readonly player: BrowserAudioOscillatorPlayer,
  ) {}

  public start(): void {
    this.presenter.presentDefinition(this.definition);
    this.presenter.presentState(PlaybackState.Idle);
    this.presenter.presentElapsedMilliseconds(0);
    this.presenter.presentError(null);

    this.playButton.addEventListener("click", this.onPlayClicked);
  }

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
        oscillators: VoiceDefinitionFlattener.getBasicOscillators(this.definition),
        durationSeconds: TestAudio.DurationSeconds,
        outputGain: this.definition.outputGain,
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

interface IVoicePresenter {
  presentDefinition(definition: IVoiceDefinition): void;
  presentState(state: PlaybackStateValue): void;
  presentElapsedMilliseconds(elapsedMilliseconds: number): void;
  presentError(error: string | null): void;
}

class BrowserVoicePresenter implements IVoicePresenter {
  public constructor(
    private readonly stateOutput: HTMLOutputElement,
    private readonly oscillatorCountOutput: HTMLOutputElement,
    private readonly frequenciesOutput: HTMLOutputElement,
    private readonly elapsedOutput: HTMLOutputElement,
    private readonly errorOutput: HTMLOutputElement,
  ) {}

  public presentDefinition(definition: IVoiceDefinition): void {
    const oscillators = VoiceDefinitionFlattener.getBasicOscillators(definition);

    this.oscillatorCountOutput.value = String(oscillators.length);
    this.frequenciesOutput.value = oscillators
      .map((oscillator) => String(oscillator.frequencyHz))
      .join(",");
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

new ThreeOscillatorVoiceCompositionRoot().compose().start();
