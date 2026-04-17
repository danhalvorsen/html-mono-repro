import type { IBoundingBox } from "../core/IBoundingBox.js";
export interface IPdfTextFragment {
    readonly kind: "text";
    readonly pageNumber: number;
    readonly boundingBox: IBoundingBox;
    readonly text: string;
    readonly fontName?: string | undefined;
    readonly fontFamily?: string | undefined;
    readonly fontSize?: number | undefined;
}
//# sourceMappingURL=IPdfTextFragment.d.ts.map