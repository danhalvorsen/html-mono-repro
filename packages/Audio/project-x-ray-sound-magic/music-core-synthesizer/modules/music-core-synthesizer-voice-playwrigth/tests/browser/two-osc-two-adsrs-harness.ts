import type {
  IVoiceDefinition,
} from "@monorepo/music-core-synthesizer-voice-contracts";

import { AdsrEnvelopeDefinitionTestFactory } from "./support/AdsrEnvelopeDefinitionTestFactory.js";
import { BasicOscillatorDefinitionFactory } from "./support/BasicOscillatorDefinitionFactory.js";
import { BrowserElementResolver } from "./support/BrowserElementResolver.js";
import { BrowserLayeredAdsrVoicePlayer } from "./support/BrowserLayeredAdsrVoicePlayer.js";
import { PlaybackState, type PlaybackStateValue } from "./support/PlaybackState.js";
import { VoiceDefinitionFlattener } from "./support/VoiceDefinitionFlattener.js";

const BrowserElementId = {
  PlayVoice: "play-voice",
  VoiceState: "voice-state",
  VoiceLayerCount: "voice-layer-count",
  VoiceOscillatorCount: "voice-oscillator-count",
  VoiceEnvelopeCount: "voice-envelope-count",
  VoiceFrequencies: "voice-frequencies",
  VoiceEnvelopeReleases: "voice-envelope-releases",
  VoiceElapsedMilliseconds: "voice-elapsed-ms",
  VoiceError: "voice-error",
} as const;

const TestAudio = {
  NoteDurationSeconds: 1.2,
  MaximumGainPerOscillator: 0.04,
} as const;

const VoiceFrequencyHz = {
  Oscillator1: 261.63,
  Oscillator2: 392,
} as const;

class TwoOscTwoAdsrsCompositionRoot {
  public static create(): TwoOscTwoAdsrsApplication {
    const definition = TwoOscTwoAdsrsVoiceDefinitionFactory.create();

    return new TwoOscTwoAdsrsApplication(
      definition,
      BrowserElementResolver.getRequiredElement<HTMLButtonElement>(
        BrowserElementId.PlayVoice,
      ),
      new BrowserTwoOscTwoAdsrsPresenter(
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceState,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceLayerCount,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceOscillatorCount,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceEnvelopeCount,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceFrequencies,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceEnvelopeReleases,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceElapsedMilliseconds,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceError,
        ),
      ),
      new BrowserLayeredAdsrVoicePlayer(performance),
    );
  }
}

class TwoOscTwoAdsrsApplication {
  private isPlaying = false;

  public constructor(
    private readonly definition: IVoiceDefinition,
    private readonly playButton: HTMLButtonElement,
    private readonly presenter: IVoicePresenter,
    private readonly player: BrowserLayeredAdsrVoicePlayer,
  ) {}

  public async start(): Promise<void> {
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
        definition: this.definition,
        noteDurationSeconds: TestAudio.NoteDurationSeconds,
        maximumGainPerOscillator: TestAudio.MaximumGainPerOscillator,
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

class TwoOscTwoAdsrsVoiceDefinitionFactory {
  public static create(): IVoiceDefinition {
    return {
      id: "two-osc-two-adsrs-voice",
      outputGain: 1,
      layers: [
        {
          id: "oscillator-1-layer",
          enabled: true,
          gain: 1,
          oscillators: [
            BasicOscillatorDefinitionFactory.create({
              frequencyHz: VoiceFrequencyHz.Oscillator1,
            }),
          ],
          envelope: AdsrEnvelopeDefinitionTestFactory.createFast(),
        },
        {
          id: "oscillator-2-layer",
          enabled: true,
          gain: 1,
          oscillators: [
            BasicOscillatorDefinitionFactory.create({
              frequencyHz: VoiceFrequencyHz.Oscillator2,
            }),
          ],
          envelope: AdsrEnvelopeDefinitionTestFactory.createSlow(),
        },
      ],
    };
  }
}

interface IVoicePresenter {
  presentDefinition(definition: IVoiceDefinition): void;
  presentState(state: PlaybackStateValue): void;
  presentElapsedMilliseconds(elapsedMilliseconds: number): void;
  presentError(error: string | null): void;
}

class BrowserTwoOscTwoAdsrsPresenter implements IVoicePresenter {
  public constructor(
    private readonly stateOutput: HTMLOutputElement,
    private readonly layerCountOutput: HTMLOutputElement,
    private readonly oscillatorCountOutput: HTMLOutputElement,
    private readonly envelopeCountOutput: HTMLOutputElement,
    private readonly frequenciesOutput: HTMLOutputElement,
    private readonly envelopeReleasesOutput: HTMLOutputElement,
    private readonly elapsedOutput: HTMLOutputElement,
    private readonly errorOutput: HTMLOutputElement,
  ) {}

  public presentDefinition(definition: IVoiceDefinition): void {
    const oscillators = VoiceDefinitionFlattener.getBasicOscillators(definition);

    this.layerCountOutput.value = String(definition.layers.length);
    this.oscillatorCountOutput.value = String(oscillators.length);
    this.envelopeCountOutput.value = String(definition.layers.length);

    this.frequenciesOutput.value = oscillators
      .map((oscillator) => String(oscillator.frequencyHz))
      .join(",");

    this.envelopeReleasesOutput.value = definition.layers
      .map((layer) => {
        if ("releaseSeconds" in layer.envelope) {
          return String(layer.envelope.releaseSeconds);
        }

        return "0";
      })
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

const application = TwoOscTwoAdsrsCompositionRoot.create();
await application.start();
