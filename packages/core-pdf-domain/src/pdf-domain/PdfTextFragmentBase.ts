/* =================================================================================================
   PdfTextFragmentBase
   ================================================================================================= */

import { IPoint } from "../core/IPoint.js";
import { IPdfTextFragment } from "./IPdfTextFragment.js";

export abstract class PdfTextFragmentBase implements IPdfTextFragment {
    public readonly kind = "text";

    public abstract readonly pageNumber: number;
    public abstract readonly text: string;
    public abstract readonly boundingBox: {
        readonly position: IPoint;
        readonly width: number;
        readonly height: number;
    };
    public abstract readonly fontName?: string | undefined;
    public abstract readonly fontFamily?: string | undefined;
    public abstract readonly fontSize?: number | undefined;

    public get x(): number {
        return this.boundingBox.position.x;
    }

    public get y(): number {
        return this.boundingBox.position.y;
    }

    public get width(): number {
        return this.boundingBox.width;
    }

    public get height(): number {
        return this.boundingBox.height;
    }

    public toJSON(): IPdfTextFragment {
        const fontName = this.fontName ?? undefined;
        const fontFamily = this.fontFamily ?? undefined;
        const fontSize = this.fontSize ?? undefined;

        return Object.freeze({
            kind: this.kind,
            pageNumber: this.pageNumber,
            text: this.text,
            boundingBox: Object.freeze({
                position: Object.freeze({
                    x: this.boundingBox.position.x,
                    y: this.boundingBox.position.y,
                }),
                width: this.boundingBox.width,
                height: this.boundingBox.height,
            }),
            ...(fontName !== undefined && { fontName }),
            ...(fontFamily !== undefined && { fontFamily }),
            ...(fontSize !== undefined && { fontSize }),
        });
    }
}