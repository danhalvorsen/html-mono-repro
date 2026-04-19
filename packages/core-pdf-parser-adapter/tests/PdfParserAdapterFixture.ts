import { IBoundingBox } from "core-pdf-domain/src/core/IBoundingBox.js";
import { PdfMetadataMapper } from "../src/PdfMetadataMapper.js"
import { GuardedAdapterTestHarness } from "./GuardedAdapterTestHarness.js";
import { IPdfRectangleFragment } from "core-pdf-domain/src/pdf-domain/IPdfRectangleFragment.js";

export class PdfParserAdapterFixture {
    public readonly guardedAdapter = new GuardedAdapterTestHarness();
    public readonly metadataMapper = new PdfMetadataMapper();

    public createBinary(length = 4): Uint8Array {
        return new Uint8Array(length).fill(1);
    }

    public createBoundingBox(overrides?: Partial<IBoundingBox>): IBoundingBox {
        const basePosition = overrides?.position;

        const box: IBoundingBox = {
            position: {
                x: basePosition?.x ?? 10,
                y: basePosition?.y ?? 20,
            },
            width: overrides?.width ?? 30,
            height: overrides?.height ?? 40,
            ...overrides,
        };

        return box;
    }

    public createRectangleFragment(overrides?: Partial<IPdfRectangleFragment>): IPdfRectangleFragment {
        const fragment: IPdfRectangleFragment = {
            kind: "rectangle",
            pageNumber: overrides?.pageNumber ?? 1,
            boundingBox: overrides?.boundingBox ?? this.createBoundingBox(),
        };

        return fragment;
    }

    public createMetadataSource(overrides?: Record<string, unknown>): Record<string, unknown> {
        return {
            Title: "Spec",
            Author: "Dan",
            Subject: "PDF",
            Creator: "UnitTest",
            Producer: "Vitest",
            CreationDate: "D:20260417090000Z",
            ModDate: "D:20260417100000Z",
            ...overrides,
        };
    }
}
