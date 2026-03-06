 
import { ThreeShapeFactory } from "./ThreeShapeFactory.js";
import { UuidShapeIdentityFactory } from "./UuidShapeIdentityFactory.js";
import { StringShapeTypeFactory } from "./StringShapeTypeFactory.js";
import { ThreeShapesModule } from "./Types.js";
export function createThreeShapesModule(): ThreeShapesModule {
  const idFactory = new UuidShapeIdentityFactory();
  const typeFactory = new StringShapeTypeFactory();
  const shapeFactory = new ThreeShapeFactory(idFactory, typeFactory);

  return {
    idFactory,
    typeFactory,
    shapeFactory
  };
}