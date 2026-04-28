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
  CreateVoice: "create-voice",
  PlayVoice: "play-voice",
  Reset: "reset",
  VoiceState: "voice-state",
  VoiceFrequency: "voice-frequency",
  VoiceVelocity: "voice-velocity",
  VoiceDurationMilliseconds: "voice-duration-ms",
  VoiceElapsedMilliseconds: "voice-elapsed-ms",
  VoiceError: "voice-error",
} as const;

class AudibleVoiceStateCompositionRoot {
  public compose(): AudibleVoiceStateApplication {
    return new AudibleVoiceStateApplication(
      BrowserElementResolver.getRequiredElement<HTMLButtonElement>(
        BrowserElementId.CreateVoice,
      ),
      BrowserElementResolver.getRequiredElement<HTMLButtonElement>(
        BrowserElementId.PlayVoice,
      ),
      BrowserElementResolver.getRequiredElement<HTMLButtonElement>(
        BrowserElementId.Reset,
      ),
      new AudibleVoiceStatePresenter(
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceState,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceFrequency,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceVelocity,
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
      DefaultAudibleVoiceDefinitionFactory.createSingleOscillatorVoice(),
      AudibleDurationResolver.resolveMilliseconds(),
    );
  }
}

class AudibleVoiceStateApplication {
  private isCreated = false;
  private isPlaying = false;

  public constructor(
    private readonly createVoiceButton: HTMLButtonElement,
    private readonly playVoiceButton: HTMLButtonElement,
    private readonly resetButton: HTMLButtonElement,
    private readonly presenter: IAudibleVoiceStatePresenter,
    private readonly player: BrowserAudibleVoicePlayer,
    private readonly voice: IAudibleVoiceDefinition,
    private readonly durationMilliseconds: number,
  ) {}

  public start(): void {
    this.presenter.presentState(AudibleVoiceState.NotCreated);
    this.presenter.presentFrequency(null);
    this.presenter.presentVelocity(0);
    this.presenter.presentDurationMilliseconds(this.durationMilliseconds);
    this.presenter.presentElapsedMilliseconds(0);
    this.presenter.presentError(null);

    this.createVoiceButton.addEventListener("click", this.onCreateVoiceClicked);
    this.playVoiceButton.addEventListener("click", this.onPlayVoiceClicked);
    this.resetButton.addEventListener("click", this.onResetClicked);
  }

  private readonly onCreateVoiceClicked = (): void => {
    this.isCreated = true;
    this.presenter.presentState(AudibleVoiceState.Idle);
    this.presenter.presentFrequency(null);
    this.presenter.presentVelocity(0);
    this.presenter.presentElapsedMilliseconds(0);
    this.presenter.presentError(null);
  };

  private readonly onPlayVoiceClicked = (): void => {
    void this.playVoice();
  };

  private readonly onResetClicked = (): void => {
    if (this.isPlaying) {
      return;
    }

    this.isCreated = false;
    this.presenter.presentState(AudibleVoiceState.NotCreated);
    this.presenter.presentFrequency(null);
    this.presenter.presentVelocity(0);
    this.presenter.presentElapsedMilliseconds(0);
    this.presenter.presentError(null);
  };

  private async playVoice(): Promise<void> {
    if (!this.isCreated || this.isPlaying) {
      return;
    }

    this.isPlaying = true;
    this.presenter.presentState(AudibleVoiceState.Active);
    this.presenter.presentFrequency(this.voice.oscillators[0]?.frequencyHz ?? null);
    this.presenter.presentVelocity(0.75);
    this.presenter.presentElapsedMilliseconds(0);
    this.presenter.presentError(null);

    try {
      const result = await this.player.play({
        voices: [this.voice],
        durationMilliseconds: this.durationMilliseconds,
      });

      this.presenter.presentElapsedMilliseconds(result.elapsedMilliseconds);
      this.presenter.presentState(AudibleVoiceState.Released);
      this.presenter.presentVelocity(0);
    } catch (error) {
      this.presenter.presentState(AudibleVoiceState.Released);
      this.presenter.presentVelocity(0);
      this.presenter.presentError(error instanceof Error ? error.message : String(error));
    } finally {
      this.isPlaying = false;
    }
  }
}

interface IAudibleVoiceStatePresenter {
  presentState(state: AudibleVoiceStateValue): void;
  presentFrequency(frequencyHz: number | null): void;
  presentVelocity(velocity: number): void;
  presentDurationMilliseconds(durationMilliseconds: number): void;
  presentElapsedMilliseconds(elapsedMilliseconds: number): void;
  presentError(error: string | null): void;
}

class AudibleVoiceStatePresenter implements IAudibleVoiceStatePresenter {
  public constructor(
    private readonly stateOutput: HTMLOutputElement,
    private readonly frequencyOutput: HTMLOutputElement,
    private readonly velocityOutput: HTMLOutputElement,
    private readonly durationOutput: HTMLOutputElement,
    private readonly elapsedOutput: HTMLOutputElement,
    private readonly errorOutput: HTMLOutputElement,
  ) {}

  public presentState(state: AudibleVoiceStateValue): void {
    this.stateOutput.value = state;
  }

  public presentFrequency(frequencyHz: number | null): void {
    this.frequencyOutput.value = frequencyHz === null ? "none" : String(frequencyHz);
  }

  public presentVelocity(velocity: number): void {
    this.velocityOutput.value = String(velocity);
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
}

class DefaultAudibleVoiceDefinitionFactory {
  public static createSingleOscillatorVoice(): IAudibleVoiceDefinition {
    return {
      id: "audible-single-voice",
      outputGain: AudibleAudioDefaults.OutputGain,
      oscillators: [
        {
          id: "osc-v1",
          frequencyHz: 440,
          gain: AudibleAudioDefaults.PerOscillatorGain,
        },
      ],
    };
  }
}

new AudibleVoiceStateCompositionRoot().compose().start();
