import {
  AudibleAudioDefaults,
  AudibleDurationResolver,
  AudibleVoiceState,
  BrowserAudibleVoicePlayer,
  type IAudibleVoiceDefinition,
  type AudibleVoiceStateValue,
} from "./support/BrowserAudibleVoicePlayer.js";
import { BrowserElementResolver } from "./support/BrowserElementResolver.js";

const BrowserElementId = {
  PlayTwoVoices: "play-two-voices",
  VoiceState: "voice-state",
  VoiceCount: "voice-count",
  Voice1Oscillators: "voice-1-oscillators",
  Voice2Oscillators: "voice-2-oscillators",
  VoiceFrequencies: "voice-frequencies",
  VoiceDurationMilliseconds: "voice-duration-ms",
  VoiceElapsedMilliseconds: "voice-elapsed-ms",
  VoiceError: "voice-error",
} as const;

class AudibleTwoVoicesCompositionRoot {
  public compose(): AudibleTwoVoicesApplication {
    return new AudibleTwoVoicesApplication(
      BrowserElementResolver.getRequiredElement<HTMLButtonElement>(
        BrowserElementId.PlayTwoVoices,
      ),
      new AudibleTwoVoicesPresenter(
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceState,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceCount,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.Voice1Oscillators,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.Voice2Oscillators,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceFrequencies,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceDurationMilliseconds,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceElapsedMilliseconds,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceError,
        ),
      ),
      new BrowserAudibleVoicePlayer(performance),
      DefaultTwoAudibleVoicesFactory.create(),
      AudibleDurationResolver.resolveMilliseconds(),
    );
  }
}

class AudibleTwoVoicesApplication {
  private isPlaying = false;

  public constructor(
    private readonly playButton: HTMLButtonElement,
    private readonly presenter: IAudibleTwoVoicesPresenter,
    private readonly player: BrowserAudibleVoicePlayer,
    private readonly voices: readonly IAudibleVoiceDefinition[],
    private readonly durationMilliseconds: number,
  ) {}

  public start(): void {
    this.presenter.presentDefinition(this.voices);
    this.presenter.presentDurationMilliseconds(this.durationMilliseconds);
    this.presenter.presentState(AudibleVoiceState.Idle);
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
    this.presenter.presentState(AudibleVoiceState.Playing);
    this.presenter.presentElapsedMilliseconds(0);
    this.presenter.presentError(null);

    try {
      const result = await this.player.play({
        voices: this.voices,
        durationMilliseconds: this.durationMilliseconds,
      });

      this.presenter.presentElapsedMilliseconds(result.elapsedMilliseconds);
      this.presenter.presentState(AudibleVoiceState.Stopped);
    } catch (error) {
      this.presenter.presentState(AudibleVoiceState.Stopped);
      this.presenter.presentError(error instanceof Error ? error.message : String(error));
    } finally {
      this.isPlaying = false;
    }
  }
}

interface IAudibleTwoVoicesPresenter {
  presentDefinition(voices: readonly IAudibleVoiceDefinition[]): void;
  presentState(state: AudibleVoiceStateValue): void;
  presentDurationMilliseconds(durationMilliseconds: number): void;
  presentElapsedMilliseconds(elapsedMilliseconds: number): void;
  presentError(error: string | null): void;
}

class AudibleTwoVoicesPresenter implements IAudibleTwoVoicesPresenter {
  public constructor(
    private readonly stateOutput: HTMLOutputElement,
    private readonly voiceCountOutput: HTMLOutputElement,
    private readonly voice1OscillatorsOutput: HTMLOutputElement,
    private readonly voice2OscillatorsOutput: HTMLOutputElement,
    private readonly frequenciesOutput: HTMLOutputElement,
    private readonly durationOutput: HTMLOutputElement,
    private readonly elapsedOutput: HTMLOutputElement,
    private readonly errorOutput: HTMLOutputElement,
  ) {}

  public presentDefinition(voices: readonly IAudibleVoiceDefinition[]): void {
    const voice1 = voices.find((voice) => voice.id === "voice-1");
    const voice2 = voices.find((voice) => voice.id === "voice-2");

    this.voiceCountOutput.value = String(voices.length);
    this.voice1OscillatorsOutput.value = this.renderOscillatorIds(voice1);
    this.voice2OscillatorsOutput.value = this.renderOscillatorIds(voice2);
    this.frequenciesOutput.value = voices
      .flatMap((voice) => voice.oscillators)
      .map((oscillator) => String(oscillator.frequencyHz))
      .join(",");
  }

  public presentState(state: AudibleVoiceStateValue): void {
    this.stateOutput.value = state;
  }

  public presentDurationMilliseconds(durationMilliseconds: number): void {
    this.durationOutput.value = String(durationMilliseconds);
  }

  public presentElapsedMilliseconds(elapsedMilliseconds: number): void {
    this.elapsedOutput.value = String(elapsedMilliseconds);
  }

  public presentError(error: string | null): void {
    this.errorOutput.value = error ?? "";
  }

  private renderOscillatorIds(
    voice: IAudibleVoiceDefinition | undefined,
  ): string {
    if (voice === undefined) {
      return "";
    }

    return voice.oscillators
      .map((oscillator) => oscillator.id)
      .join(",");
  }
}

class DefaultTwoAudibleVoicesFactory {
  public static create(): readonly IAudibleVoiceDefinition[] {
    return [
      {
        id: "voice-1",
        outputGain: AudibleAudioDefaults.OutputGain,
        oscillators: [
          {
            id: "osc-v1-a",
            frequencyHz: 261.63,
            gain: AudibleAudioDefaults.PerOscillatorGain,
          },
          {
            id: "osc-v1-b",
            frequencyHz: 329.63,
            gain: AudibleAudioDefaults.PerOscillatorGain,
          },
        ],
      },
      {
        id: "voice-2",
        outputGain: AudibleAudioDefaults.OutputGain,
        oscillators: [
          {
            id: "osc-v2-a",
            frequencyHz: 392,
            gain: AudibleAudioDefaults.PerOscillatorGain,
          },
          {
            id: "osc-v2-b",
            frequencyHz: 523.25,
            gain: AudibleAudioDefaults.PerOscillatorGain,
          },
        ],
      },
    ];
  }
}

new AudibleTwoVoicesCompositionRoot().compose().start();
