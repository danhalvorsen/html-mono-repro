import type { DrawingShapeType } from "./DrawingShapeType.js";
import type { DroppedShape } from "./DroppedShape.js";

export class DroppedShapeFactory {
    public create(
        type: DrawingShapeType,
        cellColumn: number,
        cellRow: number
    ): DroppedShape {
        return {
            id: this.createId(),
            type,
            cellColumn,
            cellRow
        };
    }

    private createId(): string {
        return `shape-${crypto.randomUUID()}`;
    }
}
