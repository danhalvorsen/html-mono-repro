import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { CartesianToSvgMapper } from '../../domain/cartesian-to-svg-mapper.js'
import type { DualSectorShapeProperties } from '../../domain/shape-properties.js'
import '../svg-template-host/svg-template-host.js'
import {
  dualSectorShapeStyles,
  dualSectorShapeTheme,
} from '../../application/ui-style-module.js'

@customElement('dual-sector-shape')
export class DualSectorShape extends LitElement {
  @property({ type: Number, attribute: 'radius-min' })
  radiusMin = 40

  @property({ type: Number, attribute: 'radius-max' })
  radiusMax = 90

  @property({ type: Number, attribute: 'start-angle' })
  startAngle = 0

  @property({ type: Number, attribute: 'end-angle' })
  endAngle = 300

  @property({ type: Number, attribute: 'opening-start-angle' })
  openingStartAngle = 0

  @property({ type: Boolean })
  clockwise = false

  @property({ type: Number })
  segments = 120

  @property({ type: String })
  fill = dualSectorShapeTheme.fill

  @property({ type: String })
  stroke = dualSectorShapeTheme.stroke

  @property({ type: Number, attribute: 'stroke-width' })
  strokeWidth = dualSectorShapeTheme.strokeWidth

  private get normalizedRadii() {
    const min = Math.max(0, this.radiusMin)
    const max = Math.max(0, this.radiusMax)
    return min <= max ? { min, max } : { min: max, max: min }
  }

  private get size() {
    const { max } = this.normalizedRadii
    return max * 2 + this.strokeWidth * 2
  }

  private get arcSpan() {
    let span = this.endAngle - this.startAngle
    while (span <= 0) {
      span += 360
    }
    return Math.min(360, span)
  }

  private get arcPoints() {
    const props = this.shapeProps
    const { min: radiusMin, max: radiusMax } = this.normalizedRadii
    const fullCirclePointCount = Math.max(12, Math.floor(props.segments))
    const span = this.arcSpan
    const stepCount = Math.max(
      2,
      Math.ceil((Math.abs(span) / 360) * fullCirclePointCount),
    )
    const center = this.size / 2
    const start = props.openingStartAngle + props.startAngle
    const mapper = new CartesianToSvgMapper(
      center,
      center,
      0,
      props.clockwise ? 'clockwise' : 'counterclockwise',
    )

    const outer: string[] = []
    const inner: string[] = []

    for (let i = 0; i <= stepCount; i += 1) {
      const angle = start + (span * i) / stepCount
      const point = mapper.mapPolarToSvg(radiusMax, angle)
      outer.push(`${point.x},${point.y}`)
    }

    for (let i = stepCount; i >= 0; i -= 1) {
      const angle = start + (span * i) / stepCount
      const point = mapper.mapPolarToSvg(radiusMin, angle)
      inner.push(`${point.x},${point.y}`)
    }

    return `${outer.join(' ')} ${inner.join(' ')}`
  }

  private get shapeProps(): DualSectorShapeProperties {
    const { min, max } = this.normalizedRadii
    return {
      radiusMin: min,
      radiusMax: max,
      startAngle: this.startAngle,
      endAngle: this.endAngle,
      openingStartAngle: this.openingStartAngle,
      clockwise: this.clockwise,
      segments: this.segments,
      fill: this.fill,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
    }
  }

  render() {
    const props = this.shapeProps
    const size = this.size
    const template = html`
      <svg
        viewBox=${`0 0 ${size} ${size}`}
        width=${size}
        height=${size}
        role="img"
        aria-label="Filled area between two arc circles"
      >
        <polygon
          points=${this.arcPoints}
          fill=${props.fill}
          stroke=${props.stroke}
          stroke-width=${props.strokeWidth}
          vector-effect="non-scaling-stroke"
        ></polygon>
      </svg>
    `

    return html`
      <svg-template-host .templateInput=${template}></svg-template-host>
    `
  }

  static styles = dualSectorShapeStyles
}

declare global {
  interface HTMLElementTagNameMap {
    'dual-sector-shape': DualSectorShape
  }
}
