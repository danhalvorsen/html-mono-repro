import type { IStyle } from '@monorepo/core-style-system'

export interface ISvgStyle {
  readonly stroke: string
  readonly fill: string
  readonly strokeWidth: number
  readonly strokeDasharray: string
  readonly opacity: number
}

export class SvgStyleAdapter {
  public adapt(style?: Readonly<IStyle>): ISvgStyle {
    return {
      stroke: style?.stroke?.color ?? 'transparent',
      fill: style?.fill?.color ?? 'transparent',
      strokeWidth: style?.stroke?.width ?? 1,
      strokeDasharray: (style?.stroke?.dash ?? []).join(' '),
      opacity: style?.opacity ?? 1,
    }
  }
}
