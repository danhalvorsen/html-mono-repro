export class OscillatorMath {
  public static readonly twoPi = Math.PI * 2;

  public static clampBipolar(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    if (value < -1) {
      return -1;
    }

    if (value > 1) {
      return 1;
    }

    return value;
  }

  public static clampUnipolar(value: number): number {
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

  public static wrap01(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    const wrapped = value % 1;

    return wrapped < 0 ? wrapped + 1 : wrapped;
  }

  public static radiansToCycles(radians: number): number {
    return OscillatorMath.wrap01(radians / OscillatorMath.twoPi);
  }

  public static centsToFrequencyRatio(cents: number): number {
    return Math.pow(2, cents / 1_200);
  }

  public static frequencyWithDetune(
    frequencyHz: number,
    detuneCents: number,
  ): number {
    return frequencyHz * OscillatorMath.centsToFrequencyRatio(detuneCents);
  }

  public static phaseIncrement(
    frequencyHz: number,
    sampleRateHz: number,
  ): number {
    return frequencyHz / sampleRateHz;
  }
}
