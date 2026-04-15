export class Point {
  public readonly x: number;
  public readonly y: number;
  public readonly label: string;

  public constructor(x: number, y: number, label: string) {
    this.x = x;
    this.y = y;
    this.label = label;
  }
}
