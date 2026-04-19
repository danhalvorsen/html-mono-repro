import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../svg-template-host/svg-template-host.js'
import { CartesianToSvgMapper } from '../../domain/cartesian-to-svg-mapper.js'
import type {
  UiShape,
  UiTheme,
  UiVariant,
} from '../../domain/design-variants.js'
import type {
  KnobShapeProperties,
  StrokeLinecap,
} from '../../domain/shape-properties.js'
import { svgShapeTemplateFactory } from '../svg-shape-template-factory/svg-shape-template-factory.js'
import { knobShapeStyles, knobShapeTheme } from '../../application/ui-style-module.js'

@customElement('knob-shape')
export class KnobShape extends LitElement {
  @property({ type: Number })
  size = 140

  @property({ type: Number })
  value = 0.72

  @property({ type: String, reflect: true })
  variant: UiVariant = 'flat'

  @property({ type: String, reflect: true })
  theme: UiTheme = 'dark'

  @property({ type: String, reflect: true })
  shape: UiShape = 'round'

  @property({ type: Number, attribute: 'min-angle' })
  minAngle = -140

  @property({ type: Number, attribute: 'max-angle' })
  maxAngle = 140

  @property({ type: Number, attribute: 'indicator-inner-ratio' })
  indicatorInnerRatio = 0.2

  @property({ type: Number, attribute: 'indicator-outer-ratio' })
  indicatorOuterRatio = 0.78

  @property({ type: Number, attribute: 'indicator-offset-ratio' })
  indicatorOffsetRatio = 0.2

  @property({ type: Number, attribute: 'indicator-length-ratio' })
  indicatorLengthRatio = 0.58

  @property({ type: String, attribute: 'face-fill' })
  faceFill = knobShapeTheme.faceFill

  @property({ type: String, attribute: 'face-stroke' })
  faceStroke = knobShapeTheme.faceStroke

  @property({ type: Number, attribute: 'face-stroke-width' })
  faceStrokeWidth = knobShapeTheme.faceStrokeWidth

  @property({ type: String, attribute: 'indicator-stroke' })
  indicatorStroke = knobShapeTheme.indicatorStroke

  @property({ type: String, attribute: 'indicator-color' })
  indicatorColor = ''

  @property({ type: Number, attribute: 'indicator-stroke-width' })
  indicatorStrokeWidth = knobShapeTheme.indicatorStrokeWidth

  @property({ type: Number, attribute: 'indicator-width' })
  indicatorWidth = 0

  @property({ type: String, attribute: 'indicator-linecap' })
  indicatorLinecap: StrokeLinecap = 'round'

  @property({ type: Number, attribute: 'indicator-opacity' })
  indicatorOpacity = 1

  private get normalizedSize() {
    return Math.max(24, this.size)
  }

  private get normalizedValue() {
    return Math.min(1, Math.max(0, this.value))
  }

  private get normalizedInnerRatio() {
    return Math.min(0.95, Math.max(0, this.indicatorInnerRatio))
  }

  private get normalizedOuterRatio() {
    return Math.min(1, Math.max(this.normalizedInnerRatio, this.indicatorOuterRatio))
  }

  private get normalizedOffsetRatio() {
    return Math.min(0.98, Math.max(0, this.indicatorOffsetRatio))
  }

  private get normalizedLengthRatio() {
    const maxLength = 1 - this.normalizedOffsetRatio
    return Math.min(maxLength, Math.max(0.02, this.indicatorLengthRatio))
  }

  private get usingLegacyRatioInput() {
    return (
      this.hasAttribute('indicator-inner-ratio') ||
      this.hasAttribute('indicator-outer-ratio')
    )
  }

  private get resolvedIndicatorInnerRatio() {
    return this.usingLegacyRatioInput
      ? this.normalizedInnerRatio
      : this.normalizedOffsetRatio
  }

  private get resolvedIndicatorOuterRatio() {
    return this.usingLegacyRatioInput
      ? this.normalizedOuterRatio
      : Math.min(1, this.resolvedIndicatorInnerRatio + this.normalizedLengthRatio)
  }

