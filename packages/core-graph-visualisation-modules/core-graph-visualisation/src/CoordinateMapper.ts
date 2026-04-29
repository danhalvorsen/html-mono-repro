export interface CartesianPoint {
  readonly x: number;
  readonly y: number;
}

export interface SvgPoint {
  readonly x: number;
  readonly y: number;
}

export interface CoordinateBounds {
  readonly width: number;
  readonly height: number;
}

export interface CoordinateOrigin {
  readonly x: number;
  readonly y: number;
}

export interface ICoordinateMapper {
  toSvg(point: CartesianPoint): SvgPoint;
  toCartesian(point: SvgPoint): CartesianPoint;
}

export class SvgCartesianCoordinateMapper implements ICoordinateMapper {
  private readonly origin: CoordinateOrigin;

  constructor(bounds: CoordinateBounds) {
    this.validateBounds(bounds);
    this.origin = {
      x: bounds.width / 2,
      y: bounds.height / 2,
    };
  }

  toSvg(point: CartesianPoint): SvgPoint {
    return {
      x: this.origin.x + point.x,
      y: this.origin.y - point.y,
    };
  }

  toCartesian(point: SvgPoint): CartesianPoint {
    return {
      x: point.x - this.origin.x,
      y: this.origin.y - point.y,
    };
  }

  private validateBounds(bounds: CoordinateBounds): void {
    if (bounds.width <= 0) {
      throw new Error("Coordinate bounds width must be greater than zero.");
    }

    if (bounds.height <= 0) {
      throw new Error("Coordinate bounds height must be greater than zero.");
    }
  }
}
