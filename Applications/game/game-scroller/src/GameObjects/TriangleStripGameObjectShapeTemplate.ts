import type { Vector2 } from '@monorepo/core-math';
import type { ProgressiveTriangleStripResult } from '@monorepo/game-feature-cave';
import { html, type TemplateResult } from 'lit';
import { BaseGameObjectShapeTemplate } from './BaseGameObjectShapeTemplate.js';

export interface TriangleStripGameObjectShapeTemplateOptions {
  readonly triangleStrip: ProgressiveTriangleStripResult;
  readonly width: number;
  readonly height: number;
}

export class TriangleStripGameObjectShapeTemplate extends BaseGameObjectShapeTemplate {
  public constructor(
    private readonly options: TriangleStripGameObjectShapeTemplateOptions,
  ) {
    super();
  }

  public override render(): TemplateResult {
    return html`
      <svg
        width=${this.options.width}
        height=${this.options.height}
        viewBox=${`0 0 ${this.options.width} ${this.options.height}`}
        style=${`position:absolute;left:${-this.options.width / 2}px;top:${-this.options.height / 2}px;overflow:visible;`}
        aria-label="Progressive triangle strip"
      >
        <polyline
          points=${this.toPointsAttribute(this.createStripWalk())}
          fill="none"
          stroke="#ff2d2d"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></polyline>
      </svg>
    `;
  }

  private createStripWalk(): readonly Vector2[] {
    const upperPoints = this.options.triangleStrip.upperPoints;
    const lowerPoints = this.options.triangleStrip.lowerPoints;

    if (upperPoints.length !== lowerPoints.length) {
      throw new Error(
        'Triangle strip upper and lower point arrays must have the same length.',
      );
    }

    const points: Vector2[] = [];

    for (let index = 0; index < upperPoints.length; index += 1) {
      const upper = upperPoints[index];
      const lower = lowerPoints[index];

      if (upper === undefined || lower === undefined) {
        throw new Error(`Triangle strip point pair ${index} is missing.`);
      }

      points.push(upper, lower);
    }

    return Object.freeze(points);
  }

  private toPointsAttribute(points: readonly Vector2[]): string {
    return points.map(point => `${point.x},${point.y}`).join(' ');
  }
}
