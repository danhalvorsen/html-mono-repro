import { describe, expect, it } from 'vitest';
import { GamePolygonGeneratorController, type IGamePolygonGeneratorOptions } from '../../src/Game/Srceens/Cave/GamePolygonGeneratorController.js';

class FakeHost {
  public addController(): void {}
  public requestUpdate(): void {}
}

describe('Cave curve separation integration', () => {
  it('keeps upper/lower curves from touching or crossing reference by minimum distance across phases', () => {
    const minimumDistance = 10;
    const options: IGamePolygonGeneratorOptions = {
      reference: {
        geometry: {
          canvasLength: 500,
          samplesPerFrame: 700,
          amplitude: 100,
          baselineY: 150,
          periodsAcrossFrame: 4
        },
        noise: {
          noiseWindowSize: 40,
          profileSmoothingPasses: 2,
          spikeSuppressionFactor: 1.35
        }
      },
      upper: {
        geometry: { canvasLength: 500, amplitude: 100 },
        distribution: { interval: { min: 10, max: 24 }, skew: 0.25, variationInfluence: 5 },
        noise: { noiseAmplifier: 18 },
        limits: { minDistanceFromReference: minimumDistance }
      },
      lower: {
        geometry: { canvasLength: 500, amplitude: 100 },
        distribution: { interval: { min: 6, max: 18 }, skew: -0.1, variationInfluence: 6 },
        noise: { noiseAmplifier: 10 },
        shape: { flattenStrength: 0.5, flattenPeriodScale: 0.5 },
        limits: { minDistanceFromReference: minimumDistance }
      }
    };

    const controller = new GamePolygonGeneratorController(new FakeHost(), options);

    for (let phase = 0; phase < 120; phase += 1) {
      controller.setPhase(phase);
      const reference = controller.referencePoints;
      const upper = controller.upperPoints;
      const lower = controller.lowerPoints;

      expect(upper.length).toBe(reference.length);
      expect(lower.length).toBe(reference.length);

      for (let i = 0; i < reference.length; i += 1) {
        const ref = reference[i];
        const up = upper[i];
        const low = lower[i];
        if (!ref || !up || !low) continue;

        expect(ref.y - up.y).toBeGreaterThanOrEqual(minimumDistance);
        expect(low.y - ref.y).toBeGreaterThanOrEqual(minimumDistance);
      }
    }
  });
});

