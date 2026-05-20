import * as THREE from "three";
import type { IMaterialFactory } from "@monorepo/core-threejs-app-framework/src/Materials/IMaterialFactory.js";
import type { IThreeScene } from "../IThreeScene.js";
import { PlaygroundSceneBase } from "../common/PlaygroundSceneBase.ts";
import { HouseComposer, type HouseStyleVariant } from "./houses-library/HouseComposer.ts";
import { HOUSE_PALETTES } from "./houses-library/HousePalette.ts";

export class HousesCollectionPlaygroundScene extends PlaygroundSceneBase {
  public constructor(
    scene: IThreeScene,
    materialFactory: IMaterialFactory,
    viewId = "houses-collection",
  ) {
    super(scene, "houses-collection-root", materialFactory, viewId);
  }

  protected override createDefaultGround(): void {
    super.createDefaultGround(62, 1, 62);
  }

  protected override createContent(): void {
    const root = new THREE.Group();
    root.name = "houses-collection";

    const composer = new HouseComposer();
    const modern: readonly HouseStyleVariant[] = [
      "modern-peaked",
      "modern-butterfly",
      "modern-flat",
      "modern-sloped",
      "modern-flat-sloped-out",
      "modern-flat-sloped-in",
    ];
    const ranch: readonly HouseStyleVariant[] = [
      "ranch-open-gable",
      "ranch-overlaid-hip",
      "ranch-intersecting-hip",
      "ranch-cross-hipped",
      "ranch-hipped",
      "ranch-open-gable-hip-wings",
    ];
    const spacingX = 9.5;
    const spacingZ = 7.5;
    const startLeftX = -18;
    const startRightX = 8;
    const startZ = -18;

    let seed = 1;
    for (let i = 0; i < modern.length; i += 1) {
      const variant = modern[i];
      const palette = HOUSE_PALETTES[(i + seed) % HOUSE_PALETTES.length] ?? HOUSE_PALETTES[0];
      const house = composer.create(variant, palette, seed);
      seed += 1;
      house.position.set(startLeftX, 0, startZ + (i * spacingZ));
      house.rotation.y = 0.12;
      root.add(house);
    }

    for (let i = 0; i < ranch.length; i += 1) {
      const variant = ranch[i];
      const palette = HOUSE_PALETTES[(i + 2 + seed) % HOUSE_PALETTES.length] ?? HOUSE_PALETTES[0];
      const house = composer.create(variant, palette, seed);
      seed += 1;
      house.position.set(startRightX, 0, startZ + (i * spacingZ));
      house.rotation.y = -0.1;
      root.add(house);
    }

    this.addToRoot(root, new THREE.AxesHelper(7));
  }
}
