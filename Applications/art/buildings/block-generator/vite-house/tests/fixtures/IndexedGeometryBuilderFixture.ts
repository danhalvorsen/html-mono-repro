// ====================================================================================
// FILE: tests/fixtures/IndexedGeometryBuilderFixture.ts
// ====================================================================================

import * as THREE from "three";
import { IndexedGeometryBuilder } from "../../src/three/geometry/IndexedGeometryBuilder.js";

export class IndexedGeometryBuilderFixture {
  public createSut(): IndexedGeometryBuilder {
    return IndexedGeometryBuilder.create();
  }

  public createWall1Start(): THREE.Vector2 {
    return new THREE.Vector2(0, 0);
  }

  public createWall1End(): THREE.Vector2 {
    return new THREE.Vector2(4, 0.3);
  }

  public createWall2Start(): THREE.Vector2 {
    return new THREE.Vector2(0, 2.7);
  }

  public createWall2End(): THREE.Vector2 {
    return new THREE.Vector2(4, 3);
  }

  public createWall3Start(): THREE.Vector2 {
    return new THREE.Vector2(0, 0);
  }

  public createWall3End(): THREE.Vector2 {
    return new THREE.Vector2(0.3, 3);
  }

  public createWall4Start(): THREE.Vector2 {
    return new THREE.Vector2(3.7, 0);
  }

  public createWall4End(): THREE.Vector2 {
    return new THREE.Vector2(4, 3);
  }

  public createWall5Start(): THREE.Vector2 {
    return new THREE.Vector2(1.2, 1.2);
  }

  public createWall5End(): THREE.Vector2 {
    return new THREE.Vector2(2.8, 1.8);
  }

  public createHeight(): number {
    return 1.2;
  }

  public createConfiguredRoofRingSut(): IndexedGeometryBuilder {
    const height = this.createHeight();

    return this.createSut()
      .with(this.createWall1Start(), this.createWall1End()).withLoft(height)
      .with(this.createWall2Start(), this.createWall2End()).withLoft(height)
      .with(this.createWall3Start(), this.createWall3End()).withLoft(height)
      .with(this.createWall4Start(), this.createWall4End()).withLoft(height);
  }

  public createConfiguredFiveBoxesSut(): IndexedGeometryBuilder {
    const height = this.createHeight();

    return this.createSut()
      .with(this.createWall1Start(), this.createWall1End()).withLoft(height)
      .with(this.createWall2Start(), this.createWall2End()).withLoft(height)
      .with(this.createWall3Start(), this.createWall3End()).withLoft(height)
      .with(this.createWall4Start(), this.createWall4End()).withLoft(height)
      .with(this.createWall5Start(), this.createWall5End()).withLoft(height);
  }
}