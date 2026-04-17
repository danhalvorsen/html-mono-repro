// tests/fixtures/PdfParserAdapterFixture.ts

import { describe, expect, it } from "vitest";
import type {IPdfMetadata } from "@monorepo/core-pdf-domain";
import { IPdfFragment } from "../src/types.js";
import { PdfParserAdapterFixture } from "./PdfParserAdapterFixture.js";
import { IBoundingBox } from "@monorepo/core-pdf-domain";

// ====================================================================================================
// tests/GuardedAdapter.test.ts
// ====================================================================================================

describe("GuardedAdapter", () => {
    const fixture = new PdfParserAdapterFixture();

    it("should accept a non-empty Uint8Array binary", () => {
        const binary = fixture.createBinary();

        expect(() => fixture.guardedAdapter.ensureBinaryPublic(binary, "pdfBinary")).not.toThrow();
    });

    it("should reject a non-Uint8Array binary", () => {
        const invalid = "not-binary" as unknown as Uint8Array;

        expect(() => fixture.guardedAdapter.ensureBinaryPublic(invalid, "pdfBinary"))
            .toThrowError("pdfBinary must be a Uint8Array.");
    });

    it("should reject an empty Uint8Array binary", () => {
        const binary = new Uint8Array(0);

        expect(() => fixture.guardedAdapter.ensureBinaryPublic(binary, "pdfBinary"))
            .toThrowError("pdfBinary must not be empty.");
    });

    it("should accept a positive integer page number", () => {
        expect(() => fixture.guardedAdapter.ensurePositivePageNumberPublic(1, "pageNumber")).not.toThrow();
    });

    it("should reject page number zero", () => {
        expect(() => fixture.guardedAdapter.ensurePositivePageNumberPublic(0, "pageNumber"))
            .toThrowError("pageNumber must be an integer greater than or equal to one.");
    });

    it("should reject a non-integer page number", () => {
        expect(() => fixture.guardedAdapter.ensurePositivePageNumberPublic(1.5, "pageNumber"))
            .toThrowError("pageNumber must be an integer greater than or equal to one.");
    });

    it("should accept a finite number", () => {
        expect(() => fixture.guardedAdapter.ensureFinitePublic(10, "value")).not.toThrow();
    });

    it("should reject NaN", () => {
        expect(() => fixture.guardedAdapter.ensureFinitePublic(Number.NaN, "value"))
            .toThrowError("value must be finite.");
    });

    it("should reject Infinity", () => {
        expect(() => fixture.guardedAdapter.ensureFinitePublic(Number.POSITIVE_INFINITY, "value"))
            .toThrowError("value must be finite.");
    });

    it("should accept a valid bounding box", () => {
        const box = fixture.createBoundingBox();

        expect(() => fixture.guardedAdapter.ensureBoundingBoxPublic(box, "box")).not.toThrow();
    });

    it("should reject a missing bounding box", () => {
        expect(() => fixture.guardedAdapter.ensureBoundingBoxPublic(undefined as unknown as IBoundingBox, "box"))
            .toThrowError("box is required.");
    });

    it("should reject a bounding box with non-positive width", () => {
        const box = fixture.createBoundingBox({ width: 0 });

        expect(() => fixture.guardedAdapter.ensureBoundingBoxPublic(box, "box"))
            .toThrowError("box.width must be greater than zero.");
    });

    it("should reject a bounding box with non-positive height", () => {
        const box = fixture.createBoundingBox({ height: 0 });

        expect(() => fixture.guardedAdapter.ensureBoundingBoxPublic(box, "box"))
            .toThrowError("box.height must be greater than zero.");
    });

    it("should accept a valid fragment", () => {
        const fragment = fixture.createRectangleFragment();

        expect(() => fixture.guardedAdapter.ensureFragmentPublic(fragment, 0)).not.toThrow();
    });

    it("should reject a missing fragment", () => {
        expect(() => fixture.guardedAdapter.ensureFragmentPublic(undefined as unknown as IPdfFragment, 2))
            .toThrowError("fragments[2] is required.");
    });

    it("should reject an unsupported fragment kind", () => {
        const fragment = {
            kind: "unknown",
            pageNumber: 1,
            boundingBox: fixture.createBoundingBox(),
        } as unknown as IPdfFragment;

        expect(() => fixture.guardedAdapter.ensureFragmentPublic(fragment, 3))
            .toThrowError("fragments[3].kind is unsupported.");
    });

    it("should reject a fragment with invalid page number", () => {
        const fragment = fixture.createRectangleFragment({ pageNumber: 0 });

        expect(() => fixture.guardedAdapter.ensureFragmentPublic(fragment, 1))
            .toThrowError("fragments[1].pageNumber must be an integer greater than or equal to one.");
    });

    it("should reject a fragment with invalid bounding box", () => {
        const fragment = fixture.createRectangleFragment({
            boundingBox: fixture.createBoundingBox({ width: -1 }),
        });

        expect(() => fixture.guardedAdapter.ensureFragmentPublic(fragment, 5))
            .toThrowError("fragments[5].boundingBox.width must be greater than zero.");
    });

    it("should accept a page number inside the document range", () => {
        expect(() => fixture.guardedAdapter.ensurePageInRangePublic(2, 2)).not.toThrow();
    });

    it("should reject a page number outside the document range", () => {
        expect(() => fixture.guardedAdapter.ensurePageInRangePublic(3, 2))
            .toThrowError("pageNumber '3' is outside the document page range.");
    });

    it("should return the number when it is finite", () => {
        expect(fixture.guardedAdapter.toFiniteNumberPublic(12.5)).toBe(12.5);
    });

    it("should return zero for undefined", () => {
        expect(fixture.guardedAdapter.toFiniteNumberPublic(undefined)).toBe(0);
    });

    it("should return zero for a non-number value", () => {
        expect(fixture.guardedAdapter.toFiniteNumberPublic("12.5")).toBe(0);
    });

    it("should return zero for NaN", () => {
        expect(fixture.guardedAdapter.toFiniteNumberPublic(Number.NaN)).toBe(0);
    });
});

