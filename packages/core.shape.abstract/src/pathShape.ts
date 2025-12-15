import { Shape } from "./shape.js";

export class PathShape extends Shape {
    render(): unknown {
        throw new Error("Method not implemented.");
    }
    readonly type = "path";
    constructor(
        public readonly points: Array<{ x: number; y: number }>
    ) { super(); }
}
