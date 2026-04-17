import { FragmentKind } from "./FragmentKind.js";
import { Fragment } from "./Fragment.js";
import { Rectangle } from "./Rectangle.js";


export class ImageFragment extends Fragment {
    public readonly sourceId: string | null;

    private constructor(params: {
        index: number;
        pageNumber: number;
        rectangle: Rectangle;
        sourceId: string | null;
    }) {
        super({
            index: params.index,
            pageNumber: params.pageNumber,
            rectangle: params.rectangle,
        });

        this.sourceId = params.sourceId;
    }

    public static create(params: {
        index: number;
        pageNumber: number;
        rectangle: Rectangle;
        sourceId?: string | null;
    }): ImageFragment {
        return new ImageFragment({
            index: params.index,
            pageNumber: params.pageNumber,
            rectangle: params.rectangle,
            sourceId: params.sourceId ?? null,
        });
    }

    public override get kind(): FragmentKind {
        return "image";
    }

    protected override withRectangle(rectangle: Rectangle): ImageFragment {
        return new ImageFragment({
            index: this.index,
            pageNumber: this.pageNumber,
            rectangle,
            sourceId: this.sourceId,
        });
    }
}
