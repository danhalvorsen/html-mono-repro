// ====================================================================================
// FILE: three/buildings/SmallSkyScraperBuilder.ts
// ====================================================================================

import * as THREE from "three";
import type { IMaterialFactory } from "../../../core-threejs-app-framework/src/Materials/IMaterialFactory";

import { MeshBuilder } from "./MeshBuilder";
import type {
  ISmallSkyScraper,
  ISmallSkyScraperBuilder,
} from "./ISmallSkyScraperBuilder";
import { IndexedGeometryBuilder } from "../../../core-threejs-app-framework/src/geometry/IndexedGeometryBuilder";

export class SmallSkyScraperBuilder implements ISmallSkyScraperBuilder {
  public constructor(
    private readonly materialFactory: IMaterialFactory,
  ) {
  }

  public build(configuration: ISmallSkyScraper): THREE.Group {
    const group = new THREE.Group();
    group.name = "small-skyscraper";
    group.position.copy(configuration.position);

    const bodyHeight = configuration.levels * configuration.levelHeight;
    const bodyCenterY = bodyHeight / 2;

    const body = MeshBuilder.create(this.materialFactory)
      .withGeometry(
        new THREE.BoxGeometry(configuration.width, bodyHeight, configuration.depth),
      )
      .withMaterialToken(configuration.facadeToken)
      .withPosition(0, bodyCenterY, 0)
      .build();

    group.add(body);

    this.addRoof(group, bodyHeight, configuration);
    this.addLeftWindows(group, configuration);
    this.addFrontWindows(group, configuration);
    this.addBalconies(group, configuration);

    return group;
  }

  private addRoof(
    group: THREE.Group,
    bodyHeight: number,
    configuration: ISmallSkyScraper,
  ): void {
    const roofBorderHeight = 0.35;
    const roofOverhang = 0.275;
    const roofRingThickness = 0.34;
    const roofTopHeight = 0.08;
    const roofTopInset = 0.34;

    const outerMinX = -(configuration.width / 2) - roofOverhang;
    const outerMaxX = configuration.width / 2 + roofOverhang;
    const outerMinY = -(configuration.depth / 2) - roofOverhang;
    const outerMaxY = configuration.depth / 2 + roofOverhang;

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
      .withMaterialToken(configuration.roofBorderToken)
      .withPosition(0, bodyHeight, 0)
      .build();

    group.add(roofBorder);
    const roofTopLift = 0.1;

    const roofTop = MeshBuilder.create(this.materialFactory)
      .withGeometry(
        new THREE.BoxGeometry(
          configuration.width - roofTopInset,
          roofTopHeight,
          configuration.depth - roofTopInset,
        ),
      )
      .withMaterialToken(configuration.roofTopToken)
      .withPosition(0, bodyHeight + roofTopHeight / 2 + roofTopLift, 0)
      .build();

    group.add(roofTop);
  }

  private addLeftWindows(group: THREE.Group, configuration: ISmallSkyScraper): void {
    const columns = 1;
    const rows = configuration.levels;
    const windowWidth = configuration.width * 0.18;
    const windowHeight = configuration.levelHeight * 0.48;
    const windowDepth = 0.06;

    const sideX = -(configuration.width / 2) - 0.01;
    const startY = configuration.levelHeight * 0.5;
    const z = -(configuration.depth * 0.24);

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const mesh = MeshBuilder.create(this.materialFactory)
          .withGeometry(
            new THREE.BoxGeometry(windowDepth, windowHeight, windowWidth),
          )
          .withMaterialToken(configuration.windowToken)
          .withPosition(
            sideX,
            startY + row * configuration.levelHeight,
            z + column * (windowWidth * 1.5),
          )
          .build();

        group.add(mesh);
      }
    }
  }

  private addFrontWindows(group: THREE.Group, configuration: ISmallSkyScraper): void {
    const columns = 2;
    const rows = configuration.levels;
    const windowWidth = configuration.width * 0.19;
    const windowHeight = configuration.levelHeight * 0.48;
    const windowDepth = 0.06;

    const startX = -(configuration.width * 0.22);
    const spacingX = configuration.width * 0.44;
    const startY = configuration.levelHeight * 0.5;
    const z = configuration.depth / 2 + 0.01;

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const mesh = MeshBuilder.create(this.materialFactory)
          .withGeometry(
            new THREE.BoxGeometry(windowWidth, windowHeight, windowDepth),
          )
          .withMaterialToken(configuration.windowToken)
          .withPosition(
            startX + column * spacingX,
            startY + row * configuration.levelHeight,
            z,
          )
          .build();

        group.add(mesh);
      }
    }
  }

  private addBalconies(group: THREE.Group, configuration: ISmallSkyScraper): void {
    const balconyCount = Math.max(1, configuration.levels - 1);

    const balconyWidth = configuration.width * 0.6;
    const slabHeight = configuration.levelHeight * 0.14;
    const balconyDepth = 0.48;

    const railHeight = configuration.levelHeight * 0.36;
    const railThickness = 0.06;
    const postWidth = 0.06;

    const balconyCenterX = 0;
    const balconyCenterZ = configuration.depth / 2 + balconyDepth / 2 + 0.02;
    const firstBalconyCenterY = configuration.levelHeight * 0.78;

    for (let index = 0; index < balconyCount; index++) {
      const centerY = firstBalconyCenterY + index * configuration.levelHeight;

      const slab = MeshBuilder.create(this.materialFactory)
        .withGeometry(
          new THREE.BoxGeometry(balconyWidth, slabHeight, balconyDepth),
        )
        .withMaterialToken(configuration.balconyToken)
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
          configuration.depth / 2 + balconyDepth + 0.01,
        )
        .build();

      group.add(frontRail);

      const sideRailOffsetX = balconyWidth / 2 - railThickness / 2;
      const sideRailZ = configuration.depth / 2 + balconyDepth / 2;

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
      const postZ = configuration.depth / 2 + balconyDepth - railThickness * 0.5;

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

}
