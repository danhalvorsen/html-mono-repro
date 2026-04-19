export type AngleDirection = 'clockwise' | 'counterclockwise'

export interface SvgPoint {
  readonly x: number
  readonly y: number
}

export class CartesianToSvgMapper {
  private readonly centerX: number
  private readonly centerY: number
  private readonly zeroAngleDegrees: number
  private readonly positiveAngleDirection: AngleDirection

  constructor(
    centerX: number,
    centerY: number,
    zeroAngleDegrees = 0,
    positiveAngleDirection: AngleDirection = 'clockwise',
  ) {
    this.centerX = centerX
    this.centerY = centerY
    this.zeroAngleDegrees = zeroAngleDegrees
    this.positiveAngleDirection = positiveAngleDirection
  }

  mapCartesianToSvg(x: number, y: number): SvgPoint {
    return {
      x: this.centerX + x,
      y: this.centerY - y,
    }
  }

  mapPolarToSvg(radius: number, angleDegrees: number): SvgPoint {
    const directedAngle =
      this.positiveAngleDirection === 'clockwise'
        ? -angleDegrees
        : angleDegrees
    const radians = this.toRadians(this.zeroAngleDegrees + directedAngle)
    const cartesianX = Math.cos(radians) * radius
    const cartesianY = Math.sin(radians) * radius
    return this.mapCartesianToSvg(cartesianX, cartesianY)
  }

  private toRadians(degrees: number) {
    return (degrees * Math.PI) / 180
  }
}
