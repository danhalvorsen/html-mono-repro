import type { CanvasObjectKind } from "../../canvas-object/value-objects/CanvasObjectKind.js";
import { CanvasObjectKinds } from "../../canvas-object/value-objects/CanvasObjectKind.js";
import type { IDragPayloadCodec } from "../contracts/IDragPayloadCodec.js";

export interface IMenuShapeDragPayload {
    readonly kind: "menu-shape";
    readonly shapeKind: CanvasObjectKind;
}

export class MenuShapeDragPayloadCodec implements IDragPayloadCodec<IMenuShapeDragPayload> {
    public readonly mimeType = "application/x.my-drawing-system.menu-shape+json";

    public serialize(value: IMenuShapeDragPayload): string {
        return JSON.stringify(value);
    }

    public tryDeserialize(raw: string | null): IMenuShapeDragPayload | null {
        if (raw === null || raw.trim().length === 0) {
            return null;
        }

        try {
            const parsed = JSON.parse(raw) as Partial<IMenuShapeDragPayload>;

            if (parsed.kind !== "menu-shape") {
                return null;
            }

            if (!this.isCanvasObjectKind(parsed.shapeKind)) {
                return null;
            }

            return {
                kind: "menu-shape",
                shapeKind: parsed.shapeKind
            };
        }
        catch {
            return null;
        }
    }

    private isCanvasObjectKind(value: unknown): value is CanvasObjectKind {
        return value === CanvasObjectKinds.rectangle ||
            value === CanvasObjectKinds.circle ||
            value === CanvasObjectKinds.triangle ||
            value === CanvasObjectKinds.diamond ||
            value === CanvasObjectKinds.line ||
            value === CanvasObjectKinds.saveButton ||
            value === CanvasObjectKinds.loadButton ||
            value === CanvasObjectKinds.deleteButton;
    }
}
