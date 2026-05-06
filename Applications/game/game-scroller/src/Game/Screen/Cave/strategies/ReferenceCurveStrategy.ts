import type { INormalizedCurveControlOptions } from '../CurveOptions.js';

export interface IReferenceCurveStrategy {
  yAt(normalizedX: number, phase: number, options: INormalizedCurveControlOptions): number;
}

export class CaveReferenceCurveStrategy implements IReferenceCurveStrategy {
  public yAt(normalizedX: number, phase: number, options: INormalizedCurveControlOptions): number {
    const periods = options.geometry.periodsAcrossFrame;
    const low = Math.sin(2 * Math.PI * periods * normalizedX + phase);
    const mid = Math.sin(2 * Math.PI * (periods * 2.2) * normalizedX + phase * 1.37);
    const high = Math.sin(2 * Math.PI * (periods * 3.8) * normalizedX + phase * 1.9);
    const teeth = Math.asin(Math.sin(2 * Math.PI * (periods * 5.2) * normalizedX + phase * 2.3));

    const blended =
      0.62 * low +
      0.24 * mid +
      0.08 * high +
      0.015 * (teeth / (Math.PI / 2));

    return options.geometry.baselineY + options.geometry.amplitude * blended;
  }
}
