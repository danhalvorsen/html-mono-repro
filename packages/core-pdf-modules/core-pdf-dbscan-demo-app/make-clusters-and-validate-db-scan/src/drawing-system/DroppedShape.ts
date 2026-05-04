import type { DrawingShapeType } from "./DrawingShapeType.js";

export type DroppedShape = Readonly<{
    id: string;
    type: DrawingShapeType;
    cellColumn: number;
    cellRow: number;
}>;
