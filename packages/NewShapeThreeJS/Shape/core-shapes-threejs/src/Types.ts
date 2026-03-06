import { ShapeId, ShapeType } from "@monorepo/core-shapes-abstract";
import { Object3D } from "three/src/Three.js";
import { IShapeTypeFactory } from "./IShapeTypeFactory.js";
import { IShapeIdentityFactory } from "./IShapeIdentityFactory.js";
import { IThreeShapeFactory } from "./IThreeShapeFactory.js";

export type ThreeShapesModule = Readonly<{
  idFactory: IShapeIdentityFactory;
  typeFactory: IShapeTypeFactory;
  shapeFactory: IThreeShapeFactory;
}>;

export type ThreeShapeOptions = Readonly<{
  id: ShapeId;
  type: ShapeType;
  object3D: Object3D;
}>;