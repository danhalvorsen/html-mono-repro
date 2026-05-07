import { Vector2 } from '@monorepo/core-math';
import { describe, expect, it } from 'vitest';
import {
  ProgressiveTriangleStrip,
  type ProgressiveTriangleStripOptions,
} from '../src/ProgressiveTriangleStrip.js';

const derivativeOnlyOptions: ProgressiveTriangleStripOptions = {
  maximumVerticalDeviation: 10_000,
  maximumDerivativeDelta: 0.05,
  minimumPointStride: 1,
  maximumPointStride: 100,
};

describe('ProgressiveTriangleStrip derivative contract', () => {
  it('should remove intermediate points when local derivative change is below the configured limit', () => {
    const upper = [
      new Vector2(0, 0),
      new Vector2(1, 4),
      new Vector2(2, 8),
      new Vector2(3, 12),
      new Vector2(4, 16),
    ];

    const lower = [
      new Vector2(0, -10),
      new Vector2(1, -6),
      new Vector2(2, -2),
      new Vector2(3, 2),
      new Vector2(4, 6),
    ];

    const result = new ProgressiveTriangleStrip(
      upper,
      lower,
      derivativeOnlyOptions,
    ).create();

    expect(result.retainedIndices).toEqual([0, 4]);
    expect(result.upperPoints).toHaveLength(2);
    expect(result.lowerPoints).toHaveLength(2);
    expect(result.polygon.closed).toBe(true);
  });

  it('should not require the absolute derivative to be small before removing points', () => {
    const upper = [
      new Vector2(0, 0),
      new Vector2(1, 20),
      new Vector2(2, 40),
    ];

    const lower = [
      new Vector2(0, -40),
      new Vector2(1, -20),
      new Vector2(2, 0),
    ];

    const result = new ProgressiveTriangleStrip(
      upper,
      lower,
      derivativeOnlyOptions,
    ).create();

    expect(result.retainedIndices).toEqual([0, 2]);
  });

  it('should keep a point when local derivative change is above the configured limit', () => {
    const upper = [
      new Vector2(0, 0),
      new Vector2(1, 20),
      new Vector2(2, 0),
    ];

    const lower = [
      new Vector2(0, -20),
      new Vector2(1, -40),
      new Vector2(2, -20),
    ];

    const result = new ProgressiveTriangleStrip(
      upper,
      lower,
      derivativeOnlyOptions,
    ).create();

    expect(result.retainedIndices).toEqual([0, 1, 2]);
    expect(result.upperPoints).toHaveLength(3);
    expect(result.lowerPoints).toHaveLength(3);
  });

  it('should keep the same retained indices for upper and lower points', () => {
    const upper = [
      new Vector2(0, 0),
      new Vector2(1, 4),
      new Vector2(2, 8),
      new Vector2(3, 12),
    ];

    const lower = [
      new Vector2(0, -10),
      new Vector2(1, -6),
      new Vector2(2, -2),
      new Vector2(3, 2),
    ];

    const result = new ProgressiveTriangleStrip(
      upper,
      lower,
      derivativeOnlyOptions,
    ).create();

    expect(result.upperPoints.map(point => point.x)).toEqual(
      result.lowerPoints.map(point => point.x),
    );
  });
});
