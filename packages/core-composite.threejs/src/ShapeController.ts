import { IShapeController } from "./IShapeController.js";
import { IShape } from "./IShape.js";
import { Shape } from "./Shape.js";


export abstract class ShapeController implements IShapeController {
    instance: Shape | undefined;

    constructor(public readonly shape: IShape) { }

    ensureShape(): Shape {
        if (!this.instance) {
            this.instance = this.shape.createShape();
        }
        return this.instance;
    }

    hostConnected(): void { }
    hostDisconnected(): void { this.instance = undefined; }

    hostUpdate(): void {
        if (this.instance) {
            this.shape.updateShape(this.instance);
        }
    }

    hostUpdated(): void { }
}
