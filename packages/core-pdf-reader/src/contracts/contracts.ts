
export interface IPosition {
  readonly x: number;
  readonly y: number; 

}

export interface IBoundingBox {
  readonly position: IPosition;
  readonly width: number;
  readonly height: number;
}

export interface IFontInformation {
  readonly name: string;
  readonly size: number;
  readonly family?: string;
  readonly rawName?: string;
}
