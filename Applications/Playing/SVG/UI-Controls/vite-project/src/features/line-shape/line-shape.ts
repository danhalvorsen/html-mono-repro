import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../svg-template-host/svg-template-host.js'
import type { LineShapeProperties } from '../../domain/shape-properties.js'
import { svgShapeTemplateFactory } from '../svg-shape-template-factory/svg-shape-template-factory.js'
import { lineShapeStyles, lineShapeTheme } from '../../application/ui-style-module.js'

@customElement('line-shape')
export class LineShape extends LitElement {
  @property({ type: Number })
  width = 220

  @property({ type: Number })
  height = 80

  @property({ type: Number })
  x1 = 10

  @property({ type: Number })
  y1 = 40

  @property({ type: Number })
  x2 = 210

  @property({ type: Number })
  y2 = 40

  @property({ type: String })
  stroke = lineShapeTheme.stroke

  @property({ type: Number, attribute: 'stroke-width' })
  strokeWidth = lineShapeTheme.strokeWidth

  @property({ type: String, attribute: 'line-cap' })
  lineCap: 'butt' | 'round' | 'square' = 'round'

  @property({ type: String, attribute: 'dash-array' })
  dashArray = ''

  private get normalizedWidth() {
    return Math.max(2, this.width)
  }

  private get normalizedHeight() {
    return Math.max(2, this.height)
  }

  private get shapeProps(): LineShapeProperties {
    return {
      width: this.normalizedWidth,
      height: this.normalizedHeight,
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
      lineCap: this.lineCap,
      dashArray: this.dashArray,
    }
  }

  render() {
    const props = this.shapeProps
    const template = svgShapeTemplateFactory.createSvg(
      {
        viewBox: `0 0 ${props.width} ${props.height}`,
        width: props.width,
        height: props.height,
        role: 'img',
        ariaLabel: 'Line feature',
      },
      [
        svgShapeTemplateFactory.createLine({
          x1: props.x1,
          y1: props.y1,
          x2: props.x2,
          y2: props.y2,
          stroke: props.stroke,
          strokeWidth: props.strokeWidth,
          lineCap: props.lineCap,
          dashArray: props.dashArray,
        }),
      ],
    )

    return html`
      <svg-template-host compact .templateInput=${template}></svg-template-host>
    `
  }

  static styles = lineShapeStyles
}

declare global {
  interface HTMLElementTagNameMap {
    'line-shape': LineShape
  }
}
