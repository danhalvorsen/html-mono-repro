import { Vector2 } from '@monorepo/core-math';
import type { IReferenceCurveGenerator } from './IReferenceCurveGenerator.js';
import { ReferenceCurve } from './ReferenceCurve.js';
import type {
  ReferenceCurveDefinition,
  ReferenceCurveTermDefinition,
} from './ReferenceCurveDefinition.js';
import { ReferenceCurveTermKind } from './ReferenceCurveTermKind.js';

export class CoefficientReferenceCurveGenerator
  implements IReferenceCurveGenerator
{
  public create(definition: ReferenceCurveDefinition): ReferenceCurve {
    this.validate(definition);

    const points: Vector2[] = [];
    const canvasLength = definition.frame.canvas.length;
    const samplesPerFrame = definition.frame.sampling.samplesPerFrame;
    const step = canvasLength / samplesPerFrame;

    for (let index = 0; index <= samplesPerFrame; index += 1) {
      const x = index * step;
      const normalizedX = x / canvasLength;
      const y = this.yAt(normalizedX, definition);

      points.push(new Vector2(x, y));
    }

    return new ReferenceCurve(points);
  }

  private yAt(
    normalizedX: number,
    definition: ReferenceCurveDefinition,
  ): number {
    const baselineY = definition.expression.vertical.baselineY;
    const amplitude = definition.expression.vertical.amplitude;

    const expressionValue = definition.expression.terms.reduce(
      (sum, term) => sum + this.evaluateTerm(normalizedX, definition, term),
      0,
    );

    return baselineY + amplitude * expressionValue;
  }

  private evaluateTerm(
    normalizedX: number,
    definition: ReferenceCurveDefinition,
    term: ReferenceCurveTermDefinition,
  ): number {
    const periodsAcrossFrame =
      definition.expression.horizontal.periodsAcrossFrame;
    const phase = definition.expression.horizontal.phase ?? 0;

    const argument =
      2 *
        Math.PI *
        periodsAcrossFrame *
        term.frequency.periodMultiplier *
        normalizedX +
      phase * term.phase.multiplier;

    if (term.kind === ReferenceCurveTermKind.Sine) {
      return term.coefficient.weight * Math.sin(argument);
    }

    const divisor = term.normalization?.divisor ?? Math.PI / 2;

    return term.coefficient.weight * (Math.asin(Math.sin(argument)) / divisor);
  }

  private validate(definition: ReferenceCurveDefinition): void {
    this.assertFiniteGreaterThan(
      definition.frame.canvas.length,
      'frame.canvas.length',
      0,
    );

    if (
      !Number.isInteger(definition.frame.sampling.samplesPerFrame) ||
      definition.frame.sampling.samplesPerFrame < 1
    ) {
      throw new RangeError(
        'frame.sampling.samplesPerFrame must be an integer greater than or equal to 1.',
      );
    }

    this.assertFinite(
      definition.expression.vertical.amplitude,
      'expression.vertical.amplitude',
    );

    this.assertFinite(
      definition.expression.vertical.baselineY,
      'expression.vertical.baselineY',
    );

    this.assertFiniteGreaterThan(
      definition.expression.horizontal.periodsAcrossFrame,
      'expression.horizontal.periodsAcrossFrame',
      0,
    );

    if (definition.expression.horizontal.phase !== undefined) {
      this.assertFinite(
        definition.expression.horizontal.phase,
        'expression.horizontal.phase',
      );
    }

    if (definition.expression.terms.length === 0) {
      throw new Error('expression.terms must contain at least one term.');
    }

    for (let index = 0; index < definition.expression.terms.length; index += 1) {
      this.validateTerm(definition.expression.terms[index], index);
    }
  }

  private validateTerm(
    term: ReferenceCurveTermDefinition | undefined,
    index: number,
  ): void {
    if (term === undefined) {
      throw new Error(`expression.terms[${index}] is missing.`);
    }

    this.assertFinite(
      term.coefficient.weight,
      `expression.terms[${index}].coefficient.weight`,
    );

    this.assertFiniteGreaterThan(
      term.frequency.periodMultiplier,
      `expression.terms[${index}].frequency.periodMultiplier`,
      0,
    );

    this.assertFinite(
      term.phase.multiplier,
      `expression.terms[${index}].phase.multiplier`,
    );

    if (
      term.kind === ReferenceCurveTermKind.ArcSineSine &&
      term.normalization?.divisor !== undefined
    ) {
      this.assertFiniteGreaterThan(
        term.normalization.divisor,
        `expression.terms[${index}].normalization.divisor`,
        0,
      );
    }
  }

  private assertFinite(value: number, name: string): void {
    if (!Number.isFinite(value)) {
      throw new RangeError(`${name} must be finite.`);
    }
  }

  private assertFiniteGreaterThan(
    value: number,
    name: string,
    minExclusive: number,
  ): void {
    if (!Number.isFinite(value) || value <= minExclusive) {
      throw new RangeError(`${name} must be greater than ${minExclusive}.`);
    }
  }

  private assertFiniteGreaterThanOrEqual(
    value: number,
    name: string,
    minInclusive: number,
  ): void {
    if (!Number.isFinite(value) || value < minInclusive) {
      throw new RangeError(
        `${name} must be greater than or equal to ${minInclusive}.`,
      );
    }
  }
}

