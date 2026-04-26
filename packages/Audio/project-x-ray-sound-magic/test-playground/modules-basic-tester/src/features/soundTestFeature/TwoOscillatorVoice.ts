// FILE: src/features/soundTestFeature/TwoOscillatorVoice.ts

import type { EnvelopeDefinition } from "@monorepo/music-core-synthesizer-envelopes-contracts";
import { EnvelopeKind } from "@monorepo/music-core-synthesizer-envelopes-contracts";
import type {
  IWebAudioConnectable as IEnvelopeWebAudioConnectable,
  IWebAudioEnvelopeGainGraph,
  IWebAudioEnvelopeGainGraphFactory,
} from "@monorepo/music-core-synthesizer-envelopes-web-audio";
import type { OscillatorDefinition } from "@monorepo/music-core-synthesizer-oscillators-contracts";
import type {
  IWebAudioConnectable as IOscillatorWebAudioConnectable,
  IWebAudioOscillatorGraph,
  IWebAudioOscillatorGraphFactory,
} from "@monorepo/music-core-synthesizer-oscillators-web-audio";

export interface IOscillatorVoiceSlotDefinition {
  readonly enabled: boolean;
  readonly definition: OscillatorDefinition;
}

export interface ITwoOscillatorVoiceDefinition {
  readonly oscillators: readonly [
    IOscillatorVoiceSlotDefinition,
    IOscillatorVoiceSlotDefinition,
  ];
  readonly envelope: EnvelopeDefinition;
  readonly outputGain: number;
}

export interface INoteGateOnRequest {
  readonly timeSeconds: number;
  readonly frequencyHz: number;
  readonly velocity: number;
}

export interface INoteGateOffRequest {
  readonly timeSeconds: number;
}

export interface ITwoOscillatorVoice {
  gateOn(request: INoteGateOnRequest): void;
  gateOff(request: INoteGateOffRequest): void;
  dispose(): void;
}

export interface ITwoOscillatorVoiceDefinitionValidator {
  validate(definition: ITwoOscillatorVoiceDefinition): void;
}

export interface ITwoOscillatorVoiceCreateRequest {
  readonly definition: ITwoOscillatorVoiceDefinition;
  readonly destination: AudioNode;
}

export interface ITwoOscillatorVoiceFactory {
  create(request: ITwoOscillatorVoiceCreateRequest): ITwoOscillatorVoice;
}

export class TwoOscillatorVoiceDefinitionValidator
  implements ITwoOscillatorVoiceDefinitionValidator {
  public validate(definition: ITwoOscillatorVoiceDefinition): void {
    if (definition.oscillators.length !== 2) {
      throw new Error("Two oscillator voice requires exactly two oscillator slots.");
    }

    if (!Number.isFinite(definition.outputGain) || definition.outputGain < 0 || definition.outputGain > 1) {
      throw new Error(`outputGain must be between 0 and 1. Actual value: ${String(definition.outputGain)}.`);
    }
  }
}

export class TwoOscillatorVoiceFactory implements ITwoOscillatorVoiceFactory {
  public constructor(
    private readonly context: AudioContext,
    private readonly oscillatorGraphFactory: IWebAudioOscillatorGraphFactory,
    private readonly envelopeGraphFactory: IWebAudioEnvelopeGainGraphFactory,
    private readonly definitionValidator: ITwoOscillatorVoiceDefinitionValidator,
  ) {}

  public create(request: ITwoOscillatorVoiceCreateRequest): ITwoOscillatorVoice {
    this.definitionValidator.validate(request.definition);

    const oscillatorGraphs: readonly IWebAudioOscillatorGraph[] =
      request.definition.oscillators
        .filter((slot) => slot.enabled)
        .map((slot) => this.oscillatorGraphFactory.create(slot.definition));

    const envelopeGraph = this.envelopeGraphFactory.create(request.definition.envelope);

    return new TwoOscillatorVoice(
      this.context,
      oscillatorGraphs,
      envelopeGraph,
      request.definition,
      request.destination,
    );
  }
}

class TwoOscillatorVoice implements ITwoOscillatorVoice {
  private readonly mixerNode: GainNode;
  private readonly outputGainNode: GainNode;

