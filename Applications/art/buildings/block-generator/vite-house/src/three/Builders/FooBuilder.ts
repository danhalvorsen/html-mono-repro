import * as THREE from "three";
import type { IBuilder } from "./GroundBuilder";
import type { MaterialFactory } from "../Materials/MaterialFactory";
export class FooBuilder implements IBuilder<THREE.Object3D> {
  private materialFactory: MaterialFactory | null = null;
  private material: THREE.Material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
  });
  private position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private dimensions: { width: number; height: number; depth: number } = {
    width: 1,
    height: 1,
    depth: 1,
  };

  buildExampleResponse(): THREE.Object3D<THREE.Object3DEventMap> {
    return this.withBox(1, 1, 1).build();
  }

  withMaterial(materialFactory: MaterialFactory): this {
    this.materialFactory = materialFactory;
    this.material = materialFactory.create("building-white");
    return this;
  }

  withPosition(x: number, y: number, z: number): this {
    this.position.set(x, y, z);
    return this;
  }

  withDimensions(width: number, height: number, depth: number): this {
    this.dimensions = { width, height, depth };
    return this;
  }

  withBox(width: number, height: number, depth: number): this {
    return this.withDimensions(width, height, depth);
  }

  build(): THREE.Object3D {
    const geometry = new THREE.BoxGeometry(
      this.dimensions.width,
      this.dimensions.height,
      this.dimensions.depth,
    );

    const material = this.materialFactory
      ? this.material
      : new THREE.MeshStandardMaterial({ color: 0xffffff });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(this.position);

    return mesh;

  }
}
