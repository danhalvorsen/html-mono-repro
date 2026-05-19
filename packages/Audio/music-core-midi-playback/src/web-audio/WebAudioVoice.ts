import type { VoiceKey } from "../value-objects/VoiceKey.js";
import type {
  IAmpEnvelopeScheduler,
} from "./AmpEnvelopeScheduler.js";
import type {
  IFilterEnvelopeScheduler,
} from "./FilterEnvelopeScheduler.js";
import type { IVoice } from "./IVoice.js";

export type WebAudioVoiceArgs = {
  readonly key: VoiceKey;
  readonly oscillators: readonly OscillatorNode[];
  readonly nodesToDisconnect: readonly AudioNode[];
  readonly amp: GainNode;
  readonly filter: BiquadFilterNode;
  readonly ampEnvelopeScheduler: IAmpEnvelopeScheduler;
  readonly filterEnvelopeScheduler: IFilterEnvelopeScheduler;
  readonly releaseSeconds: number;
  readonly filterBaseFrequency: number;
  readonly filterSustainFrequency: number;
  readonly filterReleaseSeconds: number;
};

export class WebAudioVoice implements IVoice {
  public readonly key: VoiceKey;

  private readonly oscillators: readonly OscillatorNode[];
  private readonly nodesToDisconnect: readonly AudioNode[];
  private readonly amp: GainNode;
  private readonly filter: BiquadFilterNode;
  private readonly ampEnvelopeScheduler: IAmpEnvelopeScheduler;
  private readonly filterEnvelopeScheduler: IFilterEnvelopeScheduler;
  private readonly releaseSeconds: number;
  private readonly filterBaseFrequency: number;
  private readonly filterSustainFrequency: number;
  private readonly filterReleaseSeconds: number;

  private released = false;
  private cleanedUp = false;

  public constructor(args: WebAudioVoiceArgs) {
    this.key = args.key;
    this.oscillators = args.oscillators;
    this.nodesToDisconnect = args.nodesToDisconnect;
    this.amp = args.amp;
    this.filter = args.filter;
    this.ampEnvelopeScheduler = args.ampEnvelopeScheduler;
    this.filterEnvelopeScheduler = args.filterEnvelopeScheduler;
    this.releaseSeconds = args.releaseSeconds;
    this.filterBaseFrequency = args.filterBaseFrequency;
    this.filterSustainFrequency = args.filterSustainFrequency;
    this.filterReleaseSeconds = args.filterReleaseSeconds;
  }

  public get isReleased(): boolean {
    return this.released;
  }

  public release(releaseAtSeconds: number): void {
    if (this.released) {
      return;
    }

    this.released = true;

    this.ampEnvelopeScheduler.scheduleRelease(this.amp.gain, {
      releaseStartSeconds: releaseAtSeconds,
      releaseSeconds: this.releaseSeconds,
    });

    this.filterEnvelopeScheduler.scheduleRelease(this.filter.frequency, {
      releaseStartSeconds: releaseAtSeconds,
      filterBaseFrequency: this.filterBaseFrequency,
      filterSustainFrequency: this.filterSustainFrequency,
      releaseSeconds: this.filterReleaseSeconds,
    });

    const stopAtSeconds =
      releaseAtSeconds + Math.max(this.releaseSeconds, this.filterReleaseSeconds);

    for (const oscillator of this.oscillators) {
      oscillator.onended = this.cleanup;
      this.stopOscillator(oscillator, stopAtSeconds);
    }
  }

  public stopImmediately(stopAtSeconds: number): void {
    if (!this.released) {
      this.release(stopAtSeconds);
    }

    for (const oscillator of this.oscillators) {
      this.stopOscillator(oscillator, stopAtSeconds);
    }

    this.cleanup();
  }

  private readonly cleanup = (): void => {
    if (this.cleanedUp) {
      return;
    }

    this.cleanedUp = true;

    for (const node of this.nodesToDisconnect) {
      try {
        node.disconnect();
      } catch {
        // Node may already be disconnected. Cleanup must be idempotent.
      }
    }
  };

  private stopOscillator(oscillator: OscillatorNode, stopAtSeconds: number): void {
    try {
      oscillator.stop(stopAtSeconds);
    } catch {
      // Already stopped or already scheduled to stop.
    }
  }
}
