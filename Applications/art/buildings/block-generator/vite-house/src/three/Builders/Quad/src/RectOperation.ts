import type { IPlacementOperation } from "./IPlacementOperation";
import type { IPointPlacementOperation } from "./IPointPlacementOperation";
import type { IRotationOperation } from "./IRotationOperation";


export type RectOperation = IPlacementOperation |
  IPointPlacementOperation |
  IRotationOperation;
