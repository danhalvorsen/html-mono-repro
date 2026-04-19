import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../svg-template-host/svg-template-host.js'
import type { TriangleShapeProperties } from '../../domain/shape-properties.js'
import {
  triangleShapeStyles,
  triangleShapeTheme,
} from '../../application/ui-style-module.js'

@customElement('triangle-shape')
export class TriangleShape extends LitElement {
  @property({ type: Number })
  side = 160

  @property({ type: String })
  fill = triangleShapeTheme.fill

  @property({ type: String })
  stroke = triangleShapeTheme.stroke

  @property({ type: Number, attribute: 'stroke-width' })
  strokeWidth = triangleShapeTheme.strokeWidth

  @property({ type: Boolean, reflect: true })
  compact = false

  private get normalizedSide() {
    return Math.max(4, this.side)
  }

  private get altitude() {
    return (Math.sqrt(3) / 2) * this.normalizedSide
  }

  private get viewWidth() {
    return this.normalizedSide + this.strokeWidth * 2
  }

  private get viewHeight() {
    return this.altitude + this.strokeWidth * 2
  }

  private get points() {
    const x0 = this.strokeWidth
    const y0 = this.strokeWidth
    const top = `${x0 + this.normalizedSide / 2},${y0}`
    const right = `${x0 + this.normalizedSide},${y0 + this.altitude}`
    const left = `${x0},${y0 + this.altitude}`
    return `${top} ${right} ${left}`
  }

  private get shapeProps(): TriangleShapeProperties {
    return {
      side: this.normalizedSide,
      fill: this.fill,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
    }
  }

  render() {
    const props = this.shapeProps
    const template = html`
      <svg
        viewBox=${`0 0 ${this.viewWidth} ${this.viewHeight}`}
        width=${this.viewWidth}
        height=${this.viewHeight}
        role="img"
        aria-label="Equilateral triangle shape"
      >
        <polygon
          points=${this.points}
          fill=${props.fill}
          stroke=${props.stroke}
          stroke-width=${props.strokeWidth}
        ></polygon>
      </svg>
    `

    return html`
      <svg-template-host
        ?compact=${this.compact}
        .templateInput=${template}
      ></svg-template-host>
    `
  }

  static styles = triangleShapeStyles
}

declare global {
  interface HTMLElementTagNameMap {
    'triangle-shape': TriangleShape
  }
}
