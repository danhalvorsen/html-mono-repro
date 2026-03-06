export type Position = Readonly<{
  x: number;
  y: number;
}>;

export type MouseDragMove = Readonly<{
  dx: number;
  dy: number;
  current: Position;
}>;
