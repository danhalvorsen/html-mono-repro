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
    metadata: RectangleMetadata;
}>;

type RectangleMetadata = Readonly<{
    type: string;
    text: string;
}>;

type RectangleCell = Readonly<{
    kind?: string;
    text?: string;
    metadata?: Partial<RectangleMetadata>;
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
    private readonly endpoints: ReadonlyArray<string>;
    private readonly client = new HttpClientBuilder()
        .addResponseInterceptor(new ThrowOnErrorResponseInterceptor())
        .build();

    public constructor(
        endpoints: string | ReadonlyArray<string> = [
            "/api/save",
            "/api/commands/save",
            "/api/save-rectangle-cells",
            "/save-rectangle-cells"
        ]
    ) {
        this.endpoints = Array.isArray(endpoints) ? endpoints : [endpoints];
    }

    public async writeJson(
        _fileName: string,
        json: string,
        compensation?: IRectangleSaveCompensation
    ): Promise<void> {
        const payload = this.toRectanglePayload(JSON.parse(json) as unknown, compensation);
        let lastError: unknown = null;

        for (const endpoint of this.endpoints) {
            try {
                const request = new HttpRequestMessageBuilder()
                    .withMethod("POST")
                    .withPath(endpoint)
                    .withHeaders(
                        new HeadersBuilder()
                            .with(HeaderName.ContentType, "application/json")
                            .build()
                    )
                    .withBody(payload)
                    .build();

                await this.client.send(request);
                return;
            }
            catch (error) {
                lastError = error;
            }
        }

        const reason = lastError instanceof Error ? lastError.message : "Unknown HTTP failure.";
        throw new Error(`Failed to save payload using endpoints: ${this.endpoints.join(", ")}. ${reason}`);
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
        const metadata = resolveMetadata(value);

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
                height: value.height,
                metadata
            };
        }

        if (
            value.cell !== undefined &&
            typeof value.cell.column === "number" &&
            typeof value.cell.row === "number"
        ) {
            const metrics = resolveCompensation(compensation);
            const horizontalInset = metadata.type === "text"
                ? metrics.cellWidth * 0.1
                : metrics.horizontalInset;
            const verticalInset = metadata.type === "text"
                ? metrics.cellHeight * 0.1
                : metrics.verticalInset;
            const x = value.cell.column * metrics.cellWidth;
            const y = value.cell.row * metrics.cellHeight;
            const width = Math.max(1, metrics.cellWidth - (horizontalInset * 2));
            const height = Math.max(1, metrics.cellHeight - (verticalInset * 2));

            return {
                x: x + horizontalInset,
                y: y + verticalInset,
                width,
                height,
                metadata
            };
        }

        throw new Error("Unsupported rectangle payload.");
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveMetadata(value: RectangleCell): RectangleMetadata {
    const metadataType = value.metadata?.type;
    const metadataText = value.metadata?.text;

    return {
        type: typeof metadataType === "string" && metadataType.trim().length > 0
            ? metadataType
            : (typeof value.kind === "string" && value.kind.trim().length > 0
                ? value.kind
                : "rectangle"),
        text: typeof metadataText === "string"
            ? metadataText
            : (typeof value.text === "string" ? value.text : "")
    };
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
