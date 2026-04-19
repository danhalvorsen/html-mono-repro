import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../svg-template-host/svg-template-host.js'
import type { CircleShapeProperties } from '../../domain/shape-properties.js'
import { svgShapeTemplateFactory } from '../svg-shape-template-factory/svg-shape-template-factory.js'
import {
  circleShapeStyles,
  circleShapeTheme,
} from '../../application/ui-style-module.js'

@customElement('circle-shape')
export class CircleShape extends LitElement {
  @property({ type: Number })
  radius = 60

  @property({ type: String })
  fill = circleShapeTheme.fill

  @property({ type: String })
  stroke = circleShapeTheme.stroke

  @property({ type: Number, attribute: 'stroke-width' })
  strokeWidth = circleShapeTheme.strokeWidth

  private get normalizedRadius() {
    return Math.max(2, this.radius)
  }

  private get size() {
    return this.normalizedRadius * 2 + this.strokeWidth * 2
  }

  private get shapeProps(): CircleShapeProperties {
    return {
      radius: this.normalizedRadius,
      fill: this.fill,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
    }
  }

  render() {
    const props = this.shapeProps
    const size = this.size
    const center = size / 2
    const template = svgShapeTemplateFactory.createSvg(
      {
        viewBox: `0 0 ${size} ${size}`,
        width: size,
        height: size,
        role: 'img',
        ariaLabel: 'Circle feature',
      },
      [
        svgShapeTemplateFactory.createCircle({
          cx: center,
          cy: center,
          r: props.radius,
          fill: props.fill,
          stroke: props.stroke,
          strokeWidth: props.strokeWidth,
        }),
      ],
    )

    return html`
      <svg-template-host .templateInput=${template}></svg-template-host>
    `
  }

  static styles = circleShapeStyles
}

declare global {
  interface HTMLElementTagNameMap {
    'circle-shape': CircleShape
  }
}
