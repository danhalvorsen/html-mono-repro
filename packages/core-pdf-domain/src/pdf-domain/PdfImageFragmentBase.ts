import { IPoint } from "../core/IPoint.js";
import { IPdfImageFragment } from "./IPdfImageFragment.js";

/* =================================================================================================
   PdfImageFragmentBase
   ================================================================================================= */

export abstract class PdfImageFragmentBase implements IPdfImageFragment {
    public readonly kind = "image" as const;

    public abstract readonly pageNumber: number;
    public abstract readonly boundingBox: Readonly<{
        position: IPoint;
        width: number;
        height: number;
    }>;
    public abstract readonly name?: string | undefined;
    public abstract readonly mimeType?: string | undefined;
    public abstract readonly bytes?: Uint8Array | undefined;

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

    public toJSON(): IPdfImageFragment {
        return Object.freeze({
            kind: this.kind,
            pageNumber: this.pageNumber,
            boundingBox: Object.freeze({
                position: Object.freeze({
                    x: this.boundingBox.position.x,
                    y: this.boundingBox.position.y,
                }),
                width: this.boundingBox.width,
                height: this.boundingBox.height,
            }),
            ...(this.name !== undefined && { name: this.name }),
            ...(this.mimeType !== undefined && { mimeType: this.mimeType }),
            ...(this.bytes !== undefined && { bytes: this.bytes }),
        });
    }
}
