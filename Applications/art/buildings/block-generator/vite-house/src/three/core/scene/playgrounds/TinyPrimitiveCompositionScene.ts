// ====================================================================================
// FILE: TinyPrimitiveCompositionScene.ts
// PURPOSE:
// - Minimal working example
// - 1 template → 1 instance → added to scene
// ====================================================================================

import * as THREE from "three";

import type { IThreeScene } from "../IThreeScene.js";
import { PlaygroundSceneBase } from "../common/PlaygroundSceneBase.js";

import type { IMaterialFactory } from "../../../Materials/IMaterialFactory.js";
import { MaterialToken } from "../../../Materials/MaterialToken.js";

import { PrimitiveFactoryComposition } from "../../../Factories/PrimitiveFactoryComposition.js";
import { PrimitiveType } from "../../../Factories/PrimitiveType.js";

import {
  PrimitiveComposite,
  PrimitiveNodeFactory,
  type IPrimitiveNode,
} from "../../../Factories/composite-tree-primetives/code.js";

export class TinyPrimitiveCompositionScene extends PlaygroundSceneBase {
  private _factory?: PrimitiveNodeFactory;

  public constructor(
    scene: IThreeScene,
    materialFactory: IMaterialFactory,
  ) {
    super(scene, "tiny-root", materialFactory);
  }

  private get factory(): PrimitiveNodeFactory {
    if (!this._factory) {
      this._factory = new PrimitiveNodeFactory(
        PrimitiveFactoryComposition.create(),
      );
    }
    return this._factory;
  }

  protected createContent(): void {
    // ----------------------------------------
    // TEMPLATE
    // ----------------------------------------

    const house = this.factory.createGroup("House");

    const body = this.factory.createPrimitive("Body", {
      type: PrimitiveType.Box,
      width: 2,
      height: 1,
      depth: 2,
    });

    const roof = this.factory.createPrimitive("Roof", {
      type: PrimitiveType.Pyramid,
      radius: 1.5,
      height: 1,
    });

    house.add(new Positioned(body, 0, 0.5, 0));
    house.add(new Positioned(roof, 0, 1.5, 0));

    // ----------------------------------------
    // SCENE COMPOSITION
    // ----------------------------------------

    const root = this.factory.createGroup("Root");
    root.add(house.cloneNode());

    const obj = root.instantiate();

    this.applyMaterial(obj);
    this.addToRoot(obj);

    // debug (optional)
    this.addToRoot(new THREE.AxesHelper(5));
  }

  private applyMaterial(root: THREE.Object3D): void {
    root.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.material = this.materialFactory.create(MaterialToken.BuildingBlue);
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  }
}

// ====================================================================================
// POSITION WRAPPER (tiny)
// ====================================================================================

class Positioned implements IPrimitiveNode {
  public constructor(
    private readonly inner: IPrimitiveNode,
    private readonly x: number,
    private readonly y: number,
    private readonly z: number,
  ) {}

  public get name(): string {
    return this.inner.name;
  }

  public operation(): void {
    this.inner.operation();
  }

  public getChildren(): readonly IPrimitiveNode[] {
    return this.inner.getChildren();
  }

  public instantiate(): THREE.Object3D {
    const o = this.inner.instantiate();
    o.position.set(this.x, this.y, this.z);
    return o;
  }

  public cloneNode(): IPrimitiveNode {
    return new Positioned(
      this.inner.cloneNode(),
      this.x,
      this.y,
      this.z,
    );
  }
}