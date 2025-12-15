import { Shape } from "../shape.js";

export class Sphere extends Shape {
    readonly type = "sphere";

    constructor(public radius: number) {
        super();
    }

    render() {
        return {
            type: this.type,
            radius: this.radius
        };
    }
}