import type { IDragBounds } from "./IDragBounds.js";
import type { OnDragMessage } from "../Pipeline/Messages/OnDragMessage.js";

export interface IDragStateStore {
	isDraggingEnabled(): boolean;
	isVisible(targetId: string): boolean;
	tryGetBounds(targetId: string): IDragBounds | null;
	record(message: OnDragMessage): void;
}
