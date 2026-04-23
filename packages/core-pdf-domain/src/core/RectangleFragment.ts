import type { IPdfRectangleFragment } from "../pdf-domain/IPdfRectangleFragment.js";
import type { FragmentKind } from "./FragmentKind.js";
import { GeometryFragment } from "./GeometryFragment.js";
import { Rectangle } from "./Rectangle.js";

export class RectangleFragment extends GeometryFragment<RectangleFragment> {
    private indexValue!: number;
    private pageNumberValue!: number;
    private rectangleValue!: Rectangle;

    public constructor(params: {
        index: number;
        pageNumber: number;
        rectangle: Rectangle;
    }) {
        super();
        this.initializeFragment({
            index: params.index,
            pageNumber: params.pageNumber,
            rectangle: params.rectangle,
        });
    }

    public static fromSource(
        source: IPdfRectangleFragment,
        index: number,
    ): RectangleFragment {
        return new RectangleFragment({
            index,
            pageNumber: source.pageNumber,
            rectangle: Rectangle.create({
                id: `p${source.pageNumber}-${index}`,
                position: source.boundingBox.position,
                width: source.boundingBox.width,
                height: source.boundingBox.height,
            }),
        });
    }

    public override get index(): number {
        return this.indexValue;
    }

    protected override set index(value: number) {
        this.indexValue = value;
    }

    public override get pageNumber(): number {
        return this.pageNumberValue;
    }

    protected override set pageNumber(value: number) {
        this.pageNumberValue = value;
    }

    public override get rectangle(): Rectangle {
        return this.rectangleValue;
    }

    protected override set rectangle(value: Rectangle) {
        this.rectangleValue = value;
    }

    public override get kind(): FragmentKind {
        return "rectangle";
    }

    public toSource(): IPdfRectangleFragment {
        return Object.freeze({
            kind: "rectangle",
            pageNumber: this.pageNumber,
            boundingBox: this.rectangle.toBoundingBox(),
        });
    }

    protected override withRectangle(rectangle: Rectangle): RectangleFragment {
        return new RectangleFragment({
            index: this.index,
            pageNumber: this.pageNumber,
            rectangle,
        });
    }
}
