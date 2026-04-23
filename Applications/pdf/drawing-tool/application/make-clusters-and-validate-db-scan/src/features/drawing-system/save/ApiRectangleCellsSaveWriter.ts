import {
    HeaderName,
    HeadersBuilder,
    HttpRequestMessageBuilder
} from "@monorepo/core-http-messages";
import {
    HttpClientBuilder,
    ThrowOnErrorResponseInterceptor
} from "@monorepo/core-http-messages-http-client";

import type {
    IRectangleCellsSaveWriter,
    IRectangleSaveCompensation
} from "./IRectangleCellsSaveWriter.js";

type Rectangle = Readonly<{
    x: number;
    y: number;
    width: number;
    height: number;
}>;

type RectangleCell = Readonly<{
    cell?: Readonly<{
        column: number;
        row: number;
    }>;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}>;

export class ApiRectangleCellsSaveWriter implements IRectangleCellsSaveWriter {
    private readonly endpoint: string;
    private readonly client = new HttpClientBuilder()
        .addResponseInterceptor(new ThrowOnErrorResponseInterceptor())
        .build();

    public constructor(endpoint: string = "/api/save") {
        this.endpoint = endpoint;
    }

    public async writeJson(
        _fileName: string,
        json: string,
        compensation?: IRectangleSaveCompensation
    ): Promise<void> {
        const payload = this.toRectanglePayload(JSON.parse(json) as unknown, compensation);

        const request = new HttpRequestMessageBuilder()
            .withMethod("POST")
            .withPath(this.endpoint)
            .withHeaders(
                new HeadersBuilder()
                    .with(HeaderName.ContentType, "application/json")
                    .build()
            )
            .withBody(payload)
            .build();

        await this.client.send(request);
    }

    private toRectanglePayload(
        value: unknown,
        compensation?: IRectangleSaveCompensation
    ): ReadonlyArray<Rectangle> {
        const rectangles = this.extractRectangles(value);

        return rectangles.map((rectangle) => this.toRectangle(rectangle, compensation));
    }

    private extractRectangles(value: unknown): ReadonlyArray<RectangleCell> {
        if (Array.isArray(value)) {
            return value as ReadonlyArray<RectangleCell>;
        }

        if (isRecord(value) && Array.isArray(value.rectangles)) {
            return value.rectangles as ReadonlyArray<RectangleCell>;
        }

        throw new Error("Expected a list of boxes or a save file with rectangles.");
    }

    private toRectangle(
        value: RectangleCell,
        compensation?: IRectangleSaveCompensation
    ): Rectangle {
        if (
            typeof value.x === "number" &&
            typeof value.y === "number" &&
            typeof value.width === "number" &&
            typeof value.height === "number"
        ) {
            return {
                x: value.x,
                y: value.y,
                width: value.width,
                height: value.height
            };
        }

        if (
            value.cell !== undefined &&
            typeof value.cell.column === "number" &&
            typeof value.cell.row === "number"
        ) {
            const metrics = resolveCompensation(compensation);
            const x = value.cell.column * metrics.cellWidth;
            const y = value.cell.row * metrics.cellHeight;
            const width = Math.max(1, metrics.cellWidth - (metrics.horizontalInset * 2));
            const height = Math.max(1, metrics.cellHeight - (metrics.verticalInset * 2));

            return {
                x: x + metrics.horizontalInset,
                y: y + metrics.verticalInset,
                width,
                height
            };
        }

        throw new Error("Unsupported rectangle payload.");
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

type RectangleCompensation = Readonly<{
    cellWidth: number;
    cellHeight: number;
    horizontalInset: number;
    verticalInset: number;
}>;

function resolveCompensation(
    compensation?: IRectangleSaveCompensation
): RectangleCompensation {
    const cellWidth = compensation?.cellWidth ?? 96;
    const cellHeight = compensation?.cellHeight ?? 96;
    const inset = compensation?.inset ?? 8;
    const horizontalInset = Math.max(0, inset);
    const verticalInset = Math.max(0, inset);

    return {
        cellWidth,
        cellHeight,
        horizontalInset,
        verticalInset
    };
}
