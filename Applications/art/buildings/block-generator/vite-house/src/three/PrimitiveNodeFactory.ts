import * as THREE from "three";
import {
  PrimitiveCompositeNode,
  TransformNode,
  type INodeTransform,
  type IPrimitiveCompositeNode,
  type IPrimitiveNode,
} from "@monorepo/core-design-pattern-composite-tree-threejs";
import { BoxBuilder } from "./Builders/Box/boxBuilder.js";
import type { IBox } from "./Builders/Box/box.js";
import { CylinderBuilder } from "./Builders/Cylinder/CylinderBuilder.js";
import type { ICylinder } from "./Builders/Cylinder/Cylinder.js";
import { HalfSphereBuilder } from "./Builders/HalfSphere/HalfSphereBuilder.js";
import type { IHalfSphere } from "./Builders/HalfSphere/HalfSphere.js";
import { PyramidBuilder } from "./Builders/Pyramid/PyramidBuilder.js";
import type { IPyramid } from "./Builders/Pyramid/Pyramid.js";
import { SphereBuilder } from "./Builders/Sphere/Sphere.Builder.js";
import type { ISphere } from "./Builders/Sphere/Sphere.js";
import type {
  IPrimitiveNodeFactory,
  PrimitiveNodeDefinition,
} from "./IPrimitiveNodeFactory.js";

class PrimitiveLeafNode<TConfiguration> implements IPrimitiveNode {
  public constructor(
    public readonly name: string,
    private readonly configuration: TConfiguration,
    private readonly instantiatePrimitive: (configuration: TConfiguration) => THREE.Object3D,
  ) {}

  public operation(): void {
    // Leaf nodes do not have child operations to propagate.
  }

  public instantiate(): THREE.Object3D {
    const instance = this.instantiatePrimitive(this.configuration);
    instance.name = this.name;
    return instance;
  }

  public cloneNode(): IPrimitiveNode {
    return new PrimitiveLeafNode(
      this.name,
      this.configuration,
      this.instantiatePrimitive,
    );
  }

  public getChildren(): readonly IPrimitiveNode[] {
    return [];
  }
}

export class PrimitiveNodeFactory implements IPrimitiveNodeFactory {
  public constructor(
    private readonly boxBuilder: BoxBuilder = new BoxBuilder(),
    private readonly cylinderBuilder: CylinderBuilder = new CylinderBuilder(),
    private readonly halfSphereBuilder: HalfSphereBuilder = new HalfSphereBuilder(),
    private readonly pyramidBuilder: PyramidBuilder = new PyramidBuilder(),
    private readonly sphereBuilder: SphereBuilder = new SphereBuilder(),
  ) {}

  public createPrimitive(
    name: string,
    definition: PrimitiveNodeDefinition,
  ): IPrimitiveNode {
    switch (definition.kind) {
      case "box":
        return this.createLeaf(name, definition.configuration, (configuration) =>
          this.boxBuilder.build(configuration),
        );
      case "cylinder":
        return this.createLeaf(name, definition.configuration, (configuration) =>
          this.cylinderBuilder.build(configuration),
        );
      case "half-sphere":
        return this.createLeaf(name, definition.configuration, (configuration) =>
          this.halfSphereBuilder.build(configuration),
        );
      case "pyramid":
        return this.createLeaf(name, definition.configuration, (configuration) =>
          this.pyramidBuilder.build(configuration),
        );
      case "sphere":
        return this.createLeaf(name, definition.configuration, (configuration) =>
          this.sphereBuilder.build(configuration),
        );
    }
  }

  public createGroup(
    name: string,
    children?: readonly IPrimitiveNode[],
  ): IPrimitiveCompositeNode {
    return new PrimitiveCompositeNode(name, children);
  }

  public createTransform(
    name: string,
    inner: IPrimitiveNode,
    transform?: INodeTransform,
  ): IPrimitiveNode {
    return new TransformNode(name, inner, transform);
  }

  public box(name: string, configuration: IBox): IPrimitiveNode {
    return this.createPrimitive(name, {
      kind: "box",
      configuration,
    });
  }

  public cylinder(name: string, configuration: ICylinder): IPrimitiveNode {
    return this.createPrimitive(name, {
      kind: "cylinder",
      configuration,
    });
  }

  public halfSphere(name: string, configuration: IHalfSphere): IPrimitiveNode {
    return this.createPrimitive(name, {
      kind: "half-sphere",
      configuration,
    });
  }

  public pyramid(name: string, configuration: IPyramid): IPrimitiveNode {
    return this.createPrimitive(name, {
      kind: "pyramid",
      configuration,
    });
  }

  public sphere(name: string, configuration: ISphere): IPrimitiveNode {
    return this.createPrimitive(name, {
      kind: "sphere",
      configuration,
    });
  }

  private createLeaf<TConfiguration>(
    name: string,
    configuration: TConfiguration,
    instantiatePrimitive: (configuration: TConfiguration) => THREE.Object3D,
  ): IPrimitiveNode {
    return new PrimitiveLeafNode(name, configuration, instantiatePrimitive);
  }
}
