
export type LatitudeRef = "N" | "S";
export type LongitudeRef = "E" | "W";

export class GpsCoordinate {
  private constructor(public readonly degrees: number) {}

  static fromDecimalDegrees(value: number): GpsCoordinate {
    if (!Number.isFinite(value)) throw new TypeError("GPS coordinate must be finite");
    if (value < -180 || value > 180) throw new RangeError("GPS coordinate out of range");
    return new GpsCoordinate(value);
  }
}

