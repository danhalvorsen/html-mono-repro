import type { Vector2 } from '@monorepo/core-math';
import { html, type TemplateResult } from 'lit';
import type { CaveScene } from '../../cave-temp/game-feature-cave/dist/CaveScene';

export interface CaveBaseGameObjectShapeTemplateOptions {
  readonly scene: CaveScene;
  readonly width: number;
  readonly height: number;
  readonly showCollisionPolygon: boolean;
}

export class CaveBaseGameObjectShapeTemplate {
  public constructor(
    private readonly options: CaveBaseGameObjectShapeTemplateOptions,
  ) {}

  public render(): TemplateResult {
    return html`
      <svg
        width=${this.options.width}
        height=${this.options.height}
        viewBox=${`0 0 ${this.options.width} ${this.options.height}`}
        style=${`position:absolute;left:${-this.options.width / 2}px;top:${-this.options.height / 2}px;overflow:visible;`}
        aria-label="Cave BaseGameObject"
      >
        <polygon
          points=${this.toPointsAttribute(this.options.scene.polygon.points)}
          fill="#2e1f15"
          stroke="#8b5a2b"
          stroke-width="2"
        ></polygon>

        ${this.options.showCollisionPolygon
          ? html`
              <polygon
                points=${this.toPointsAttribute(
                  this.options.scene.collisionPolygon.points,
                )}
                fill="rgba(56, 189, 248, 0.18)"
                stroke="#38bdf8"
                stroke-width="2"
                stroke-dasharray="6 4"
              ></polygon>
            `
          : null}

        <polyline
          points=${this.toPointsAttribute(this.options.scene.referencePoints)}
          fill="none"
          stroke="#facc15"
          stroke-width="1.25"
          stroke-dasharray="8 4"
        ></polyline>

        <text
          x="12"
          y="22"
          fill="#e5e7eb"
          font-size="12"
          font-family="monospace"
        >
          visual=${this.options.scene.polygon.points.length}
          strip=${this.options.scene.collisionPolygon.points.length}
        </text>
      </svg>
    `;
  }

  private toPointsAttribute(points: readonly Vector2[]): string {
    return points.map(point => `${point.x},${point.y}`).join(' ');
  }
}
