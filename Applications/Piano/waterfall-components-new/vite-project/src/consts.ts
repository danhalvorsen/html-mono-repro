import { Vector2 } from "@monorepo/core-math";

export class Constants {
  static readonly posX: number = 100;
  static readonly posY: number = 100;
  static readonly position: Vector2 = new Vector2(
    Constants.posX,
    Constants.posY,
  );
  static readonly width = 800;
  static readonly height = 600;
  static readonly mainBorderWidth = 10;
  static readonly gravity = 9.8;
//Colums
  static readonly numberColumns = 12;
  static readonly columnBorderWidth = 2;
  static readonly columnWidth =
    (Constants.width -
      (Constants.numberColumns - 1) * Constants.columnBorderWidth) /
    Constants.numberColumns;
  static readonly columnHeight = Constants.height - Constants.mainBorderWidth;
}
