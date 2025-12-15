import { IReactiveController } from "./IReactiveController.js";
import { IShape } from "./IShape.js";
import { Shape } from "./Shape.js";

// ============================================================================
// ShapeController linking Shape <-> Host lifecycle
// ============================================================================

export interface IShapeController extends IReactiveController {
    readonly shape: IShape;
    readonly instance: Shape | undefined;
    ensureShape(): Shape;
}
