import type {
  IBasicOscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import { OscillatorTypeMapper } from "./OscillatorTypeMapper.js";

export interface IOscillatorPlayer {
  play(request: IOscillatorPlayRequest): Promise<IOscillatorPlayResult>;
}

export interface IOscillatorPlayRequest {
  readonly oscillators: readonly IBasicOscillatorDefinition[];
  readonly durationSeconds: number;
  readonly outputGain: number;
  readonly maximumGainPerOscillator: number;
}

export interface IOscillatorPlayResult {
  readonly elapsedMilliseconds: number;
}

export class BrowserAudioOscillatorPlayer implements IOscillatorPlayer {
  public constructor(
    private readonly performanceClock: Performance,
  ) {}

  public async play(
    request: IOscillatorPlayRequest,
  ): Promise<IOscillatorPlayResult> {
    if (request.oscillators.length === 0) {
      throw new Error("At least one oscillator is required.");
    }

    const AudioContextConstructor = this.resolveAudioContextConstructor();
    const audioContext = new AudioContextConstructor();

    await audioContext.resume();

    return new Promise<IOscillatorPlayResult>((resolve, reject) => {
      const nodes: AudioNode[] = [];

      try {
        const outputGain = audioContext.createGain();
        outputGain.gain.setValueAtTime(
          request.outputGain,
          audioContext.currentTime,
        );
        outputGain.connect(audioContext.destination);
        nodes.push(outputGain);

        const startedAtMilliseconds = this.performanceClock.now();
        const startTimeSeconds = audioContext.currentTime;
        const stopTimeSeconds = startTimeSeconds + request.durationSeconds;

        let remainingOscillators = request.oscillators.length;

        for (const definition of request.oscillators) {
          const oscillator = audioContext.createOscillator();
          const gain = audioContext.createGain();

          oscillator.type = OscillatorTypeMapper.map(definition.waveform);
          oscillator.frequency.setValueAtTime(
            definition.frequencyHz,
            startTimeSeconds,
          );
          oscillator.detune.setValueAtTime(
            definition.detuneCents,
            startTimeSeconds,
          );

          gain.gain.setValueAtTime(
            Math.min(definition.gain, request.maximumGainPerOscillator),
            startTimeSeconds,
          );

          oscillator.connect(gain);
          gain.connect(outputGain);

          nodes.push(oscillator, gain);

          oscillator.onended = () => {
            remainingOscillators -= 1;

            if (remainingOscillators > 0) {
              return;
            }

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
        }
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
