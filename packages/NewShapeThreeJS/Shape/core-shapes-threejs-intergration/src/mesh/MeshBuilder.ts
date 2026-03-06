// packages/NewShapeThreeJS/core-shapes-threejs-samples/src/mesh/MeshBuilder.ts
import type { Material, Mesh } from "three";
import { BoxGeometry, Mesh as ThreeMesh } from "three";
import type { IBuilder } from "../contracts/IBuilder.js";

export type BoxMeshOptions = Readonly<{
  width: number;
  height: number;
  depth: number;
  material: Material;
}>;

export class BoxMeshBuilder implements IBuilder<Mesh> {
  private opts: BoxMeshOptions;

  public constructor(material: Material) {
    this.opts = { width: 1, height: 1, depth: 1, material };
  }

  public withSize(width: number, height: number, depth: number): this {
    this.opts = { ...this.opts, width, height, depth };
    return this;
  }

  public build(): Mesh {
    const g = new BoxGeometry(this.opts.width, this.opts.height, this.opts.depth);
    return new ThreeMesh(g, this.opts.material);
  }
}