export const AudibleAudioDefaults = {
  DurationMilliseconds: 5_000,
  OutputGain: 0.22,
  PerOscillatorGain: 0.14,
} as const;

export const AudibleVoiceState = {
  NotCreated: "not-created",
  Idle: "idle",
  Active: "active",
  Released: "released",
  Playing: "playing",
  Stopped: "stopped",
} as const;

export type AudibleVoiceStateValue =
  (typeof AudibleVoiceState)[keyof typeof AudibleVoiceState];

export interface IAudibleOscillatorDefinition {
  readonly id: string;
  readonly frequencyHz: number;
  readonly gain: number;
}

export interface IAudibleVoiceDefinition {
  readonly id: string;
  readonly outputGain: number;
  readonly oscillators: readonly IAudibleOscillatorDefinition[];
}

export interface IAudibleVoicePlayRequest {
  readonly voices: readonly IAudibleVoiceDefinition[];
  readonly durationMilliseconds: number;
}

export interface IAudibleVoicePlayResult {
  readonly elapsedMilliseconds: number;
}

export interface IAudibleVoicePlayer {
  play(request: IAudibleVoicePlayRequest): Promise<IAudibleVoicePlayResult>;
}

export class BrowserAudibleVoicePlayer implements IAudibleVoicePlayer {
  public constructor(
    private readonly performanceClock: Performance,
  ) {}

  public async play(
    request: IAudibleVoicePlayRequest,
  ): Promise<IAudibleVoicePlayResult> {
    this.assertRequest(request);

    const AudioContextConstructor = this.resolveAudioContextConstructor();
    const audioContext = new AudioContextConstructor();

    await audioContext.resume();

    return new Promise<IAudibleVoicePlayResult>((resolve, reject) => {
      const nodes: AudioNode[] = [];

      try {
        const startedAtMilliseconds = this.performanceClock.now();
        const startTimeSeconds = audioContext.currentTime;
        const stopTimeSeconds =
          startTimeSeconds + request.durationMilliseconds / 1_000;

        let remainingOscillators = this.countOscillators(request.voices);

        for (const voice of request.voices) {
          const voiceGain = audioContext.createGain();

          voiceGain.gain.setValueAtTime(
            voice.outputGain,
            startTimeSeconds,
          );

          voiceGain.connect(audioContext.destination);
          nodes.push(voiceGain);

          for (const oscillatorDefinition of voice.oscillators) {
            const oscillator = audioContext.createOscillator();
            const oscillatorGain = audioContext.createGain();

            oscillator.type = "sine";

            oscillator.frequency.setValueAtTime(
              oscillatorDefinition.frequencyHz,
              startTimeSeconds,
            );

            oscillatorGain.gain.setValueAtTime(
              oscillatorDefinition.gain,
              startTimeSeconds,
            );

            oscillator.connect(oscillatorGain);
            oscillatorGain.connect(voiceGain);

            nodes.push(oscillator, oscillatorGain);

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

  private assertRequest(request: IAudibleVoicePlayRequest): void {
    if (request.voices.length === 0) {
      throw new Error("At least one audible voice is required.");
    }

    if (!Number.isFinite(request.durationMilliseconds) || request.durationMilliseconds <= 0) {
      throw new Error(
        `durationMilliseconds must be finite and > 0. Actual value: ${String(request.durationMilliseconds)}.`,
      );
    }

    for (const voice of request.voices) {
      if (voice.oscillators.length === 0) {
        throw new Error(`Voice '${voice.id}' must contain at least one oscillator.`);
      }
    }
  }

  private countOscillators(
    voices: readonly IAudibleVoiceDefinition[],
  ): number {
    return voices.reduce(
      (total, voice) => total + voice.oscillators.length,
      0,
    );
  }

  private resolveAudioContextConstructor(): typeof AudioContext {
    if (globalThis.AudioContext === undefined) {
      throw new Error("AudioContext is not available.");
    }

    return globalThis.AudioContext;
  }
}

export class AudibleDurationResolver {
  public static resolveMilliseconds(): number {
    const rawValue = new URLSearchParams(globalThis.location.search).get("durationMs");

    if (rawValue === null || rawValue.trim().length === 0) {
      return AudibleAudioDefaults.DurationMilliseconds;
    }

    const parsedValue = Number(rawValue);

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      throw new Error(`durationMs must be finite and > 0. Actual value: ${rawValue}.`);
    }

    return Math.round(parsedValue);
  }
}
