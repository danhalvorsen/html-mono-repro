// ====================================================================================
// FILE: three/builders/MeshBuilder.ts
// ====================================================================================

import * as THREE from "three";
import type { ITokenMaterialMeshBuilder } from "./ITokenMaterialMeshBuilder";
import type { IMaterialFactory } from "../Materials/IMaterialFactory";
import type { MaterialToken } from "../Materials/MaterialToken";
 
type MeshBuilderState = Readonly<{
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  castShadow: boolean;
  receiveShadow: boolean;
}>;

export class MeshBuilder implements ITokenMaterialMeshBuilder {
  private readonly state: MeshBuilderState;
  private readonly materialFactory: IMaterialFactory;

  private constructor(
    materialFactory: IMaterialFactory,
    state: MeshBuilderState,
  ) {
    this.materialFactory = materialFactory;
    this.state = state;
  }

  public static create(materialFactory: IMaterialFactory): MeshBuilder {
    return new MeshBuilder(materialFactory, {
      geometry: new THREE.BoxGeometry(1, 1, 1),
      material: materialFactory.create("building-white"),
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(1, 1, 1),
      castShadow: true,
      receiveShadow: true,
    });
  }

  public withGeometry(geometry: THREE.BufferGeometry): MeshBuilder {
    return new MeshBuilder(this.materialFactory, {
      ...this.state,
      geometry,
    });
  }

  public withMaterial(material: THREE.Material): MeshBuilder {
    return new MeshBuilder(this.materialFactory, {
      ...this.state,
      material,
    });
  }

  public withMaterialToken(token: MaterialToken): MeshBuilder {
    return new MeshBuilder(this.materialFactory, {
      ...this.state,
      material: this.materialFactory.create(token),
    });
  }

  public withPosition(x: number, y: number, z: number): MeshBuilder {
    return new MeshBuilder(this.materialFactory, {
      ...this.state,
      position: new THREE.Vector3(x, y, z),
    });
  }

  public withRotation(x: number, y: number, z: number): MeshBuilder {
    return new MeshBuilder(this.materialFactory, {
      ...this.state,
      rotation: new THREE.Euler(x, y, z),
    });
  }

  public withScale(x: number, y: number, z: number): MeshBuilder {
    return new MeshBuilder(this.materialFactory, {
      ...this.state,
      scale: new THREE.Vector3(x, y, z),
    });
  }

  public withShadow(cast: boolean, receive: boolean): MeshBuilder {
    return new MeshBuilder(this.materialFactory, {
      ...this.state,
      castShadow: cast,
      receiveShadow: receive,
    });
  }

  public build(): THREE.Mesh {
    const mesh = new THREE.Mesh(this.state.geometry, this.state.material);

    mesh.position.copy(this.state.position);
    mesh.rotation.copy(this.state.rotation);
    mesh.scale.copy(this.state.scale);
    mesh.castShadow = this.state.castShadow;
    mesh.receiveShadow = this.state.receiveShadow;

    return mesh;
  }
}