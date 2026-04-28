import type {
  EnvelopeDefinition,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";

import {
  WebAudioEnvelopeGainGraphFactory,
  type IWebAudioConnectable,
  type IWebAudioContextLike,
  type IWebAudioEnvelopeGainGraph,
} from "../../../../music-core-synthesizer-envelopes-web-audio/src/index.js";

import type {
  IBasicOscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import type {
  IVoiceDefinition,
  IVoiceLayerDefinition,
} from "@monorepo/music-core-synthesizer-voice-contracts";

import { BasicOscillatorDefinitionGuard } from "./BasicOscillatorDefinitionGuard.js";
import { OscillatorTypeMapper } from "./OscillatorTypeMapper.js";

export interface ILayeredAdsrVoicePlayer {
  play(request: ILayeredAdsrVoicePlayRequest): Promise<ILayeredAdsrVoicePlayResult>;
}

export interface ILayeredAdsrVoicePlayRequest {
  readonly definition: IVoiceDefinition;
  readonly noteDurationSeconds: number;
  readonly maximumGainPerOscillator: number;
}

export interface ILayeredAdsrVoicePlayResult {
  readonly elapsedMilliseconds: number;
}

export class BrowserLayeredAdsrVoicePlayer implements ILayeredAdsrVoicePlayer {
  public constructor(
    private readonly performanceClock: Performance,
  ) {}

  public async play(
    request: ILayeredAdsrVoicePlayRequest,
  ): Promise<ILayeredAdsrVoicePlayResult> {
    const AudioContextConstructor = this.resolveAudioContextConstructor();
    const audioContext = new AudioContextConstructor();

    await audioContext.resume();

    return new Promise<ILayeredAdsrVoicePlayResult>((resolve, reject) => {
      const audioNodes: AudioNode[] = [];
      const envelopeGraphs: IWebAudioEnvelopeGainGraph[] = [];

      try {
        const enabledLayers = request.definition.layers.filter((layer) => layer.enabled);

        if (enabledLayers.length === 0) {
          throw new Error("At least one enabled voice layer is required.");
        }

        const startTimeSeconds = audioContext.currentTime;
        const gateOffTimeSeconds = startTimeSeconds + request.noteDurationSeconds;
        const stopTimeSeconds =
          gateOffTimeSeconds + VoiceEnvelopeReleaseSeconds.resolveMax(enabledLayers) + 0.05;

        const outputGain = audioContext.createGain();
        outputGain.gain.setValueAtTime(
          request.definition.outputGain,
          startTimeSeconds,
        );
        outputGain.connect(audioContext.destination);
        audioNodes.push(outputGain);

        const startedAtMilliseconds = this.performanceClock.now();
        const oscillatorNodes = this.createLayerGraphs({
          audioContext,
          enabledLayers,
          outputGain,
          startTimeSeconds,
          gateOffTimeSeconds,
          stopTimeSeconds,
          maximumGainPerOscillator: request.maximumGainPerOscillator,
          audioNodes,
          envelopeGraphs,
        });

        let remainingOscillators = oscillatorNodes.length;

        for (const oscillator of oscillatorNodes) {
          oscillator.onended = () => {
            remainingOscillators -= 1;

            if (remainingOscillators > 0) {
              return;
            }

            for (const envelopeGraph of envelopeGraphs) {
              envelopeGraph.disconnect();
            }

            for (const node of audioNodes) {
              node.disconnect();
            }

            const elapsedMilliseconds = Math.round(
              this.performanceClock.now() - startedAtMilliseconds,
            );

            void audioContext.close();

            resolve({ elapsedMilliseconds });
          };

          oscillator.start(startTimeSeconds);
          oscillator.stop(stopTimeSeconds);
        }
      } catch (error) {
        for (const envelopeGraph of envelopeGraphs) {
          envelopeGraph.disconnect();
        }

        for (const node of audioNodes) {
          node.disconnect();
        }

        void audioContext.close();

        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  private createLayerGraphs(request: {
    readonly audioContext: AudioContext;
    readonly enabledLayers: readonly IVoiceLayerDefinition[];
    readonly outputGain: GainNode;
    readonly startTimeSeconds: number;
    readonly gateOffTimeSeconds: number;
    readonly stopTimeSeconds: number;
    readonly maximumGainPerOscillator: number;
    readonly audioNodes: AudioNode[];
    readonly envelopeGraphs: IWebAudioEnvelopeGainGraph[];
  }): readonly OscillatorNode[] {
    const oscillatorNodes: OscillatorNode[] = [];
    const envelopeGraphFactory = WebAudioEnvelopeGainGraphFactory.createDefault(
      request.audioContext as unknown as IWebAudioContextLike,
    );

    for (const layer of request.enabledLayers) {
      const envelopeGraph = envelopeGraphFactory.create(layer.envelope);
      const layerGain = request.audioContext.createGain();

      layerGain.gain.setValueAtTime(layer.gain, request.startTimeSeconds);

      envelopeGraph.connect(layerGain as unknown as IWebAudioConnectable);
      layerGain.connect(request.outputGain);

      request.envelopeGraphs.push(envelopeGraph);
      request.audioNodes.push(layerGain);

      envelopeGraph.gateOn({
        timeSeconds: request.startTimeSeconds,
        velocity: 1,
      });

      envelopeGraph.gateOff({
        timeSeconds: request.gateOffTimeSeconds,
      });

      for (const oscillatorDefinition of layer.oscillators) {
        const basicOscillator = BasicOscillatorDefinitionGuard.require(oscillatorDefinition);

        const oscillator = this.createOscillatorNode({
          audioContext: request.audioContext,
          definition: basicOscillator,
          startTimeSeconds: request.startTimeSeconds,
          maximumGainPerOscillator: request.maximumGainPerOscillator,
          envelopeGraph,
          audioNodes: request.audioNodes,
        });

        oscillatorNodes.push(oscillator);
      }
    }

    return oscillatorNodes;
  }

  private createOscillatorNode(request: {
    readonly audioContext: AudioContext;
    readonly definition: IBasicOscillatorDefinition;
    readonly startTimeSeconds: number;
    readonly maximumGainPerOscillator: number;
    readonly envelopeGraph: IWebAudioEnvelopeGainGraph;
    readonly audioNodes: AudioNode[];
  }): OscillatorNode {
    const oscillator = request.audioContext.createOscillator();
    const oscillatorGain = request.audioContext.createGain();

    oscillator.type = OscillatorTypeMapper.map(request.definition.waveform);
    oscillator.frequency.setValueAtTime(
      request.definition.frequencyHz,
      request.startTimeSeconds,
    );
    oscillator.detune.setValueAtTime(
      request.definition.detuneCents,
      request.startTimeSeconds,
    );

    oscillatorGain.gain.setValueAtTime(
      Math.min(request.definition.gain, request.maximumGainPerOscillator),
      request.startTimeSeconds,
    );

    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(request.envelopeGraph.inputNode as unknown as AudioNode);

    request.audioNodes.push(oscillator, oscillatorGain);

    return oscillator;
  }

  private resolveAudioContextConstructor(): typeof AudioContext {
    if (globalThis.AudioContext === undefined) {
      throw new Error("AudioContext is not available.");
    }

    return globalThis.AudioContext;
  }
}

class VoiceEnvelopeReleaseSeconds {
  public static resolveMax(layers: readonly IVoiceLayerDefinition[]): number {
    return Math.max(
      ...layers.map((layer) => VoiceEnvelopeReleaseSeconds.resolve(layer.envelope)),
    );
  }

  private static resolve(envelope: EnvelopeDefinition): number {
    if ("releaseSeconds" in envelope) {
      return envelope.releaseSeconds;
    }

    return 0;
  }
}
