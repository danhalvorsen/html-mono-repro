export type Position = Readonly<{
  x: number;
  y: number;
}>;

export type MouseDragMove = Readonly<{
  dx: number;
  dy: number;
  current: Position;
}>;

export type Handle = "nw" | "ne" | "se" | "sw";

export type RectModel = {
  x: number;
  y: number;
  w: number;
  h: number;
};