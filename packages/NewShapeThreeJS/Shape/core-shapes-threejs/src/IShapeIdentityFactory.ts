import { ShapeId } from "@monorepo/core-shapes-abstract";

export interface IShapeIdentityFactory {
    createId(): ShapeId;
}
