import type {
  INodeTransform,
  IPrimitiveCompositeNode,
  IPrimitiveNode,
} from "@monorepo/core-design-pattern-composite-tree-threejs";
import type { IBox } from "./Builders/Box/box.js";
import type { ICylinder } from "./Builders/Cylinder/Cylinder.js";
import type { IHalfSphere } from "./Builders/HalfSphere/HalfSphere.js";
import type { IPyramid } from "./Builders/Pyramid/Pyramid.js";
import type { ISphere } from "./Builders/Sphere/Sphere.js";

export interface IBoxPrimitiveNodeDefinition {
  readonly kind: "box";
  readonly configuration: IBox;
}

export interface ICylinderPrimitiveNodeDefinition {
  readonly kind: "cylinder";
  readonly configuration: ICylinder;
}

export interface IHalfSpherePrimitiveNodeDefinition {
  readonly kind: "half-sphere";
  readonly configuration: IHalfSphere;
}

export interface IPyramidPrimitiveNodeDefinition {
  readonly kind: "pyramid";
  readonly configuration: IPyramid;
}

export interface ISpherePrimitiveNodeDefinition {
  readonly kind: "sphere";
  readonly configuration: ISphere;
}

export type PrimitiveNodeDefinition =
  | IBoxPrimitiveNodeDefinition
  | ICylinderPrimitiveNodeDefinition
  | IHalfSpherePrimitiveNodeDefinition
  | IPyramidPrimitiveNodeDefinition
  | ISpherePrimitiveNodeDefinition;

export interface IPrimitiveNodeFactory {
  createPrimitive(
    name: string,
    definition: PrimitiveNodeDefinition,
  ): IPrimitiveNode;

  createGroup(
    name: string,
    children?: readonly IPrimitiveNode[],
  ): IPrimitiveCompositeNode;

  createTransform(
    name: string,
    inner: IPrimitiveNode,
    transform?: INodeTransform,
  ): IPrimitiveNode;

  box(name: string, configuration: IBox): IPrimitiveNode;
  cylinder(name: string, configuration: ICylinder): IPrimitiveNode;
  halfSphere(name: string, configuration: IHalfSphere): IPrimitiveNode;
  pyramid(name: string, configuration: IPyramid): IPrimitiveNode;
  sphere(name: string, configuration: ISphere): IPrimitiveNode;
}
