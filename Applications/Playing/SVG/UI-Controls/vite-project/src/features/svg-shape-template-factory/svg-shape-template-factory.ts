import { html, nothing, svg, type TemplateResult } from 'lit'

export interface SvgShapeTemplateFrame {
  readonly viewBox: string
  readonly width: number
  readonly height: number
  readonly role?: string
  readonly ariaLabel?: string
}

export interface SvgCircleTemplate {
  readonly cx: number
  readonly cy: number
  readonly r: number
  readonly fill?: string
  readonly stroke?: string
  readonly strokeWidth?: number
}

export interface SvgRectangleTemplate {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
  readonly rx?: number
  readonly ry?: number
  readonly fill?: string
  readonly stroke?: string
  readonly strokeWidth?: number
}

export interface SvgLineTemplate {
  readonly x1: number
  readonly y1: number
  readonly x2: number
  readonly y2: number
  readonly stroke?: string
  readonly strokeWidth?: number
  readonly lineCap?: 'butt' | 'round' | 'square'
  readonly dashArray?: string
}

export interface SvgPolygonTemplate {
  readonly points: string
  readonly fill?: string
  readonly stroke?: string
  readonly strokeWidth?: number
  readonly vectorEffect?: 'none' | 'non-scaling-stroke'
}

export interface SvgTextTemplate {
  readonly x: number
  readonly y: number
  readonly value: string
  readonly fill?: string
  readonly fontSize?: number
  readonly textAnchor?: 'start' | 'middle' | 'end'
}

export class SvgShapeTemplateFactory {
  public createSvg(frame: SvgShapeTemplateFrame, children: readonly TemplateResult[]): TemplateResult {
    return html`
      <svg
        viewBox=${frame.viewBox}
        width=${frame.width}
        height=${frame.height}
        role=${frame.role ?? nothing}
        aria-label=${frame.ariaLabel ?? nothing}
      >
        ${children}
      </svg>
    `
  }

  public createGroup(children: readonly TemplateResult[]): TemplateResult {
    return svg`
      <g>
        ${children}
      </g>
    `
  }

  public createCircle(shape: SvgCircleTemplate): TemplateResult {
    return svg`
      <circle
        cx=${shape.cx}
        cy=${shape.cy}
        r=${shape.r}
        fill=${shape.fill ?? 'none'}
        stroke=${shape.stroke ?? 'none'}
        stroke-width=${shape.strokeWidth ?? 0}
      ></circle>
    `
  }

  public createRectangle(shape: SvgRectangleTemplate): TemplateResult {
    return svg`
      <rect
        x=${shape.x}
        y=${shape.y}
        width=${shape.width}
        height=${shape.height}
        rx=${shape.rx ?? 0}
        ry=${shape.ry ?? 0}
        fill=${shape.fill ?? 'none'}
        stroke=${shape.stroke ?? 'none'}
        stroke-width=${shape.strokeWidth ?? 0}
      ></rect>
    `
  }

  public createLine(shape: SvgLineTemplate): TemplateResult {
    return svg`
      <line
        x1=${shape.x1}
        y1=${shape.y1}
        x2=${shape.x2}
        y2=${shape.y2}
        stroke=${shape.stroke ?? 'none'}
        stroke-width=${shape.strokeWidth ?? 0}
        stroke-linecap=${shape.lineCap ?? 'butt'}
        stroke-dasharray=${shape.dashArray ?? ''}
      ></line>
    `
  }

  public createPolygon(shape: SvgPolygonTemplate): TemplateResult {
    return svg`
      <polygon
        points=${shape.points}
        fill=${shape.fill ?? 'none'}
        stroke=${shape.stroke ?? 'none'}
        stroke-width=${shape.strokeWidth ?? 0}
        vector-effect=${shape.vectorEffect ?? 'none'}
      ></polygon>
    `
  }

  public createPath(shape: {
    readonly d: string
    readonly fill?: string
    readonly stroke?: string
    readonly strokeWidth?: number
    readonly lineCap?: 'butt' | 'round' | 'square'
  }): TemplateResult {
    return svg`
      <path
        d=${shape.d}
        fill=${shape.fill ?? 'none'}
        stroke=${shape.stroke ?? 'none'}
        stroke-width=${shape.strokeWidth ?? 0}
        stroke-linecap=${shape.lineCap ?? 'butt'}
      ></path>
    `
  }

  public createText(shape: SvgTextTemplate): TemplateResult {
    return svg`
      <text
        x=${shape.x}
        y=${shape.y}
        fill=${shape.fill ?? 'currentColor'}
        font-size=${shape.fontSize ?? 12}
        text-anchor=${shape.textAnchor ?? 'start'}
      >
        ${shape.value}
      </text>
    `
  }
}

export const svgShapeTemplateFactory = new SvgShapeTemplateFactory()