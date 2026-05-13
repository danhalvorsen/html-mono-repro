import { Vector2 } from "@monorepo/core-math";

export class Constants {
  public static readonly posX: number = 100;
  public static readonly posY: number = 100;

  public static readonly position: Vector2 = new Vector2(
    Constants.posX,
    Constants.posY,
  );

  public static readonly width: number = 800;
  public static readonly height: number = 600;
  public static readonly mainBorderWidth: number = 10;
  public static readonly gravity: number = 9.8;

  public static readonly numberColumns: number = 12;
  public static readonly columnBorderWidth: number = 2;

  public static readonly columnWidth: number =
    (Constants.width -
      (Constants.numberColumns - 1) * Constants.columnBorderWidth) /
    Constants.numberColumns;

  public static readonly columnHeight: number =
    Constants.height - Constants.mainBorderWidth;
}
