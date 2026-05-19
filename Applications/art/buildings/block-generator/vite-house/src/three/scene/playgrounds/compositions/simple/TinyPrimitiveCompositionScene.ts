import * as THREE from "three";
import {
  type IPrimitiveNode,
} from "@monorepo/core-design-pattern-composite-tree-threejs";
import type { IMaterialFactory } from "@monorepo/core-threejs-app-framework/src/Materials/IMaterialFactory.js";
import { MaterialToken } from "@monorepo/core-threejs-app-framework/src/Materials/MaterialToken.js";
import { Box } from "../../../../Builders/Box/box.js";
import { PrimitiveNodeFactory } from "../../../../PrimitiveNodeFactory.js";
import { PlaygroundSceneBase } from "../../../common/PlaygroundSceneBase.ts";
import type { IThreeScene } from "../../../IThreeScene.js";

export class TinyPrimitiveCompositionScene extends PlaygroundSceneBase {
  private _primitiveNodeFactory?: PrimitiveNodeFactory;

  public constructor(
    scene: IThreeScene,
    materialFactory: IMaterialFactory,
    viewId = "tiny-primitive-composition",
  ) {
    super(scene, "tiny-root", materialFactory, viewId);
  }

  private get primitiveNodeFactory(): PrimitiveNodeFactory {
    if (this._primitiveNodeFactory === undefined) {
      this._primitiveNodeFactory = new PrimitiveNodeFactory();
    }

    return this._primitiveNodeFactory;
  }

  protected createContent(): void {
    const sceneRoot = this.createSceneGraph();
    const object3D = sceneRoot.instantiate();

    this.applyMaterial(object3D);
    this.addToRoot(object3D);
    this.addToRoot(new THREE.AxesHelper(5));
  }

  private createSceneGraph(): IPrimitiveNode {
    const houseTemplate = this.createHouseTemplate();

    const root = this.primitiveNodeFactory.createGroup("Scene.Root");
    root.add(houseTemplate.cloneNode());

    return root;
  }

  private createHouseTemplate(): IPrimitiveNode {
    const house = this.primitiveNodeFactory.createGroup("Template.House");

    const body = this.primitiveNodeFactory.box("House.Body", new Box(2, 1, 2));
    const roof = this.primitiveNodeFactory.box("House.Roof", new Box(2.2, 0.4, 2.2));

    house.add(
      this.primitiveNodeFactory.createTransform(
        "House.Body.Instance",
        body,
        {
          position: new THREE.Vector3(0, 0.5, 0),
        },
      ),
    );

    house.add(
      this.primitiveNodeFactory.createTransform(
        "House.Roof.Instance",
        roof,
        {
          position: new THREE.Vector3(0, 1.3, 0),
          rotation: new THREE.Euler(0, 0, THREE.MathUtils.degToRad(15)),
        },
      ),
    );

    return house;
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
