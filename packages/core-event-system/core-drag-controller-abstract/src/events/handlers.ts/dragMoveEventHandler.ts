import { AppDragMoveData } from "../../types/drag/app-drag-move-data.js";
import { BaseEventHandler } from "./BaseEventHandler.js";

export class DragMoveEventHandler extends BaseEventHandler<AppDragMoveData> {
    protected async before(): Promise<void> {
        console.log("[Handler:Before] drag move");
    }

    protected async after(): Promise<void> {
        console.log("[Handler:After] drag move");
    }
}
