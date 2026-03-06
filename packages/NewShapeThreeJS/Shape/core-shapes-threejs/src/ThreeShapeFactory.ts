import { Object3D } from "three/src/Three.js";
import { IShapeTypeFactory } from "./IShapeTypeFactory.js";
import { ThreeShape } from "./ThreeShape.js";
import { IThreeShapeFactory } from "./IThreeShapeFactory.js";
import { IShapeIdentityFactory } from "./IShapeIdentityFactory.js";
import { IThreeShape } from "./IThreeShape.js";

// ============================================================================
// Factory implementation
// ============================================================================

export class ThreeShapeFactory implements IThreeShapeFactory {
    public constructor(
        private readonly idFactory: IShapeIdentityFactory,
        private readonly typeFactory: IShapeTypeFactory
    ) { }

    public create(type: string, object3D: Object3D): IThreeShape {
        return new ThreeShape({
            id: this.idFactory.createId(),
            type: this.typeFactory.create(type),
            object3D
        });
    }
}
