import { describe, expect, it } from 'vitest';
import { CoefficientReferenceCurveGenerator } from '../src/index.js';
import { ReferenceCurveGeneratorFixture } from './fixtures/ReferenceCurveGeneratorFixture.js';

describe('CoefficientReferenceCurveGenerator', () => {
  it('should create samplesPerFrame plus one point', () => {
    const fixture = new ReferenceCurveGeneratorFixture();
    const definition = fixture.createSingleSineDefinition({
      frame: {
        canvas: {
          length: 100,
        },
        sampling: {
          samplesPerFrame: 4,
        },
      },
    });

    const curve = new CoefficientReferenceCurveGenerator().create(definition);

    expect(curve.points).toHaveLength(5);
  });

  it('should distribute x coordinates evenly across the canvas length', () => {
    const fixture = new ReferenceCurveGeneratorFixture();
    const definition = fixture.createSingleSineDefinition();

    const curve = new CoefficientReferenceCurveGenerator().create(definition);

    expect(curve.points.map(point => point.x)).toEqual([0, 25, 50, 75, 100]);
  });

  it('should evaluate sine coefficients from the structured definition object', () => {
    const fixture = new ReferenceCurveGeneratorFixture();
    const definition = fixture.createSingleSineDefinition();

    const curve = new CoefficientReferenceCurveGenerator().create(definition);

    expect(curve.points[0]?.y).toBeCloseTo(0, 10);
    expect(curve.points[1]?.y).toBeCloseTo(10, 10);
    expect(curve.points[2]?.y).toBeCloseTo(0, 10);
    expect(curve.points[3]?.y).toBeCloseTo(-10, 10);
    expect(curve.points[4]?.y).toBeCloseTo(0, 10);
  });

  it('should apply baseline and amplitude after evaluating expression terms', () => {
    const fixture = new ReferenceCurveGeneratorFixture();
    const definition = fixture.createSingleSineDefinition({
      expression: {
        vertical: {
          baselineY: 100,
          amplitude: 20,
        },
        horizontal: {
          periodsAcrossFrame: 1,
          phase: 0,
        },
        terms: [
          {
            kind: 'sine',
            coefficient: {
              weight: 1,
            },
            frequency: {
              periodMultiplier: 1,
            },
            phase: {
              multiplier: 1,
            },
          },
        ],
      },
    });

    const curve = new CoefficientReferenceCurveGenerator().create(definition);

    expect(curve.points[1]?.y).toBeCloseTo(120, 10);
    expect(curve.points[3]?.y).toBeCloseTo(80, 10);
  });

  it('should combine multiple weighted expression terms', () => {
    const fixture = new ReferenceCurveGeneratorFixture();
    const definition = fixture.createTwoTermDefinition();

    const curve = new CoefficientReferenceCurveGenerator().create(definition);

    expect(curve.points[1]?.y).toBeCloseTo(20, 10);
  });

  it('should support arc-sine-sine terms', () => {
    const fixture = new ReferenceCurveGeneratorFixture();
    const definition = fixture.createArcSineSineDefinition();

    const curve = new CoefficientReferenceCurveGenerator().create(definition);

    expect(curve.points[1]?.y).toBeCloseTo(10, 10);
    expect(curve.points[3]?.y).toBeCloseTo(-10, 10);
  });

  it('should be deterministic for the same structured definition', () => {
    const fixture = new ReferenceCurveGeneratorFixture();
    const definition = fixture.createSingleSineDefinition();
    const generator = new CoefficientReferenceCurveGenerator();

    const first = generator.create(definition);
    const second = generator.create(definition);

    expect(first.points.map(point => ({ x: point.x, y: point.y }))).toEqual(
      second.points.map(point => ({ x: point.x, y: point.y })),
    );
  });

  it('should reject empty expression terms', () => {
    const fixture = new ReferenceCurveGeneratorFixture();
    const definition = fixture.createSingleSineDefinition({
      expression: {
        vertical: {
          baselineY: 0,
          amplitude: 10,
        },
        horizontal: {
          periodsAcrossFrame: 1,
          phase: 0,
        },
        terms: [],
      },
    });

    expect(() => new CoefficientReferenceCurveGenerator().create(definition)).toThrow(
      'expression.terms must contain at least one term.',
    );
  });
});
