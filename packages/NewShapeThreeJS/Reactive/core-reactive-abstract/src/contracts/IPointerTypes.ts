// src/contracts/IPointerTypes.ts

export interface IPosition {
  readonly x: number;
  readonly y: number;
}

export interface IMouseDragMove {
  readonly dx: number;
  readonly dy: number;
  readonly current: IPosition;
}