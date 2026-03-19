// ====================================================================================
// FILE: three/buildings/SmallSkyScraperBuilder.ts
// ====================================================================================

import * as THREE from "three";
import type { IMaterialFactory } from "./Materials/IMaterialFactory";
import type { MaterialToken } from "./Materials/MaterialToken";

import { MeshBuilder } from "./MeshBuilder";
import type { ISmallSkyScraperBuilder } from "./ISmallSkyScraperBuilder";
import { IndexedGeometryBuilder } from "../three/Builders/geometry/IndexedGeometryBuilder";

type SmallSkyScraperState = Readonly<{
  levels: number;
  width: number;
  depth: number;
  levelHeight: number;
  position: THREE.Vector3;
  facadeToken: MaterialToken;
  roofBorderToken: MaterialToken;
  roofTopToken: MaterialToken;
  windowToken: MaterialToken;
  balconyToken: MaterialToken;
}>;

export class SmallSkyScraperBuilder implements ISmallSkyScraperBuilder {
  private readonly state: SmallSkyScraperState;
  private readonly materialFactory: IMaterialFactory;

  private constructor(
    materialFactory: IMaterialFactory,
    state: SmallSkyScraperState,
  ) {
    this.materialFactory = materialFactory;
    this.state = state;
  }

  public static create(
    materialFactory: IMaterialFactory,
  ): SmallSkyScraperBuilder {
    return new SmallSkyScraperBuilder(materialFactory, {
      levels: 5,
      width: 4,
      depth: 3.2,
      levelHeight: 1.8,
      position: new THREE.Vector3(0, 0, 0),
      facadeToken: "building-red",
      roofBorderToken: "window-frame",
      roofTopToken: "roof-accent",
      windowToken: "window-glass",
      balconyToken: "building-red",
    });
  }

  public withLevels(levels: number): SmallSkyScraperBuilder {
    this.ensurePositiveInteger(levels, "levels");

    return new SmallSkyScraperBuilder(this.materialFactory, {
      ...this.state,
      levels,
    });
  }

  public withWidth(width: number): SmallSkyScraperBuilder {
    this.ensurePositive(width, "width");

    return new SmallSkyScraperBuilder(this.materialFactory, {
      ...this.state,
      width,
    });
  }

  public withDepth(depth: number): SmallSkyScraperBuilder {
    this.ensurePositive(depth, "depth");

    return new SmallSkyScraperBuilder(this.materialFactory, {
      ...this.state,
      depth,
    });
  }

  public withLevelHeight(levelHeight: number): SmallSkyScraperBuilder {
    this.ensurePositive(levelHeight, "levelHeight");

    return new SmallSkyScraperBuilder(this.materialFactory, {
      ...this.state,
      levelHeight,
    });
  }

  public withPosition(x: number, y: number, z: number): SmallSkyScraperBuilder {
    return new SmallSkyScraperBuilder(this.materialFactory, {
      ...this.state,
      position: new THREE.Vector3(x, y, z),
    });
  }

  public build(): THREE.Group {
    const group = new THREE.Group();
    group.name = "small-skyscraper";
    group.position.copy(this.state.position);

    const bodyHeight = this.state.levels * this.state.levelHeight;
    const bodyCenterY = bodyHeight / 2;

    const body = MeshBuilder.create(this.materialFactory)
      .withGeometry(
        new THREE.BoxGeometry(this.state.width, bodyHeight, this.state.depth),
      )
      .withMaterialToken(this.state.facadeToken)
      .withPosition(0, bodyCenterY, 0)
      .build();

    group.add(body);

    this.addRoof(group, bodyHeight);
    this.addLeftWindows(group);
    this.addFrontWindows(group);
    this.addBalconies(group);

    return group;
  }

  private addRoof(group: THREE.Group, bodyHeight: number): void {
    const roofBorderHeight = 0.35;
    const roofOverhang = 0.275;
    const roofRingThickness = 0.34;
    const roofTopHeight = 0.08;
    const roofTopInset = 0.34;

    const outerMinX = -(this.state.width / 2) - roofOverhang;
    const outerMaxX = this.state.width / 2 + roofOverhang;
    const outerMinY = -(this.state.depth / 2) - roofOverhang;
    const outerMaxY = this.state.depth / 2 + roofOverhang;

    const innerMinX = outerMinX + roofRingThickness;
    const innerMaxX = outerMaxX - roofRingThickness;
    const innerMinY = outerMinY + roofRingThickness;
    const innerMaxY = outerMaxY - roofRingThickness;

    const roofBorderGeometry = IndexedGeometryBuilder.create()
      .with(
        new THREE.Vector2(outerMinX, outerMinY),
        new THREE.Vector2(outerMaxX, innerMinY),
      )
      .withLoft(roofBorderHeight)
      .with(
        new THREE.Vector2(outerMinX, innerMaxY),
        new THREE.Vector2(outerMaxX, outerMaxY),
      )
      .withLoft(roofBorderHeight)
      .with(
        new THREE.Vector2(outerMinX, innerMinY),
        new THREE.Vector2(innerMinX, innerMaxY),
      )
      .withLoft(roofBorderHeight)
      .with(
        new THREE.Vector2(innerMaxX, innerMinY),
        new THREE.Vector2(outerMaxX, innerMaxY),
      )
      .withLoft(roofBorderHeight)
      .build();

    roofBorderGeometry.rotateX(-Math.PI / 2);

    const roofBorder = MeshBuilder.create(this.materialFactory)
      .withGeometry(roofBorderGeometry)
      .withMaterialToken(this.state.roofBorderToken)
      .withPosition(0, bodyHeight, 0)
      .build();

    group.add(roofBorder);
    const roofTopLift = 0.1;

    const roofTop = MeshBuilder.create(this.materialFactory)
      .withGeometry(
        new THREE.BoxGeometry(
          this.state.width - roofTopInset,
          roofTopHeight,
          this.state.depth - roofTopInset,
        ),
      )
      .withMaterialToken(this.state.roofTopToken)
      .withPosition(0, bodyHeight + roofTopHeight / 2 + roofTopLift, 0)
      .build();

    group.add(roofTop);
  }

