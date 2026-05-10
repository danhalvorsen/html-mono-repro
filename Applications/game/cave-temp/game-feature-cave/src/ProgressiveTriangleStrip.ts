import type { Vector2 } from '@monorepo/core-math';
import { TriangleStrip } from './TriangleStrip.js';
import type { Polygon } from './polygon.js';

const X_ALIGNMENT_TOLERANCE = 0.000001;

export interface ProgressiveTriangleStripOptions {
  readonly maximumVerticalDeviation: number;
  readonly maximumDerivativeDelta: number;
  readonly minimumPointStride: number;
  readonly maximumPointStride: number;
}

export interface ProgressiveTriangleStripResult {
  readonly polygon: Polygon;
  readonly upperPoints: readonly Vector2[];
  readonly lowerPoints: readonly Vector2[];
  readonly retainedIndices: readonly number[];
}

export class ProgressiveTriangleStrip {
  public constructor(
    private readonly upperPoints: readonly Vector2[],
    private readonly lowerPoints: readonly Vector2[],
    private readonly options: ProgressiveTriangleStripOptions,
  ) {}

  public create(): ProgressiveTriangleStripResult {
    this.validate();

    const retainedIndices = this.createRetainedIndices();
    const selectedUpperPoints = retainedIndices.map(index =>
      this.getPoint(this.upperPoints, index),
    );
    const selectedLowerPoints = retainedIndices.map(index =>
      this.getPoint(this.lowerPoints, index),
    );

    return {
      polygon: new TriangleStrip(selectedUpperPoints, selectedLowerPoints).create(),
      upperPoints: Object.freeze([...selectedUpperPoints]),
      lowerPoints: Object.freeze([...selectedLowerPoints]),
      retainedIndices: Object.freeze([...retainedIndices]),
    };
  }

  private createRetainedIndices(): number[] {
    const lastIndex = this.upperPoints.length - 1;
    const retainedIndices: number[] = [0];

    let anchorIndex = 0;
    let candidateIndex = 1;

    while (candidateIndex <= lastIndex) {
      const stride = candidateIndex - anchorIndex;

      if (stride < this.options.minimumPointStride) {
        candidateIndex += 1;
        continue;
      }

      if (stride > this.options.maximumPointStride) {
        const forcedIndex = candidateIndex - 1;
        retainedIndices.push(forcedIndex);
        anchorIndex = forcedIndex;
        candidateIndex = anchorIndex + 1;
        continue;
      }

      if (this.canApproximateSegment(anchorIndex, candidateIndex)) {
        candidateIndex += 1;
        continue;
      }

      const retainedIndex = Math.max(anchorIndex + 1, candidateIndex - 1);
      retainedIndices.push(retainedIndex);
      anchorIndex = retainedIndex;
      candidateIndex = anchorIndex + 1;
    }

    if (retainedIndices[retainedIndices.length - 1] !== lastIndex) {
      retainedIndices.push(lastIndex);
    }

    return retainedIndices;
  }

  private canApproximateSegment(startIndex: number, endIndex: number): boolean {
    if (endIndex <= startIndex + 1) {
      return true;
    }

    return (
      this.canApproximateCurve(this.upperPoints, startIndex, endIndex) &&
      this.canApproximateCurve(this.lowerPoints, startIndex, endIndex)
    );
  }

  private canApproximateCurve(
    points: readonly Vector2[],
    startIndex: number,
    endIndex: number,
  ): boolean {
    const start = this.getPoint(points, startIndex);
    const end = this.getPoint(points, endIndex);
    const segmentDerivative = this.derivative(start, end);

    for (let index = startIndex + 1; index < endIndex; index += 1) {
      const previous = this.getPoint(points, index - 1);
      const current = this.getPoint(points, index);
      const next = this.getPoint(points, index + 1);

      const leftDerivative = this.derivative(previous, current);
      const rightDerivative = this.derivative(current, next);
      const localDerivativeDelta = Math.abs(leftDerivative - rightDerivative);

      if (localDerivativeDelta > this.options.maximumDerivativeDelta) {
        return false;
      }

      const localToSegmentDelta = Math.abs(leftDerivative - segmentDerivative);

      if (localToSegmentDelta > this.options.maximumDerivativeDelta) {
        return false;
      }

      const expectedY = this.interpolateY(start, end, current.x);
      const verticalDeviation = Math.abs(current.y - expectedY);

      if (verticalDeviation > this.options.maximumVerticalDeviation) {
        return false;
      }
    }

    return true;
  }

  private derivative(start: Vector2, end: Vector2): number {
    const dx = end.x - start.x;

    if (Math.abs(dx) <= X_ALIGNMENT_TOLERANCE) {
      return 0;
    }

    return (end.y - start.y) / dx;
  }

  private interpolateY(start: Vector2, end: Vector2, x: number): number {
    const dx = end.x - start.x;

    if (Math.abs(dx) <= X_ALIGNMENT_TOLERANCE) {
      return start.y;
    }

    const ratio = (x - start.x) / dx;
    return start.y + (end.y - start.y) * ratio;
  }

  private validate(): void {
    if (this.upperPoints.length < 2) {
      throw new Error('ProgressiveTriangleStrip requires at least 2 upper points.');
    }

    if (this.upperPoints.length !== this.lowerPoints.length) {
      throw new Error(
        'ProgressiveTriangleStrip upper and lower points must have the same point count.',
      );
    }

    this.validateOptions();
    this.validatePointAlignment();
  }

  private validateOptions(): void {
    if (
      !Number.isFinite(this.options.maximumVerticalDeviation) ||
      this.options.maximumVerticalDeviation < 0
    ) {
      throw new RangeError(
        'maximumVerticalDeviation must be greater than or equal to 0.',
      );
    }

    if (
      !Number.isFinite(this.options.maximumDerivativeDelta) ||
      this.options.maximumDerivativeDelta < 0
    ) {
      throw new RangeError(
        'maximumDerivativeDelta must be greater than or equal to 0.',
      );
    }

    if (
      !Number.isInteger(this.options.minimumPointStride) ||
      this.options.minimumPointStride < 1
    ) {
      throw new RangeError(
        'minimumPointStride must be an integer greater than or equal to 1.',
      );
    }

    if (
      !Number.isInteger(this.options.maximumPointStride) ||
      this.options.maximumPointStride < this.options.minimumPointStride
    ) {
      throw new RangeError(
        'maximumPointStride must be greater than or equal to minimumPointStride.',
      );
    }
  }

  private validatePointAlignment(): void {
    for (let index = 0; index < this.upperPoints.length; index += 1) {
      const upper = this.getPoint(this.upperPoints, index);
      const lower = this.getPoint(this.lowerPoints, index);

      if (Math.abs(upper.x - lower.x) > X_ALIGNMENT_TOLERANCE) {
        throw new Error(
          `ProgressiveTriangleStrip upper and lower x values must match at index ${index}.`,
        );
      }

      if (index === 0) {
        continue;
      }

      const previousUpper = this.getPoint(this.upperPoints, index - 1);

      if (upper.x <= previousUpper.x) {
        throw new Error(
          'ProgressiveTriangleStrip points must be ordered by increasing x.',
        );
      }
    }
  }

  private getPoint(points: readonly Vector2[], index: number): Vector2 {
    const point = points[index];

    if (point === undefined) {
      throw new Error(`Point index ${index} is out of range.`);
    }

    return point;
  }
}
