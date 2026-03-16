import { IShape } from "../lit3/WebComponents/Shapes/Shape/IShape.js";
import { IHitTestable } from "../Pipeline/Contracts/IHitTestable.js";
import { IPositionable } from "../Pipeline/Contracts/IPositionable.js";

export interface IDraggable extends IHitTestable, IPositionable {
    readonly shape: IShape;
}
