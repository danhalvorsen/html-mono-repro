import * as THREE from "three";

import type { IThreeScene } from "../IThreeScene.js";
import { PlaygroundSceneBase } from "../common/PlaygroundSceneBase.js";

import type { IMaterialFactory } from "../../../Materials/IMaterialFactory.js";
import { MaterialToken } from "../../../Materials/MaterialToken.js";

import { PrimitiveFactoryComposition } from "../../../Factories/PrimitiveFactoryComposition.js";

import { PrimitiveType } from "../../../Factories/composite-tree-primetives/PrimitiveType.js";
import { type IPrimitiveNode } from "../../../Factories/composite-tree-primetives/IPrimitiveNode.js";
import { PrimitiveNodeFactory } from "../../../Factories/composite-tree-primetives/PrimitiveNodeFactory.js";

export class TinyPrimitiveCompositionScene extends PlaygroundSceneBase {
  private _factory?: PrimitiveNodeFactory;

  public constructor(
    scene: IThreeScene,
    materialFactory: IMaterialFactory,
  ) {
    super(scene, "tiny-root", materialFactory);
  }

  private get factory(): PrimitiveNodeFactory {
    if (this._factory === undefined) {
      this._factory = new PrimitiveNodeFactory(
        PrimitiveFactoryComposition.create(),
      );
    }

    return this._factory;
  }

  protected createContent(): void {
    const house = this.factory.createGroup("Template.House");

    const body = this.factory.createPrimitive("House.Body", {
      type: PrimitiveType.Box,
      width: 2,
      height: 1,
      depth: 2,
    });

    const roof = this.factory.createPrimitive("House.Roof", {
      type: PrimitiveType.Box,
      width: 2.2,
      height: 0.4,
      depth: 2.2,
    });

    house.add(new PositionedPrimitiveNode(
      "House.Body.Instance",
      body,
      new THREE.Vector3(0, 0.5, 0),
    ));

    house.add(new PositionedPrimitiveNode(
      "House.Roof.Instance",
      roof,
      new THREE.Vector3(0, 1.3, 0),
      new THREE.Euler(0, 0, THREE.MathUtils.degToRad(15)),
    ));

    const root = this.factory.createGroup("Scene.Root");
    root.add(house.cloneNode());

    const object3D = root.instantiate();

    this.applyMaterial(object3D);
    this.addToRoot(object3D);
    this.addToRoot(new THREE.AxesHelper(5));
  }

  private applyMaterial(root: THREE.Object3D): void {
    root.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) {
        return;
      }

      node.material = this.materialFactory.create(MaterialToken.BuildingBlue);
      node.castShadow = true;
      node.receiveShadow = true;
    });
  }
}

class PositionedPrimitiveNode implements IPrimitiveNode {
  public constructor(
    public readonly name: string,
    private readonly inner: IPrimitiveNode,
    private readonly position: THREE.Vector3,
    private readonly rotation: THREE.Euler = new THREE.Euler(0, 0, 0),
    private readonly scale: THREE.Vector3 = new THREE.Vector3(1, 1, 1),
  ) {}

  public getChildren(): readonly IPrimitiveNode[] {
    return this.inner.getChildren();
  }

  public instantiate(): THREE.Object3D {
    const instance = this.inner.instantiate();
    instance.name = this.name;
    instance.position.copy(this.position);
    instance.rotation.copy(this.rotation);
    instance.scale.copy(this.scale);
    return instance;
  }

  public cloneNode(): IPrimitiveNode {
    return new PositionedPrimitiveNode(
      this.name,
      this.inner.cloneNode(),
      this.position.clone(),
      this.rotation.clone(),
      this.scale.clone(),
    );
  }
}