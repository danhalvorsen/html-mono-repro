import { AudioPlaybackTestDefaults } from "../../support/AudioPlaybackTestDefaults.js";

export interface IAudioPlaybackDurationConfiguration {
  readonly durationMilliseconds: number;
  readonly durationSeconds: number;
}

export class BrowserAudioPlaybackDurationConfiguration {
  public static resolve(): IAudioPlaybackDurationConfiguration {
    const durationMilliseconds =
      BrowserAudioPlaybackDurationConfiguration.resolveDurationMilliseconds();

    return {
      durationMilliseconds,
      durationSeconds: durationMilliseconds / 1_000,
    };
  }

  public static resolveNoteDurationSeconds(request: {
    readonly releaseSeconds: number;
  }): number {
    const duration = BrowserAudioPlaybackDurationConfiguration.resolve();

    return Math.max(
      0.05,
      duration.durationSeconds
        - request.releaseSeconds
        - AudioPlaybackTestDefaults.StopPaddingSeconds,
    );
  }

  private static resolveDurationMilliseconds(): number {
    const rawValue = new URLSearchParams(globalThis.location.search).get("durationMs");

    if (rawValue === null || rawValue.trim().length === 0) {
      return AudioPlaybackTestDefaults.DurationMilliseconds;
    }

    const parsedValue = Number(rawValue);

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      throw new Error(`durationMs must be finite and > 0. Actual value: ${rawValue}.`);
    }

    return Math.round(parsedValue);
  }
}
