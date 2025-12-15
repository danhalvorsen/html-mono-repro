import { IShapeController } from "./IShapeController.js";
import { IShape } from "./IShape.js";
import { BaseReactiveElement } from "./BaseReactiveElement.js";
import { Shape } from "./Shape.js";
import { ShapeController } from "./ShapeController.js";

// ============================================================================
// Example Host that gathers shapes and renders them
// ============================================================================
export class ThreeLikeHost extends BaseReactiveElement {
    private shapeControllers: IShapeController[] = [];

    addShape(shape: IShape) {
        const ctrl = new (class extends ShapeController { })(shape);
        this.shapeControllers.push(ctrl as unknown as IShapeController);
        this.addController(ctrl as unknown as IShapeController);
        this.requestUpdate(); // schedule render
    }

    protected render() {
        return this.shapeControllers.map(c => c.ensureShape());
    }

    protected processRender(shapes: Shape[]) {
        // Here you would push shapes to ThreeJS, WebGPU, etc.
        // For now: log the rotations
        for (const s of shapes) {
            console.log("Rendering shape:", s);
        }
    }
}
