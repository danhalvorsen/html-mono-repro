 
import { IShapeTypeFactory } from "./IShapeTypeFactory.js";
import { ShapeType } from '@monorepo/core-shapes-abstract'

export class StringShapeTypeFactory implements IShapeTypeFactory {
    public create(value: string): ShapeType {
        const candidate = value.trim();

        if (!candidate) {
            throw new Error("Shape type cannot be empty.");
        }

        return candidate as ShapeType;
    }
}
