import { Fragment } from "./Fragment.js";
import { Rectangle } from "./Rectangle.js";

export abstract class GeometryFragment<
    TSelf extends GeometryFragment<TSelf>,
> extends Fragment<TSelf> {
    public center(): { readonly x: number; readonly y: number } {
        return this.rectangle.center;
    }

    public area(): number {
        return this.rectangle.area;
    }

    protected abstract override withRectangle(rectangle: Rectangle): TSelf;
}
