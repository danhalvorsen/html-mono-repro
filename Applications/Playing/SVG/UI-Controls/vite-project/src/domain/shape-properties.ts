export type StrokeLinecap = 'butt' | 'round' | 'square'

export interface FillProperties {
  readonly fill: string
}

export interface StrokeProperties {
  readonly stroke: string
  readonly strokeWidth: number
}

export interface FillStrokeProperties extends FillProperties, StrokeProperties {}

export interface RadiusProperties {
  readonly radius: number
}

export interface RadiusRangeProperties {
  readonly radiusMin: number
  readonly radiusMax: number
}

export interface SizeProperties {
  readonly width: number
  readonly height: number
}

export interface CornerRadiusProperties {
  readonly rx: number
  readonly ry: number
}

export interface AngleRangeProperties {
  readonly minAngle: number
  readonly maxAngle: number
}

export interface SweepProperties {
  readonly startAngle: number
  readonly endAngle: number
  readonly openingStartAngle: number
  readonly clockwise: boolean
}

export interface SegmentedProperties {
  readonly segments: number
}

export interface ValueProperties {
  readonly value: number
}

export interface CircleShapeProperties
  extends FillStrokeProperties,
    RadiusProperties {}

export interface RectangleShapeProperties
  extends FillStrokeProperties,
    SizeProperties,
    CornerRadiusProperties {}

export interface TriangleShapeProperties
  extends FillStrokeProperties {
  readonly side: number
}

export interface LineShapeProperties
  extends StrokeProperties,
    SizeProperties {
  readonly x1: number
  readonly y1: number
  readonly x2: number
  readonly y2: number
  readonly lineCap: StrokeLinecap
  readonly dashArray: string
}

export interface DualSectorShapeProperties
  extends FillStrokeProperties,
    RadiusRangeProperties,
    SweepProperties,
    SegmentedProperties {}

export interface KnobIndicatorLineProperties {
  readonly color: string
  readonly width: number
  readonly innerRatio: number
  readonly outerRatio: number
  readonly lineCap: StrokeLinecap
  readonly opacity: number
}

export interface KnobShapeProperties
  extends FillStrokeProperties,
    ValueProperties,
    AngleRangeProperties {
  readonly size: number
  readonly indicator: KnobIndicatorLineProperties
}

export interface TriangleIndicatorKnobProperties
  extends FillStrokeProperties,
    ValueProperties,
    AngleRangeProperties {
  readonly size: number
  readonly indicatorDistanceRatio: number
  readonly indicatorSide: number
  readonly indicatorFill: string
  readonly indicatorStroke: string
  readonly indicatorStrokeWidth: number
}
