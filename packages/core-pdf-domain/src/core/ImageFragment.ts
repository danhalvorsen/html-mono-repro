// src/ImageFragment.ts

import { Fragment } from "./Fragment.js";
import type { FragmentKind } from "./FragmentKind.js";
import { Rectangle } from "./Rectangle.js";

export class ImageFragment extends Fragment<ImageFragment> {
    private indexValue!: number;
    private pageNumberValue!: number;
    private rectangleValue!: Rectangle;

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
        super();
        this.initializeFragment({
            index: params.index,
            pageNumber: params.pageNumber,
            rectangle: params.rectangle
        });

        this.name = params.name ?? undefined;
        this.mimeType = params.mimeType ?? undefined;
        this.bytes = params.bytes ?? undefined;
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
