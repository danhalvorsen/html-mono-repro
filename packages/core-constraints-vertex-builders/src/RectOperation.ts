import type { IPlacementOperation } from "./IPlacementOperation.js";
import type { IPointPlacementOperation } from "./IPointPlacementOperation.js";
import type { IRotationOperation } from "./IRotationOperation.js";

export type RectOperation = IPlacementOperation |
  IPointPlacementOperation |
  IRotationOperation;
