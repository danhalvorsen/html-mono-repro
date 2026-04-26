export class DistortionMath {
  public static clamp(
    value: number,
    minimum: number,
    maximum: number,
  ): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    if (value < minimum) {
      return minimum;
    }

    if (value > maximum) {
      return maximum;
    }

    return value;
  }

  public static clampBipolar(value: number): number {
    return DistortionMath.clamp(value, -1, 1);
  }

  public static mix(
    dry: number,
    wet: number,
    mix: number,
  ): number {
    return DistortionMath.clampBipolar(
      dry * (1 - mix) + wet * mix,
    );
  }

  public static quantizeBipolar(
    value: number,
    bitDepth: number,
  ): number {
    const safeBitDepth = Math.max(1, Math.min(32, Math.trunc(bitDepth)));
    const levelCount = Math.pow(2, safeBitDepth);
    const normalized = (DistortionMath.clampBipolar(value) + 1) / 2;
    const quantized = Math.round(normalized * (levelCount - 1)) / (levelCount - 1);

    return DistortionMath.clampBipolar(quantized * 2 - 1);
  }

  public static foldback(
    value: number,
    threshold: number,
  ): number {
    const safeThreshold = DistortionMath.clamp(threshold, 0.000_001, 1);
    let folded = value;

    while (folded > safeThreshold || folded < -safeThreshold) {
      if (folded > safeThreshold) {
        folded = safeThreshold - (folded - safeThreshold);
        continue;
      }

      if (folded < -safeThreshold) {
        folded = -safeThreshold - (folded + safeThreshold);
      }
    }

    return DistortionMath.clampBipolar(folded);
  }
}
