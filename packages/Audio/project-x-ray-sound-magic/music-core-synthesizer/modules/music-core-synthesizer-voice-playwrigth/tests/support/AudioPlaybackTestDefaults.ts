export const AudioPlaybackTestDefaults = {
  DurationMilliseconds: 5_000,
  MinimumToleranceMilliseconds: 350,
  MaximumToleranceMilliseconds: 750,
  StopPaddingSeconds: 0.05,
} as const;

export interface IExpectedAudioPlaybackWindow {
  readonly timeoutMilliseconds: number;
  readonly minimumElapsedMilliseconds: number;
  readonly maximumElapsedMilliseconds: number;
}

export class AudioPlaybackExpectationFactory {
  public static createDefault(): IExpectedAudioPlaybackWindow {
    return {
      timeoutMilliseconds:
        AudioPlaybackTestDefaults.DurationMilliseconds
        + AudioPlaybackTestDefaults.MaximumToleranceMilliseconds
        + 2_000,
      minimumElapsedMilliseconds:
        AudioPlaybackTestDefaults.DurationMilliseconds
        - AudioPlaybackTestDefaults.MinimumToleranceMilliseconds,
      maximumElapsedMilliseconds:
        AudioPlaybackTestDefaults.DurationMilliseconds
        + AudioPlaybackTestDefaults.MaximumToleranceMilliseconds,
    };
  }
}
