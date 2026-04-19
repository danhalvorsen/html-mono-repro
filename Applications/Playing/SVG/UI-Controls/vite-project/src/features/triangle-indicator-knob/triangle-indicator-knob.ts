import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../knob-shape/knob-shape.js'
import '../triangle-shape/triangle-shape.js'
import { CartesianToSvgMapper } from '../../domain/cartesian-to-svg-mapper.js'
import type { TriangleIndicatorKnobProperties } from '../../domain/shape-properties.js'
import {
  triangleKnobStyles,
  triangleKnobTheme,
} from '../../application/ui-style-module.js'

@customElement('triangle-indicator-knob')
export class TriangleIndicatorKnob extends LitElement {
  @property({ type: Number })
  size = 160

  @property({ type: Number })
  value = 0.62

  @property({ type: Number, attribute: 'min-angle' })
  minAngle = -140

  @property({ type: Number, attribute: 'max-angle' })
  maxAngle = 140

  @property({ type: Number, attribute: 'indicator-distance-ratio' })
  indicatorDistanceRatio = 0.82

  @property({ type: Number, attribute: 'indicator-side' })
  indicatorSide = 22

  @property({ type: String, attribute: 'indicator-fill' })
  indicatorFill = triangleKnobTheme.indicatorFill

  @property({ type: String, attribute: 'indicator-stroke' })
  indicatorStroke = triangleKnobTheme.indicatorStroke

  @property({ type: Number, attribute: 'indicator-stroke-width' })
  indicatorStrokeWidth = triangleKnobTheme.indicatorStrokeWidth

  @property({ type: String, attribute: 'face-fill' })
  faceFill = triangleKnobTheme.faceFill

  @property({ type: String, attribute: 'face-stroke' })
  faceStroke = triangleKnobTheme.faceStroke

  @property({ type: Number, attribute: 'face-stroke-width' })
  faceStrokeWidth = triangleKnobTheme.faceStrokeWidth

  private get normalizedSize() {
    return Math.max(32, this.size)
  }

  private get normalizedValue() {
    return Math.min(1, Math.max(0, this.value))
  }

  private get normalizedIndicatorDistanceRatio() {
    return Math.min(1, Math.max(0, this.indicatorDistanceRatio))
  }

  private get normalizedIndicatorSide() {
    return Math.max(8, this.indicatorSide)
  }

  private get normalizedIndicatorStrokeWidth() {
    return Math.max(0.5, this.indicatorStrokeWidth)
  }

  private get angleDeg() {
    return this.minAngle + this.normalizedValue * (this.maxAngle - this.minAngle)
  }

  private get indicatorRotationDeg() {
    // Triangle points up at 0deg, so add 90deg to align with knob angle where 0deg points right.
    return this.angleDeg + 90
  }

  private get indicatorPoint() {
    const props = this.shapeProps
    const size = props.size
    const center = size / 2
    const knobRadius = center - Math.max(props.strokeWidth, props.indicatorStrokeWidth)
    const indicatorRadius = knobRadius * props.indicatorDistanceRatio
    const mapper = new CartesianToSvgMapper(center, center, 0, 'clockwise')
    return mapper.mapPolarToSvg(indicatorRadius, props.minAngle + props.value * (props.maxAngle - props.minAngle))
  }

  private get shapeProps(): TriangleIndicatorKnobProperties {
    return {
      size: this.normalizedSize,
      value: this.normalizedValue,
      minAngle: this.minAngle,
      maxAngle: this.maxAngle,
      fill: this.faceFill,
      stroke: this.faceStroke,
      strokeWidth: this.faceStrokeWidth,
      indicatorDistanceRatio: this.normalizedIndicatorDistanceRatio,
      indicatorSide: this.normalizedIndicatorSide,
      indicatorFill: this.indicatorFill,
      indicatorStroke: this.indicatorStroke,
      indicatorStrokeWidth: this.normalizedIndicatorStrokeWidth,
    }
  }

  render() {
    const props = this.shapeProps
    const size = props.size
    const indicatorPoint = this.indicatorPoint
    const indicatorStyle = [
      `left:${indicatorPoint.x}px`,
      `top:${indicatorPoint.y}px`,
      `transform:translate(-50%,-50%) rotate(${this.indicatorRotationDeg}deg)`,
    ].join(';')

    return html`
      <section class="knob" style=${`width:${size}px;height:${size}px;`}>
        <knob-shape
          class="face"
          .size=${size}
          .value=${props.value}
          .minAngle=${props.minAngle}
          .maxAngle=${props.maxAngle}
          .faceFill=${props.fill}
          .faceStroke=${props.stroke}
          .faceStrokeWidth=${props.strokeWidth}
          .indicatorOpacity=${0}
        ></knob-shape>

        <div class="indicator" style=${indicatorStyle}>
          <triangle-shape
            compact
            .side=${props.indicatorSide}
            .fill=${props.indicatorFill}
            .stroke=${props.indicatorStroke}
            .strokeWidth=${props.indicatorStrokeWidth}
          ></triangle-shape>
        </div>
      </section>
    `
  }

  static styles = triangleKnobStyles
}

declare global {
  interface HTMLElementTagNameMap {
    'triangle-indicator-knob': TriangleIndicatorKnob
  }
}
