import { Shape } from "../shape.js";

export class Cube extends Shape {
    readonly type = "cube";

    constructor(public width: number, public height: number, public depth: number) {
        super();
    }

    render() {
        return {
            type: this.type,
            width: this.width,
            height: this.height,
            depth: this.depth
        };
    }
}