  private disposeTimer: ReturnType<typeof globalThis.setTimeout> | null = null;
  private isDisposed = false;
  private isGateOpen = false;

  public constructor(
    private readonly context: AudioContext,
    private readonly oscillatorGraphs: readonly IWebAudioOscillatorGraph[],
    private readonly envelopeGraph: IWebAudioEnvelopeGainGraph,
    private readonly definition: ITwoOscillatorVoiceDefinition,
    destination: AudioNode,
  ) {
    this.mixerNode = this.context.createGain();
    this.outputGainNode = this.context.createGain();

    this.mixerNode.gain.setValueAtTime(1, this.context.currentTime);
    this.outputGainNode.gain.setValueAtTime(definition.outputGain, this.context.currentTime);

    for (const oscillatorGraph of this.oscillatorGraphs) {
      oscillatorGraph.connect(this.mixerNode as unknown as IOscillatorWebAudioConnectable);
    }

    this.mixerNode.connect(this.envelopeGraph.inputNode as unknown as AudioNode);
    this.envelopeGraph.connect(this.outputGainNode as unknown as IEnvelopeWebAudioConnectable);
    this.outputGainNode.connect(destination);
  }

  public gateOn(request: INoteGateOnRequest): void {
    this.throwIfDisposed();
    this.clearDisposeTimer();

    this.assertTime(request.timeSeconds);
    this.assertFrequency(request.frequencyHz);
    this.assertVelocity(request.velocity);

    this.envelopeGraph.gateOn({
      timeSeconds: request.timeSeconds,
      velocity: request.velocity,
    });

    for (const oscillatorGraph of this.oscillatorGraphs) {
      oscillatorGraph.noteOn({
        timeSeconds: request.timeSeconds,
        frequencyHz: request.frequencyHz,
        velocity: 1,
      });
    }

    this.isGateOpen = true;
  }

  public gateOff(request: INoteGateOffRequest): void {
    if (this.isDisposed || !this.isGateOpen) {
      return;
    }

    this.assertTime(request.timeSeconds);

    this.envelopeGraph.gateOff({
      timeSeconds: request.timeSeconds,
    });

    const stopTimeSeconds =
      request.timeSeconds + EnvelopeReleaseSeconds.resolve(this.definition.envelope) + 0.02;

    for (const oscillatorGraph of this.oscillatorGraphs) {
      oscillatorGraph.noteOff({
        timeSeconds: stopTimeSeconds,
      });
    }

    this.isGateOpen = false;
    this.scheduleDispose(stopTimeSeconds);
  }

  public dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.clearDisposeTimer();
    this.isDisposed = true;

    for (const oscillatorGraph of this.oscillatorGraphs) {
      oscillatorGraph.disconnect();
    }

    this.mixerNode.disconnect();
    this.envelopeGraph.disconnect();
    this.outputGainNode.disconnect();
  }

  private scheduleDispose(stopTimeSeconds: number): void {
    const delayMilliseconds = Math.max(
      0,
      Math.ceil((stopTimeSeconds - this.context.currentTime) * 1000),
    );

    this.disposeTimer = globalThis.setTimeout(() => this.dispose(), delayMilliseconds + 20);
  }

  private clearDisposeTimer(): void {
    if (this.disposeTimer === null) {
      return;
    }

    globalThis.clearTimeout(this.disposeTimer);
    this.disposeTimer = null;
  }

  private throwIfDisposed(): void {
    if (this.isDisposed) {
      throw new Error("Voice has already been disposed.");
    }
  }

  private assertTime(value: number): void {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`timeSeconds must be finite and >= 0. Actual value: ${String(value)}.`);
    }
  }

  private assertFrequency(value: number): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`frequencyHz must be finite and > 0. Actual value: ${String(value)}.`);
    }
  }

  private assertVelocity(value: number): void {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(`velocity must be between 0 and 1. Actual value: ${String(value)}.`);
    }
  }
}

class EnvelopeReleaseSeconds {
  public static resolve(definition: EnvelopeDefinition): number {
    switch (definition.kind) {
      case EnvelopeKind.Adsr:
      case EnvelopeKind.Ahdsr:
      case EnvelopeKind.Ar:
      case EnvelopeKind.Asr:
        return definition.releaseSeconds;

      case EnvelopeKind.OneShot:
        return 0;
    }
  }
}