import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../svg-template-host/svg-template-host.js'
import type { RectangleShapeProperties } from '../../domain/shape-properties.js'
import {
  rectangleShapeStyles,
  rectangleShapeTheme,
} from '../../application/ui-style-module.js'

@customElement('rectangle-shape')
export class RectangleShape extends LitElement {
  @property({ type: Number })
  width = 140

  @property({ type: Number })
  height = 84

  @property({ type: Number })
  rx = 14

  @property({ type: Number })
  ry = 14

  @property({ type: String })
  fill = rectangleShapeTheme.fill

  @property({ type: String })
  stroke = rectangleShapeTheme.stroke

  @property({ type: Number, attribute: 'stroke-width' })
  strokeWidth = rectangleShapeTheme.strokeWidth

  private get normalizedWidth() {
    return Math.max(2, this.width)
  }

  private get normalizedHeight() {
    return Math.max(2, this.height)
  }

  private get normalizedRx() {
    return Math.max(0, this.rx)
  }

  private get normalizedRy() {
    return Math.max(0, this.ry)
  }

  private get viewWidth() {
    return this.normalizedWidth + this.strokeWidth * 2
  }

  private get viewHeight() {
    return this.normalizedHeight + this.strokeWidth * 2
  }

  private get shapeProps(): RectangleShapeProperties {
    return {
      width: this.normalizedWidth,
      height: this.normalizedHeight,
      rx: this.normalizedRx,
      ry: this.normalizedRy,
      fill: this.fill,
      stroke: this.stroke,
      strokeWidth: this.strokeWidth,
    }
  }

  render() {
    const props = this.shapeProps
    const viewWidth = this.viewWidth
    const viewHeight = this.viewHeight
    const x = props.strokeWidth
    const y = props.strokeWidth

    const template = html`
      <svg
        viewBox=${`0 0 ${viewWidth} ${viewHeight}`}
        width=${viewWidth}
        height=${viewHeight}
        role="img"
        aria-label="Rectangle feature"
      >
        <rect
          x=${x}
          y=${y}
          width=${props.width}
          height=${props.height}
          rx=${props.rx}
          ry=${props.ry}
          fill=${props.fill}
          stroke=${props.stroke}
          stroke-width=${props.strokeWidth}
        ></rect>
      </svg>
    `

    return html`
      <svg-template-host .templateInput=${template}></svg-template-host>
    `
  }

  static styles = rectangleShapeStyles
}

declare global {
  interface HTMLElementTagNameMap {
    'rectangle-shape': RectangleShape
  }
}
