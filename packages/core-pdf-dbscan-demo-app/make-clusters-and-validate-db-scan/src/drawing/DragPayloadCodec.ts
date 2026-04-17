import type { CanvasObjectKind } from "./CanvasObjectKind.js";
import { CanvasObjectKinds } from "./CanvasObjectKind.js";

export interface IMenuShapeDragPayload {
    readonly kind: "menu-shape";
    readonly shapeKind: CanvasObjectKind;
}

export interface IDragPayloadCodec<TValue> {
    readonly mimeType: string;
    serialize(value: TValue): string;
    tryDeserialize(raw: string | null): TValue | null;
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
            value === CanvasObjectKinds.diamond;
    }
}
