export const AudioPlaybackTestDefaults = {
  DurationMilliseconds: 5_000,
  MinimumToleranceMilliseconds: 350,
  MaximumToleranceMilliseconds: 750,
  StopPaddingSeconds: 0.05,
} as const;

export interface IExpectedAudioPlaybackWindow {
  readonly timeoutMilliseconds: number;

  readonly minimumMilliseconds: number;
  readonly maximumMilliseconds: number;

  readonly minimumElapsedMilliseconds: number;
  readonly maximumElapsedMilliseconds: number;
}

export class AudioPlaybackExpectationFactory {
  public static createDefault(): IExpectedAudioPlaybackWindow {
    const minimumMilliseconds =
      AudioPlaybackTestDefaults.DurationMilliseconds
      - AudioPlaybackTestDefaults.MinimumToleranceMilliseconds;

    const maximumMilliseconds =
      AudioPlaybackTestDefaults.DurationMilliseconds
      + AudioPlaybackTestDefaults.MaximumToleranceMilliseconds;

    return {
      timeoutMilliseconds:
        AudioPlaybackTestDefaults.DurationMilliseconds
        + AudioPlaybackTestDefaults.MaximumToleranceMilliseconds
        + 2_000,

      minimumMilliseconds,
      maximumMilliseconds,

      minimumElapsedMilliseconds: minimumMilliseconds,
      maximumElapsedMilliseconds: maximumMilliseconds,
    };
  }
}
