import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../svg-template-host/svg-template-host.js'
import { CartesianToSvgMapper } from '../../domain/cartesian-to-svg-mapper.js'
import { buildLabelSvgTemplate } from '../label/label-template.js'
import {
  circleLabelDistributionStyles,
  circleLabelDistributionTheme,
} from '../../application/ui-style-module.js'

type LabelOrientation = 'fixed' | 'tangent' | 'radial'
type DirectionMode = 'clockwise' | 'counterclockwise'

@customElement('circle-label-distribution')
export class CircleLabelDistribution extends LitElement {
  @property({ type: Number, attribute: 'item-count' })
  itemCount = 8

  @property({ type: Number })
  radius = 140

  @property({ type: Number, attribute: 'item-size' })
  itemSize = 70

  @property({ type: Number, attribute: 'start-angle' })
  startAngle = -90

  @property({ type: Boolean })
  clockwise = true

  @property({ type: String, attribute: 'direction-mode' })
  directionMode?: DirectionMode

  @property({ type: Number, attribute: 'label-scale' })
  labelScale = 1

  @property({ type: Number })
  scale?: number

  @property({ type: String, attribute: 'label-orientation' })
  labelOrientation: LabelOrientation = 'fixed'

  private get normalizedItemCount() {
    return Math.max(1, Math.floor(this.itemCount))
  }

  private get normalizedRadius() {
    return Math.max(24, this.radius)
  }

  private get normalizedItemSize() {
    return Math.max(28, this.itemSize)
  }

  private get containerSize() {
    return this.normalizedRadius * 2 + this.normalizedItemSize * 2
  }

  private get center() {
    return this.containerSize / 2
  }

  private get stepAngle() {
    return 360 / this.normalizedItemCount
  }

  private get normalizedLabelScale() {
    const scaleInput =
      this.scale !== undefined && Number.isFinite(this.scale)
        ? this.scale
        : this.labelScale
    return Math.max(0.05, scaleInput)
  }

  private get normalizedLabelOrientation(): LabelOrientation {
    if (this.labelOrientation === 'tangent') {
      return 'tangent'
    }
    if (this.labelOrientation === 'radial') {
      return 'radial'
    }
    return 'fixed'
  }

  private get directionSign() {
    if (this.directionMode === 'counterclockwise') {
      return -1
    }
    if (this.directionMode === 'clockwise') {
      return 1
    }
    return this.clockwise ? 1 : -1
  }

  private itemRotation(angleDeg: number, direction: number): number {
    if (this.normalizedLabelOrientation === 'tangent') {
      // Tangent follows the first derivative direction of the path.
      return angleDeg + (direction === 1 ? 90 : -90)
    }

    if (this.normalizedLabelOrientation === 'radial') {
      return angleDeg
    }

    return 0
  }

  private itemPosition(index: number) {
    const direction = this.directionSign
    const angleDeg = this.startAngle + index * this.stepAngle * direction
    const mapper = new CartesianToSvgMapper(this.center, this.center, 0, 'clockwise')
    const anchor = mapper.mapPolarToSvg(this.normalizedRadius, angleDeg)
    const width = this.normalizedItemSize * 2.2
    const height = this.normalizedItemSize * 0.85
    const x = anchor.x - width / 2
    const y = anchor.y - height / 2
    return {
      leftPct: (x / this.containerSize) * 100,
      topPct: (y / this.containerSize) * 100,
      widthPct: (width / this.containerSize) * 100,
      heightPct: (height / this.containerSize) * 100,
      rotationDeg: this.itemRotation(angleDeg, direction),
    }
  }

  private guideTemplate() {
    return html`
      <svg
        viewBox=${`0 0 ${this.containerSize} ${this.containerSize}`}
        role="img"
        aria-label="Circle guide for distributed labels"
      >
        <circle
          cx=${this.center}
          cy=${this.center}
          r=${this.normalizedRadius}
          fill="none"
          stroke=${circleLabelDistributionTheme.guideStroke}
          stroke-width=${circleLabelDistributionTheme.guideStrokeWidth}
        ></circle>
      </svg>
    `
  }

  render() {
    const labels = Array.from(
      { length: this.normalizedItemCount },
      (_, index) => index + 1,
    )

    return html`
      <section
        class="distribution"
        style=${`--distribution-size:${this.containerSize}px;`}
      >
        <svg-template-host
          compact
          class="guide-host"
          .templateInput=${this.guideTemplate()}
        ></svg-template-host>
        ${labels.map((label, index) => {
          const position = this.itemPosition(index)
          return html`
            <div
              class="item"
              style=${`left:${position.leftPct}%;top:${position.topPct}%;width:${position.widthPct}%;height:${position.heightPct}%;transform:rotate(${position.rotationDeg}deg);transform-origin:center;`}
            >
              <svg-template-host
                compact
                .templateInput=${buildLabelSvgTemplate(
                  String(label),
                  this.normalizedLabelScale,
                )}
              ></svg-template-host>
            </div>
          `
        })}
      </section>
    `
  }

  static styles = circleLabelDistributionStyles
}

declare global {
  interface HTMLElementTagNameMap {
    'circle-label-distribution': CircleLabelDistribution
  }
}
