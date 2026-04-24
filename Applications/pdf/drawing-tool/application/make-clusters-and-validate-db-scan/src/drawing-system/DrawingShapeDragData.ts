import type { DrawingShapeType } from "./DrawingShapeType.js";

export type DrawingShapeDragData = Readonly<{
    kind: "drawing-shape";
    shapeType: DrawingShapeType;
}>;

export class DrawingShapeDragDataSerializer {
    public static readonly mimeType = "application/x.my-drawing-shape+json";

    public static serialize(data: DrawingShapeDragData): string {
        return JSON.stringify(data);
    }

    public static tryDeserialize(value: string | null): DrawingShapeDragData | null {
        if (value === null || value.trim().length === 0) {
            return null;
        }

        try {
            const parsed = JSON.parse(value) as Partial<DrawingShapeDragData>;

            if (parsed.kind !== "drawing-shape") {
                return null;
            }

            if (
                parsed.shapeType !== "rectangle" &&
                parsed.shapeType !== "circle" &&
                parsed.shapeType !== "triangle" &&
                parsed.shapeType !== "diamond" &&
                parsed.shapeType !== "line" &&
                parsed.shapeType !== "text" &&
                parsed.shapeType !== "save-button" &&
                parsed.shapeType !== "load-button" &&
                parsed.shapeType !== "delete-button"
            ) {
                return null;
            }

            return {
                kind: "drawing-shape",
                shapeType: parsed.shapeType
            };
        }
        catch {
            return null;
        }
    }
}
