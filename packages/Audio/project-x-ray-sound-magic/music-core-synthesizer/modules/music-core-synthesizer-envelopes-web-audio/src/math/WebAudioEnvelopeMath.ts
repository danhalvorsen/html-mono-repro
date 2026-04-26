export class WebAudioEnvelopeMath {
  public static clamp01(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    if (value < 0) {
      return 0;
    }

    if (value > 1) {
      return 1;
    }

    return value;
  }

  public static safeTimeConstant(durationSeconds: number): number {
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      return 0.001;
    }

    return Math.max(0.001, durationSeconds / 5);
  }

  public static levelAtRelease(parameterValue: number): number {
    return WebAudioEnvelopeMath.clamp01(parameterValue);
  }
}
