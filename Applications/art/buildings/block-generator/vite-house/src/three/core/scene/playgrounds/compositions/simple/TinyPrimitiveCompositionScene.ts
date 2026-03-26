import * as THREE from "three";
import { PrimitiveNodeFactory, type IPrimitiveNode } from "../../composistionthee.Playground";
import { PrimitiveType } from "../../../../../Factories/composite-tree-primetives/PrimitiveType";
import type { IMaterialFactory } from "../../../../../Materials/IMaterialFactory";
import { MaterialToken } from "../../../../../Materials/MaterialToken";
import { PlaygroundSceneBase } from "../../../common/PlaygroundSceneBase";
import type { IThreeScene } from "../../../IThreeScene";
import { ThreePrimitiveFactory } from "../../../../../Factories/composite-tree-primetives/ThreePrimitiveFactory";

export class TinyPrimitiveCompositionScene extends PlaygroundSceneBase {
  private _primitiveNodeFactory?: PrimitiveNodeFactory;

  public constructor(
    scene: IThreeScene,
    materialFactory: IMaterialFactory,
  ) {
    super(scene, "tiny-root", materialFactory);
  }

  private get primitiveNodeFactory(): PrimitiveNodeFactory {
    if (this._primitiveNodeFactory === undefined) {
      this._primitiveNodeFactory = new PrimitiveNodeFactory(
        new ThreePrimitiveFactory() as never,
      );
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

    const body = this.primitiveNodeFactory.createPrimitive("House.Body", {
      type: PrimitiveType.Box,
      width: 2,
      height: 1,
      depth: 2,
    });

    const roof = this.primitiveNodeFactory.createPrimitive("House.Roof", {
      type: PrimitiveType.Box,
      width: 2.2,
      height: 0.4,
      depth: 2.2,
    });

    house.add(
      PositionedPrimitiveNode.create(
        "House.Body.Instance",
        body,
        new THREE.Vector3(0, 0.5, 0),
      ),
    );

    house.add(
      PositionedPrimitiveNode.create(
        "House.Roof.Instance",
        roof,
        new THREE.Vector3(0, 1.3, 0),
        new THREE.Euler(0, 0, THREE.MathUtils.degToRad(15)),
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

interface IPrimitiveTransform {
  readonly position: THREE.Vector3;
  readonly rotation: THREE.Euler;
  readonly scale: THREE.Vector3;
}

class PositionedPrimitiveNode implements IPrimitiveNode {
  public readonly name: string;
  private readonly inner: IPrimitiveNode;
  private readonly transform: IPrimitiveTransform;

  private constructor(
    name: string,
    inner: IPrimitiveNode,
    transform: IPrimitiveTransform,
  ) {
    this.name = name;
    this.inner = inner;
    this.transform = {
      position: transform.position.clone(),
      rotation: transform.rotation.clone(),
      scale: transform.scale.clone(),
    };
  }

  public static create(
    name: string,
    inner: IPrimitiveNode,
    position: THREE.Vector3,
    rotation?: THREE.Euler,
    scale?: THREE.Vector3,
  ): PositionedPrimitiveNode {
    return new PositionedPrimitiveNode(name, inner, {
      position,
      rotation: rotation ?? new THREE.Euler(0, 0, 0),
      scale: scale ?? new THREE.Vector3(1, 1, 1),
    });
  }

  public operation(): void {
    this.inner.operation();
  }

  public getChildren(): readonly IPrimitiveNode[] {
    return [this.inner];
  }

  public instantiate(): THREE.Object3D {
    const wrapper = new THREE.Group();
    wrapper.name = this.name;
    wrapper.position.copy(this.transform.position);
    wrapper.rotation.copy(this.transform.rotation);
    wrapper.scale.copy(this.transform.scale);
    wrapper.add(this.inner.instantiate());
    return wrapper;
  }

  public cloneNode(): IPrimitiveNode {
    return PositionedPrimitiveNode.create(
      this.name,
      this.inner.cloneNode(),
      this.transform.position.clone(),
      this.transform.rotation.clone(),
      this.transform.scale.clone(),
    );
  }
}