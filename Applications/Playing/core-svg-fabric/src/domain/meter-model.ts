export interface MeterGeometry {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface MeterStyle {
  readonly trackFill: string;
  readonly trackStroke: string;
  readonly levelFill: string;
}

export interface MeterValue {
  readonly value: number;
  readonly min: number;
  readonly max: number;
}

export interface MeterModel {
  readonly id: string;
  readonly geometry: MeterGeometry;
  readonly style: MeterStyle;
  readonly value: MeterValue;
}
