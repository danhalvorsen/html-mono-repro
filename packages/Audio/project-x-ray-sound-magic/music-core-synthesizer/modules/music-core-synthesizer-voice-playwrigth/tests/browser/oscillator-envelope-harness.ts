import { BrowserAudioPlaybackDurationConfiguration } from "./support/BrowserAudioPlaybackDurationConfiguration.js";
import type {
  IAdsrEnvelopeDefinition,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";

import type {
  IBasicOscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import { AdsrEnvelopeDefinitionTestFactory } from "./support/AdsrEnvelopeDefinitionTestFactory.js";
import { BasicOscillatorDefinitionFactory } from "./support/BasicOscillatorDefinitionFactory.js";
import { BrowserElementResolver } from "./support/BrowserElementResolver.js";
import { BrowserEnvelopeOscillatorPlayer } from "./support/BrowserEnvelopeOscillatorPlayer.js";
import { PlaybackState, type PlaybackStateValue } from "./support/PlaybackState.js";

const BrowserElementId = {
  PlayEnvelopeVoice: "play-envelope-voice",
  EnvelopeState: "envelope-state",
  EnvelopeKind: "envelope-kind",
  OscillatorFrequency: "oscillator-frequency",
  EnvelopeAttack: "envelope-attack",
  EnvelopeDecay: "envelope-decay",
  EnvelopeSustain: "envelope-sustain",
  EnvelopeRelease: "envelope-release",
  EnvelopeElapsedMilliseconds: "envelope-elapsed-ms",
  EnvelopeError: "envelope-error",
} as const;

const TestAudio = {
  FrequencyHz: 440,
  NoteDurationSeconds: BrowserAudioPlaybackDurationConfiguration.resolveNoteDurationSeconds({ releaseSeconds: AdsrEnvelopeDefinitionTestFactory.createDefault().releaseSeconds }),
  MaximumGain: 0.18,
} as const;

class OscillatorEnvelopeCompositionRoot {
  public compose(): OscillatorEnvelopeApplication {
    return new OscillatorEnvelopeApplication(
      BasicOscillatorDefinitionFactory.create({
        frequencyHz: TestAudio.FrequencyHz,
        gain: 1,
      }),
      AdsrEnvelopeDefinitionTestFactory.createDefault(),
      BrowserElementResolver.getRequiredElement<HTMLButtonElement>(
        BrowserElementId.PlayEnvelopeVoice,
      ),
      new BrowserOscillatorEnvelopePresenter(
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.EnvelopeState,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.EnvelopeKind,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.OscillatorFrequency,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.EnvelopeAttack,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.EnvelopeDecay,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.EnvelopeSustain,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.EnvelopeRelease,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.EnvelopeElapsedMilliseconds,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.EnvelopeError,
        ),
      ),
      new BrowserEnvelopeOscillatorPlayer(performance),
    );
  }
}

class OscillatorEnvelopeApplication {
  private isPlaying = false;

  public constructor(
    private readonly oscillator: IBasicOscillatorDefinition,
    private readonly envelope: IAdsrEnvelopeDefinition,
    private readonly playButton: HTMLButtonElement,
    private readonly presenter: IOscillatorEnvelopePresenter,
    private readonly player: BrowserEnvelopeOscillatorPlayer,
  ) {}

  public start(): void {
    this.presenter.presentDefinition(this.oscillator, this.envelope);
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
        oscillator: this.oscillator,
        envelope: this.envelope,
        noteDurationSeconds: TestAudio.NoteDurationSeconds,
        maximumGain: TestAudio.MaximumGain,
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

interface IOscillatorEnvelopePresenter {
  presentDefinition(
    oscillator: IBasicOscillatorDefinition,
    envelope: IAdsrEnvelopeDefinition,
  ): void;

  presentState(state: PlaybackStateValue): void;
  presentElapsedMilliseconds(elapsedMilliseconds: number): void;
  presentError(error: string | null): void;
}

class BrowserOscillatorEnvelopePresenter implements IOscillatorEnvelopePresenter {
  public constructor(
    private readonly stateOutput: HTMLOutputElement,
    private readonly envelopeKindOutput: HTMLOutputElement,
    private readonly oscillatorFrequencyOutput: HTMLOutputElement,
    private readonly attackOutput: HTMLOutputElement,
    private readonly decayOutput: HTMLOutputElement,
    private readonly sustainOutput: HTMLOutputElement,
    private readonly releaseOutput: HTMLOutputElement,
    private readonly elapsedOutput: HTMLOutputElement,
    private readonly errorOutput: HTMLOutputElement,
  ) {}

  public presentDefinition(
    oscillator: IBasicOscillatorDefinition,
    envelope: IAdsrEnvelopeDefinition,
  ): void {
    this.envelopeKindOutput.value = envelope.kind;
    this.oscillatorFrequencyOutput.value = String(oscillator.frequencyHz);
    this.attackOutput.value = String(envelope.attackSeconds);
    this.decayOutput.value = String(envelope.decaySeconds);
    this.sustainOutput.value = String(envelope.sustainLevel);
    this.releaseOutput.value = String(envelope.releaseSeconds);
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

new OscillatorEnvelopeCompositionRoot().compose().start();