  private addLeftWindows(group: THREE.Group): void {
    const columns = 1;
    const rows = this.state.levels;
    const windowWidth = this.state.width * 0.18;
    const windowHeight = this.state.levelHeight * 0.48;
    const windowDepth = 0.06;

    const sideX = -(this.state.width / 2) - 0.01;
    const startY = this.state.levelHeight * 0.5;
    const z = -(this.state.depth * 0.24);

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const mesh = MeshBuilder.create(this.materialFactory)
          .withGeometry(
            new THREE.BoxGeometry(windowDepth, windowHeight, windowWidth),
          )
          .withMaterialToken(this.state.windowToken)
          .withPosition(
            sideX,
            startY + row * this.state.levelHeight,
            z + column * (windowWidth * 1.5),
          )
          .build();

        group.add(mesh);
      }
    }
  }

  private addFrontWindows(group: THREE.Group): void {
    const columns = 2;
    const rows = this.state.levels;
    const windowWidth = this.state.width * 0.19;
    const windowHeight = this.state.levelHeight * 0.48;
    const windowDepth = 0.06;

    const startX = -(this.state.width * 0.22);
    const spacingX = this.state.width * 0.44;
    const startY = this.state.levelHeight * 0.5;
    const z = this.state.depth / 2 + 0.01;

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const mesh = MeshBuilder.create(this.materialFactory)
          .withGeometry(
            new THREE.BoxGeometry(windowWidth, windowHeight, windowDepth),
          )
          .withMaterialToken(this.state.windowToken)
          .withPosition(
            startX + column * spacingX,
            startY + row * this.state.levelHeight,
            z,
          )
          .build();

        group.add(mesh);
      }
    }
  }

  private addBalconies(group: THREE.Group): void {
    const balconyCount = Math.max(1, this.state.levels - 1);

    const balconyWidth = this.state.width * 0.6;
    const slabHeight = this.state.levelHeight * 0.14;
    const balconyDepth = 0.48;

    const railHeight = this.state.levelHeight * 0.36;
    const railThickness = 0.06;
    const postWidth = 0.06;

    const balconyCenterX = 0;
    const balconyCenterZ = this.state.depth / 2 + balconyDepth / 2 + 0.02;
    const firstBalconyCenterY = this.state.levelHeight * 0.78;

    for (let index = 0; index < balconyCount; index++) {
      const centerY = firstBalconyCenterY + index * this.state.levelHeight;

      const slab = MeshBuilder.create(this.materialFactory)
        .withGeometry(
          new THREE.BoxGeometry(balconyWidth, slabHeight, balconyDepth),
        )
        .withMaterialToken(this.state.balconyToken)
        .withPosition(balconyCenterX, centerY, balconyCenterZ)
        .build();

      group.add(slab);

      const railCenterY = centerY + slabHeight / 2 + railHeight / 2;

      const frontRail = MeshBuilder.create(this.materialFactory)
        .withGeometry(
          new THREE.BoxGeometry(balconyWidth, railHeight, railThickness),
        )
        .withMaterialToken("window-frame")
        .withPosition(
          balconyCenterX,
          railCenterY,
          this.state.depth / 2 + balconyDepth + 0.01,
        )
        .build();

      group.add(frontRail);

      const sideRailOffsetX = balconyWidth / 2 - railThickness / 2;
      const sideRailZ = this.state.depth / 2 + balconyDepth / 2;

      const leftRail = MeshBuilder.create(this.materialFactory)
        .withGeometry(
          new THREE.BoxGeometry(railThickness, railHeight, balconyDepth),
        )
        .withMaterialToken("window-frame")
        .withPosition(balconyCenterX - sideRailOffsetX, railCenterY, sideRailZ)
        .build();

      const rightRail = MeshBuilder.create(this.materialFactory)
        .withGeometry(
          new THREE.BoxGeometry(railThickness, railHeight, balconyDepth),
        )
        .withMaterialToken("window-frame")
        .withPosition(balconyCenterX + sideRailOffsetX, railCenterY, sideRailZ)
        .build();

      group.add(leftRail);
      group.add(rightRail);

      const postOffsetX = balconyWidth * 0.32;
      const postZ = this.state.depth / 2 + balconyDepth - railThickness * 0.5;

      const leftPost = MeshBuilder.create(this.materialFactory)
        .withGeometry(new THREE.BoxGeometry(postWidth, railHeight, postWidth))
        .withMaterialToken("window-frame")
        .withPosition(balconyCenterX - postOffsetX, railCenterY, postZ)
        .build();

      const rightPost = MeshBuilder.create(this.materialFactory)
        .withGeometry(new THREE.BoxGeometry(postWidth, railHeight, postWidth))
        .withMaterialToken("window-frame")
        .withPosition(balconyCenterX + postOffsetX, railCenterY, postZ)
        .build();

      group.add(leftPost);
      group.add(rightPost);
    }
  }

  private ensurePositive(value: number, name: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${name} must be greater than zero.`);
    }
  }

  private ensurePositiveInteger(value: number, name: string): void {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(`${name} must be a positive integer.`);
    }
  }
}
