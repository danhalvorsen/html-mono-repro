export type OrientedSharedLine = {
  readonly kind: "V";
  
  readonly x: number;
  readonly y1: number;
  readonly y2: number;
} |
{
  readonly kind: "H";
  readonly y: number;
  readonly x1: number;
  readonly x2: number;
};
