import { Shape } from "./shape.js";

export class ShapeGroup extends Shape {
    render(): unknown {
        throw new Error("Method not implemented.");
    }
    readonly type = "group";
    constructor(
        public readonly children: Shape[]
    ) { super(); }
}
