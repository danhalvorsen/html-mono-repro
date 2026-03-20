import { LitElement, type TemplateResult, html, css } from 'lit'
import { property } from 'lit/decorators.js'

import { RectangleShape } from '../shape-model'
import type { DrawableShape } from '../../DrawableShape'
import { ShapeStylePolicy } from '../../rendering/ShapeStylePolicy'
import { SvgStyleAdapter } from '../../rendering/SvgStyleAdapter'
import { SvgShapeRenderer } from '../../rendering/SvgShapeRenderer'
import { appDesignPolicy } from '../../design-system/AppDesignPolicy'

export abstract class AbstractSvgSceneCanvasElement extends LitElement {
  private readonly shapeRenderer = new SvgShapeRenderer(
    appDesignPolicy.getShapeStyleResolver(),
    new SvgStyleAdapter(),
    new ShapeStylePolicy(),
  )

  @property({ attribute: false })
  public shapes: readonly DrawableShape[] = []

  @property({ type: Number })
  public canvasWidth = 760

  @property({ type: Number })
  public canvasHeight = 520

  protected abstract renderScene(): readonly DrawableShape[]

  protected override render(): TemplateResult {
    const shapes = this.renderScene()
    const debugBorder = new RectangleShape(
      { x: 0, y: 0 },
      Math.max(this.canvasWidth - 2, 1),
      Math.max(this.canvasHeight - 2, 1),
      { token: 'debug-border' },
      'debug-border',
    )
    const shapesWithDebug = [debugBorder, ...shapes]

    return html`
      <div class="canvas-frame">
        <svg
          class="canvas"
          viewBox=${`0 0 ${this.canvasWidth} ${this.canvasHeight}`}
          role="img"
          aria-label="SVG shapes drawn in a Cartesian coordinate system"
        >
          <defs>
            <clipPath id="paper-clip">
              <rect
                x="0"
                y="0"
                width=${this.canvasWidth}
                height=${this.canvasHeight}
                rx="22"
                ry="22"
              ></rect>
            </clipPath>
          </defs>
          <rect
            class="paper"
            x="0"
            y="0"
            width=${this.canvasWidth}
            height=${this.canvasHeight}
            rx="22"
            ry="22"
          ></rect>
          <g clip-path="url(#paper-clip)">
            <g transform=${`translate(${this.canvasWidth / 2} ${this.canvasHeight / 2}) scale(1 -1)`}>
              ${shapesWithDebug.map((shape) => this.shapeRenderer.renderShape(shape))}
            </g>
          </g>
        </svg>
      </div>
    `
  }

  public static override styles = css`
    :host {
      display: block;
    }

    .canvas-frame {
      padding: var(--canvas-safe-margin, 14px);
      box-sizing: border-box;
    }

    .canvas {
      width: min(100%, 760px);
      height: auto;
      display: block;
      filter: drop-shadow(0 28px 38px rgba(15, 23, 42, 0.16));
    }

    .paper {
      fill: rgba(255, 255, 255, 0.82);
      stroke: rgba(148, 163, 184, 0.3);
      stroke-width: 1;
    }
  `
}
