import * as THREE from "three";
import type { IHousePalette } from "./HousePalette.ts";

export class HouseElements {
  private readonly wallMat: THREE.Material;
  private readonly accentMat: THREE.Material;
  private readonly roofMat: THREE.Material;
  private readonly baseMat: THREE.Material;
  private readonly windowMat: THREE.Material;

  public constructor(palette: IHousePalette) {
    this.wallMat = new THREE.MeshStandardMaterial({ color: palette.wall, roughness: 0.72, metalness: 0.02 });
    this.accentMat = new THREE.MeshStandardMaterial({ color: palette.accent, roughness: 0.56, metalness: 0.05 });
    this.roofMat = new THREE.MeshStandardMaterial({ color: palette.roof, roughness: 0.64, metalness: 0.03 });
    this.baseMat = new THREE.MeshStandardMaterial({ color: palette.base, roughness: 0.82, metalness: 0.01 });
    this.windowMat = new THREE.MeshStandardMaterial({ color: palette.window, roughness: 0.2, metalness: 0.1 });
  }

  public baseSlab(width: number, depth: number): THREE.Mesh {
    return this.mesh(new THREE.BoxGeometry(width, 0.24, depth), this.baseMat, [0, 0.12, 0], false);
  }

  public boxMass(width: number, height: number, depth: number, useAccent = false): THREE.Mesh {
    return this.mesh(
      new THREE.BoxGeometry(width, height, depth),
      useAccent ? this.accentMat : this.wallMat,
      [0, height * 0.5 + 0.24, 0],
      true,
    );
  }

  public flatRoof(width: number, depth: number, topY: number): THREE.Mesh {
    return this.mesh(new THREE.BoxGeometry(width, 0.16, depth), this.roofMat, [0, topY + 0.08, 0], true);
  }

  public pitchedRoof(width: number, depth: number, topY: number, degrees: number): THREE.Mesh {
    const roof = this.mesh(new THREE.BoxGeometry(width, 0.18, depth), this.roofMat, [0, topY + 0.16, 0], true);
    roof.rotation.x = THREE.MathUtils.degToRad(degrees);
    return roof;
  }

  public door(x: number, y: number, z: number): THREE.Mesh {
    return this.mesh(new THREE.BoxGeometry(0.44, 0.88, 0.09), this.accentMat, [x, y, z], false);
  }

  public window(x: number, y: number, z: number, width = 0.52, height = 0.34): THREE.Mesh {
    return this.mesh(new THREE.BoxGeometry(width, height, 0.07), this.windowMat, [x, y, z], false);
  }

  public stairs(width: number, steps: number, rise: number, run: number): THREE.Group {
    const group = new THREE.Group();
    for (let i = 0; i < steps; i += 1) {
      const step = this.mesh(
        new THREE.BoxGeometry(width, rise, run),
        this.baseMat,
        [0, (i * rise) + (rise * 0.5), -(i * run)],
        true,
      );
      group.add(step);
    }
    return group;
  }

  private mesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    position: readonly [number, number, number],
    castShadow: boolean,
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    return mesh;
  }
}
