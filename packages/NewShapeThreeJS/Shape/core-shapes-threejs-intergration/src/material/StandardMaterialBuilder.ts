// .../StandardMaterialBuilder.ts
import type { Material, Texture } from "three";
import { MeshStandardMaterial } from "three";
import type { IBuilder } from "../contracts/IBuilder.js";

export class StandardMaterialBuilder implements IBuilder<Material> {
  private texture?: Texture;
  private roughness?: number;
  private metalness?: number;

  public withTexture(texture: Texture): this {
    this.texture = texture;
    return this;
  }

  public withRoughness(v: number): this {
    this.roughness = v;
    return this;
  }

  public withMetalness(v: number): this {
    this.metalness = v;
    return this;
  }

  public build(): Material {
    const params: Record<string, unknown> = {};

    if (this.texture) params["map"] = this.texture;
    if (this.roughness !== undefined) params["roughness"] = this.roughness;
    if (this.metalness !== undefined) params["metalness"] = this.metalness;

    return new MeshStandardMaterial(params as any);
  }
}