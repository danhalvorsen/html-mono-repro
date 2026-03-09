import { ShapeType } from "@monorepo/core-new-shapes-abstract";

export interface IShapeTypeFactory {
    create(value: string): ShapeType;
}
