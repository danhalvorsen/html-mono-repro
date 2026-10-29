import type { EnvelopeDefinition } from "@monorepo/music-core-synthesizer-envelopes-contracts";
import { EnvelopeKind } from "@monorepo/music-core-synthesizer-envelopes-contracts";
import type {
  IWebAudioConnectable as IEnvelopeWebAudioConnectable,
  IWebAudioEnvelopeGainGraph,
  IWebAudioEnvelopeGainGraphFactory,
} from "@monorepo/music-core-synthesizer-envelopes-web-audio";
import type {
  IWebAudioConnectable as IOscillatorWebAudioConnectable,
  IWebAudioOscillatorGraph,
  IWebAudioOscillatorGraphFactory,
} from "@monorepo/music-core-synthesizer-oscillators-web-audio";
import type {
  IVoiceDefinition,
  IVoiceDefinitionValidator,
  IVoiceGateOffRequest,
  IVoiceGateOnRequest,
} from "@monorepo/music-core-synthesizer-voice-contracts";

export interface IWebAudioVoiceContextLike {
  readonly currentTime: number;

  createGain(): GainNode;
}

export interface IWebAudioVoiceCreateRequest {
  readonly definition: IVoiceDefinition;
  readonly destination: AudioNode;
}

export interface IWebAudioVoice {
  gateOn(request: IVoiceGateOnRequest): void;

  gateOff(request: IVoiceGateOffRequest): void;

  dispose(): void;
}

export interface IWebAudioVoiceFactory {
  create(request: IWebAudioVoiceCreateRequest): IWebAudioVoice;
}

interface IWebAudioVoiceLayer {
  readonly oscillatorGraphs: readonly IWebAudioOscillatorGraph[];
  readonly envelopeGraph: IWebAudioEnvelopeGainGraph;
  readonly layerGainNode: GainNode;
  readonly envelope: EnvelopeDefinition;
}

export class WebAudioVoiceFactory implements IWebAudioVoiceFactory {
  public constructor(
    private readonly context: IWebAudioVoiceContextLike,
    private readonly oscillatorGraphFactory: IWebAudioOscillatorGraphFactory,
    private readonly envelopeGraphFactory: IWebAudioEnvelopeGainGraphFactory,
    private readonly definitionValidator: IVoiceDefinitionValidator,
  ) {}

  public create(request: IWebAudioVoiceCreateRequest): IWebAudioVoice {
    this.definitionValidator.validate(request.definition);

    const outputGainNode = this.context.createGain();
    outputGainNode.gain.setValueAtTime(
      request.definition.outputGain,
      this.context.currentTime,
    );
    outputGainNode.connect(request.destination);

    const layers = request.definition.layers
      .filter((layer) => layer.enabled)
      .map((layer): IWebAudioVoiceLayer => {
        const oscillatorGraphs = layer.oscillators.map((oscillator) =>
          this.oscillatorGraphFactory.create(oscillator),
        );
        const envelopeGraph = this.envelopeGraphFactory.create(layer.envelope);
        const layerGainNode = this.context.createGain();

        layerGainNode.gain.setValueAtTime(layer.gain, this.context.currentTime);

        for (const oscillatorGraph of oscillatorGraphs) {
          oscillatorGraph.connect(
            envelopeGraph.inputNode as unknown as IOscillatorWebAudioConnectable,
          );
        }

        envelopeGraph.connect(
          layerGainNode as unknown as IEnvelopeWebAudioConnectable,
        );

        layerGainNode.connect(outputGainNode);

        return {
          oscillatorGraphs,
          envelopeGraph,
          layerGainNode,
          envelope: layer.envelope,
        };
      });

    return new WebAudioVoice(this.context, layers, outputGainNode);
  }
}

class WebAudioVoice implements IWebAudioVoice {
  private disposeTimer: ReturnType<typeof globalThis.setTimeout> | null = null;
  private isDisposed = false;
  private isGateOpen = false;

  public constructor(
    private readonly context: IWebAudioVoiceContextLike,
    private readonly layers: readonly IWebAudioVoiceLayer[],
    private readonly outputGainNode: GainNode,
  ) {}

  public gateOn(request: IVoiceGateOnRequest): void {
    this.throwIfDisposed();
    this.clearDisposeTimer();

    this.assertTime(request.timeSeconds);
    this.assertFrequency(request.frequencyHz);
    this.assertVelocity(request.velocity);

    for (const layer of this.layers) {
      layer.envelopeGraph.gateOn({
        timeSeconds: request.timeSeconds,
        velocity: request.velocity,
      });

      for (const oscillatorGraph of layer.oscillatorGraphs) {
        oscillatorGraph.noteOn({
          timeSeconds: request.timeSeconds,
          frequencyHz: request.frequencyHz,
          velocity: 1,
        });
      }
    }

    this.isGateOpen = true;
  }

  public gateOff(request: IVoiceGateOffRequest): void {
    if (this.isDisposed || !this.isGateOpen) {
      return;
    }

    this.assertTime(request.timeSeconds);

    let latestStopTimeSeconds = request.timeSeconds;

    for (const layer of this.layers) {
      layer.envelopeGraph.gateOff({
        timeSeconds: request.timeSeconds,
      });

      const stopTimeSeconds =
        request.timeSeconds + EnvelopeReleaseSeconds.resolve(layer.envelope) + 0.02;

      for (const oscillatorGraph of layer.oscillatorGraphs) {
        oscillatorGraph.noteOff({
          timeSeconds: stopTimeSeconds,
        });
      }

      latestStopTimeSeconds = Math.max(latestStopTimeSeconds, stopTimeSeconds);
    }

    this.isGateOpen = false;
    this.scheduleDispose(latestStopTimeSeconds);
  }

  public dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.clearDisposeTimer();
    this.isDisposed = true;

    for (const layer of this.layers) {
      for (const oscillatorGraph of layer.oscillatorGraphs) {
        oscillatorGraph.disconnect();
      }
      layer.envelopeGraph.disconnect();
      layer.layerGainNode.disconnect();
    }

    this.outputGainNode.disconnect();
  }

  private scheduleDispose(stopTimeSeconds: number): void {
    const delayMilliseconds = Math.max(
      0,
      Math.ceil((stopTimeSeconds - this.context.currentTime) * 1000),
    );

    this.disposeTimer = globalThis.setTimeout(
      () => this.dispose(),
      delayMilliseconds + 20,
    );
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
