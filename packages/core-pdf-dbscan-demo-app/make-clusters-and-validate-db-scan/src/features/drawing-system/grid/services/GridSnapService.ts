import type { IGridCell } from "../../canvas-object/contracts/CanvasObject.js";
import type { IGridSnapRequest, IGridSnapService } from "./IGridSnapService.js";

export class GridSnapService implements IGridSnapService {
    public trySnap(request: IGridSnapRequest): IGridCell | null {
        if (request.stageWidth <= 0 || request.stageHeight <= 0) {
            return null;
        }

        const localX = request.clientX - request.stageLeft;
        const localY = request.clientY - request.stageTop;

        if (
            localX < 0 ||
            localY < 0 ||
            localX > request.stageWidth ||
            localY > request.stageHeight
        ) {
            return null;
        }

        const scaleX = request.canvasWidth / request.stageWidth;
        const scaleY = request.canvasHeight / request.stageHeight;

        const svgX = localX * scaleX;
        const svgY = localY * scaleY;

        const column = Math.min(
            request.columns - 1,
            Math.max(0, Math.floor(svgX / request.cellWidth))
        );

        const row = Math.min(
            request.rows - 1,
            Math.max(0, Math.floor(svgY / request.cellHeight))
        );

        return {
            column,
            row
        };
    }
}
