import { ShapeType } from "@monorepo/core-shapes-abstract";

export interface IShapeTypeFactory {
    create(value: string): ShapeType;
}
