import {
  ReferenceCurveTermKind,
  type ReferenceCurveDefinition,
} from '../../src/index.js';

export class ReferenceCurveGeneratorFixture {
  public createSingleSineDefinition(
    overrides: Partial<ReferenceCurveDefinition> = {},
  ): ReferenceCurveDefinition {
    const definition: ReferenceCurveDefinition = {
      frame: {
        canvas: {
          length: 100,
        },
        sampling: {
          samplesPerFrame: 4,
        },
      },
      expression: {
        vertical: {
          baselineY: 0,
          amplitude: 10,
        },
        horizontal: {
          periodsAcrossFrame: 1,
          phase: 0,
        },
        terms: [
          {
            kind: ReferenceCurveTermKind.Sine,
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
    };

    return {
      ...definition,
      ...overrides,
      frame: {
        ...definition.frame,
        ...overrides.frame,
        canvas: {
          ...definition.frame.canvas,
          ...overrides.frame?.canvas,
        },
        sampling: {
          ...definition.frame.sampling,
          ...overrides.frame?.sampling,
        },
      },
      expression: {
        ...definition.expression,
        ...overrides.expression,
        vertical: {
          ...definition.expression.vertical,
          ...overrides.expression?.vertical,
        },
        horizontal: {
          ...definition.expression.horizontal,
          ...overrides.expression?.horizontal,
        },
        terms: overrides.expression?.terms ?? definition.expression.terms,
      },
    };
  }

  public createTwoTermDefinition(): ReferenceCurveDefinition {
    return this.createSingleSineDefinition({
      expression: {
        vertical: {
          baselineY: 5,
          amplitude: 10,
        },
        horizontal: {
          periodsAcrossFrame: 1,
          phase: 0,
        },
        terms: [
          {
            kind: ReferenceCurveTermKind.Sine,
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
          {
            kind: ReferenceCurveTermKind.Sine,
            coefficient: {
              weight: 0.5,
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
  }

  public createArcSineSineDefinition(): ReferenceCurveDefinition {
    return this.createSingleSineDefinition({
      expression: {
        vertical: {
          baselineY: 0,
          amplitude: 10,
        },
        horizontal: {
          periodsAcrossFrame: 1,
          phase: 0,
        },
        terms: [
          {
            kind: ReferenceCurveTermKind.ArcSineSine,
            coefficient: {
              weight: 1,
            },
            frequency: {
              periodMultiplier: 1,
            },
            phase: {
              multiplier: 1,
            },
            normalization: {
              divisor: Math.PI / 2,
            },
          },
        ],
      },
    });
  }
}
