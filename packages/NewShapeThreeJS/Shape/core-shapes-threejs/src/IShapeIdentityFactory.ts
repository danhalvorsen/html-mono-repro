import { ShapeId } from "@monorepo/core-new-shapes-abstract";

export interface IShapeIdentityFactory {
    createId(): ShapeId;
}
