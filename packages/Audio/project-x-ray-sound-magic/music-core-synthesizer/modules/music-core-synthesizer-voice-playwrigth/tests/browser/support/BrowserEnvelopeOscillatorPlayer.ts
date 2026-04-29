import type {
  EnvelopeDefinition,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";

import {
  WebAudioEnvelopeGainGraphFactory,
  type IWebAudioConnectable,
  type IWebAudioContextLike,
} from "@monorepo/music-core-synthesizer-envelopes-web-audio";

import type {
  IBasicOscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import { OscillatorTypeMapper } from "./OscillatorTypeMapper.js";

export interface IEnvelopeOscillatorPlayRequest {
  readonly oscillator: IBasicOscillatorDefinition;
  readonly envelope: EnvelopeDefinition;
  readonly noteDurationSeconds: number;
  readonly maximumGain: number;
}

export interface IEnvelopeOscillatorPlayResult {
  readonly elapsedMilliseconds: number;
}

export class BrowserEnvelopeOscillatorPlayer {
  public constructor(
    private readonly performanceClock: Performance,
  ) {}

  public async play(
    request: IEnvelopeOscillatorPlayRequest,
  ): Promise<IEnvelopeOscillatorPlayResult> {
    const AudioContextConstructor = this.resolveAudioContextConstructor();
    const audioContext = new AudioContextConstructor();

    await audioContext.resume();

    return new Promise<IEnvelopeOscillatorPlayResult>((resolve, reject) => {
      const nodes: AudioNode[] = [];

      try {
        const startTimeSeconds = audioContext.currentTime;
        const gateOffTimeSeconds = startTimeSeconds + request.noteDurationSeconds;
        const stopTimeSeconds =
          gateOffTimeSeconds + EnvelopeReleaseSecondsResolver.resolve(request.envelope) + 0.05;

        const oscillator = audioContext.createOscillator();
        const outputGain = audioContext.createGain();

        const envelopeGraph = WebAudioEnvelopeGainGraphFactory
          .createDefault(audioContext as unknown as IWebAudioContextLike)
          .create(request.envelope);

        const startedAtMilliseconds = this.performanceClock.now();

        oscillator.type = OscillatorTypeMapper.map(request.oscillator.waveform);
        oscillator.frequency.setValueAtTime(
          request.oscillator.frequencyHz,
          startTimeSeconds,
        );
        oscillator.detune.setValueAtTime(
          request.oscillator.detuneCents,
          startTimeSeconds,
        );

        outputGain.gain.setValueAtTime(
          Math.min(request.oscillator.gain, request.maximumGain),
          startTimeSeconds,
        );

        oscillator.connect(envelopeGraph.inputNode as unknown as AudioNode);
        envelopeGraph.connect(outputGain as unknown as IWebAudioConnectable);
        outputGain.connect(audioContext.destination);

        nodes.push(oscillator, outputGain);

        envelopeGraph.gateOn({
          timeSeconds: startTimeSeconds,
          velocity: 1,
        });

        envelopeGraph.gateOff({
          timeSeconds: gateOffTimeSeconds,
        });

        oscillator.onended = () => {
          oscillator.disconnect();
          envelopeGraph.disconnect();

          for (const node of nodes) {
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
      } catch (error) {
        for (const node of nodes) {
          node.disconnect();
        }

        void audioContext.close();
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  private resolveAudioContextConstructor(): typeof AudioContext {
    if (globalThis.AudioContext === undefined) {
      throw new Error("AudioContext is not available.");
    }

    return globalThis.AudioContext;
  }
}

export class EnvelopeReleaseSecondsResolver {
  public static resolve(envelope: EnvelopeDefinition): number {
    if ("releaseSeconds" in envelope) {
      return envelope.releaseSeconds;
    }

    return 0;
  }
}
