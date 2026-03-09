import { ShapeId } from "@monorepo/core-new-shapes-abstract";
import { IShapeIdentityFactory } from "./IShapeIdentityFactory.js";

// ============================================================================
// Default factories
// ============================================================================

export class UuidShapeIdentityFactory implements IShapeIdentityFactory {
    public createId(): ShapeId {
        return crypto.randomUUID() as ShapeId;
    }
}