  private get resolvedIndicatorColor() {
    const customColor = this.indicatorColor.trim()
    if (customColor !== '') {
      return customColor
    }
    if (this.hasAttribute('indicator-stroke')) {
      return this.indicatorStroke
    }
    if (this.variant === 'neon') {
      return 'var(--color-accent)'
    }
    if (this.variant === 'retro') {
      return '#111827'
    }
    if (this.variant === 'rack') {
      return 'var(--color-led-active)'
    }
    if (this.theme === 'light') {
      return '#0f172a'
    }
    return this.indicatorStroke
  }

  private get resolvedIndicatorWidth() {
    const width = this.indicatorWidth > 0 ? this.indicatorWidth : this.indicatorStrokeWidth
    return Math.max(0.5, width)
  }

  private get normalizedIndicatorOpacity() {
    return Math.min(1, Math.max(0, this.indicatorOpacity))
  }

  private get resolvedFaceFill() {
    if (this.hasAttribute('face-fill')) {
      return this.faceFill
    }
    if (this.variant === 'neon') {
      return 'var(--color-bg)'
    }
    if (this.variant === 'retro') {
      return 'var(--color-warning)'
    }
    if (this.variant === 'rack') {
      return 'var(--color-clip)'
    }
    if (this.theme === 'light') {
      return '#e2e8f0'
    }
    return this.faceFill
  }

  private get resolvedFaceStroke() {
    if (this.hasAttribute('face-stroke')) {
      return this.faceStroke
    }
    if (this.variant === 'neon') {
      return 'var(--color-accent)'
    }
    if (this.variant === 'retro') {
      return '#7c2d12'
    }
    if (this.variant === 'rack') {
      return 'var(--color-accent)'
    }
    if (this.theme === 'light') {
      return '#64748b'
    }
    return this.faceStroke
  }

  private get resolvedIndicatorLinecap(): StrokeLinecap {
    if (this.hasAttribute('indicator-linecap')) {
      return this.indicatorLinecap
    }
    if (this.shape === 'linear') {
      return 'butt'
    }
    if (this.shape === 'square' || this.shape === 'key') {
      return 'square'
    }
    return 'round'
  }

  private polarPoint(radius: number, angleDeg: number) {
    const mapper = new CartesianToSvgMapper(0, 0, 0, 'clockwise')
    return mapper.mapPolarToSvg(radius, angleDeg)
  }

  private get shapeProps(): KnobShapeProperties {
    return {
      size: this.normalizedSize,
      value: this.normalizedValue,
      minAngle: this.minAngle,
      maxAngle: this.maxAngle,
      fill: this.resolvedFaceFill,
      stroke: this.resolvedFaceStroke,
      strokeWidth: this.faceStrokeWidth,
      indicator: {
        color: this.resolvedIndicatorColor,
        width: this.resolvedIndicatorWidth,
        innerRatio: this.resolvedIndicatorInnerRatio,
        outerRatio: this.resolvedIndicatorOuterRatio,
        lineCap: this.resolvedIndicatorLinecap,
        opacity: this.normalizedIndicatorOpacity,
      },
    }
  }

  render() {
    const props = this.shapeProps
    const size = props.size
    const center = size / 2
    const radius = center - Math.max(props.strokeWidth, props.indicator.width)
    const angle = props.minAngle + props.value * (props.maxAngle - props.minAngle)
    const inner = this.polarPoint(radius * props.indicator.innerRatio, angle)
    const outer = this.polarPoint(radius * props.indicator.outerRatio, angle)

    const template = svgShapeTemplateFactory.createSvg(
      {
        viewBox: `0 0 ${size} ${size}`,
        width: size,
        height: size,
        role: 'img',
        ariaLabel: 'Flat knob shape with indicator',
      },
      [
        svgShapeTemplateFactory.createCircle({
          cx: center,
          cy: center,
          r: radius,
          fill: props.fill,
          stroke: props.stroke,
          strokeWidth: props.strokeWidth,
        }),
        svgShapeTemplateFactory.createLine({
          x1: center + inner.x,
          y1: center + inner.y,
          x2: center + outer.x,
          y2: center + outer.y,
          stroke: props.indicator.color,
          strokeWidth: props.indicator.width,
          lineCap: props.indicator.lineCap,
        }),
      ],
    )

    return html`
      <svg-template-host compact .templateInput=${template}></svg-template-host>
    `
  }

  static styles = knobShapeStyles
}

declare global {
  interface HTMLElementTagNameMap {
    'knob-shape': KnobShape
  }
}
