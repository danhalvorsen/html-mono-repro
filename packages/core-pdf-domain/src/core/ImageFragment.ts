// src/ImageFragment.ts

import { Fragment } from "./Fragment.js";
import type { FragmentKind } from "./FragmentKind.js";
import { Rectangle } from "./Rectangle.js";

export class ImageFragment extends Fragment<ImageFragment> {
    public readonly name: string | undefined;
    public readonly mimeType: string | undefined;
    public readonly bytes: Uint8Array | undefined;

    public constructor(params: {
        index: number;
        pageNumber: number;
        rectangle: Rectangle;
        name?: string | null | undefined;
        mimeType?: string | null | undefined;
        bytes?: Uint8Array | null | undefined;
    }) {
        super({
            index: params.index,
            pageNumber: params.pageNumber,
            rectangle: params.rectangle
        });

        this.name = params.name ?? undefined;
        this.mimeType = params.mimeType ?? undefined;
        this.bytes = params.bytes ?? undefined;
    }

    public get kind(): FragmentKind {
        return "image";
    }

    protected withRectangle(rectangle: Rectangle): ImageFragment {
        return new ImageFragment({
            index: this.index,
            pageNumber: this.pageNumber,
            rectangle,
            name: this.name ?? undefined,
            mimeType: this.mimeType ?? undefined,
            bytes: this.bytes ?? undefined
        });
    }
}