// ====================================================================================================
// tests/PdfMetadataMapper.test.ts
// ====================================================================================================

describe("PdfMetadataMapper", () => {
    const fixture = new PdfParserAdapterFixture();

    it("should map all known metadata fields", () => {
        const info = fixture.createMetadataSource();

        const result = fixture.metadataMapper.map(info);

        const expected: IPdfMetadata = {
            title: "Spec",
            author: "Dan",
            subject: "PDF",
            creator: "UnitTest",
            producer: "Vitest",
            creationDateUtc: "D:20260417090000Z",
            modificationDateUtc: "D:20260417100000Z",
        };

        expect(result).toEqual(expected);
    });

    it("should omit unknown or non-string metadata fields", () => {
        const info = fixture.createMetadataSource({
            Title: 123,
            Author: null,
            Subject: false,
            Creator: ["bad"],
            Producer: { invalid: true },
            CreationDate: 10,
            ModDate: undefined,
        });

        const result = fixture.metadataMapper.map(info);

        expect(result).toEqual({});
    });

    it("should map only the fields that exist as strings", () => {
        const info = fixture.createMetadataSource({
            Title: "Only title",
            Author: undefined,
            Subject: undefined,
            Creator: undefined,
            Producer: undefined,
            CreationDate: undefined,
            ModDate: undefined,
        });

        const result = fixture.metadataMapper.map(info);

        expect(result).toEqual({
            title: "Only title",
        });
    });

    it("should return a frozen metadata object", () => {
        const info = fixture.createMetadataSource();

        const result = fixture.metadataMapper.map(info);

        expect(Object.isFrozen(result)).toBe(true);
    });
});