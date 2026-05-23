import * as THREE from "three";
import { Vector2Gpu } from "@monorepo/core-math-gpu";
import { BoxCompositionRoot } from "@monorepo/core-math-rectangle";
import type { IOccupiedPlacement } from "@monorepo/core-rectangle-placement";
import type { IMaterialFactory } from "@monorepo/core-threejs-app-framework/src/Materials/IMaterialFactory.js";
import type { IThreeScene } from "../../IThreeScene.js";
import { PlaygroundSceneBase } from "../../common/PlaygroundSceneBase.ts";
import { ControlledBoxGridLayout } from "../ControlledBoxGrid/ControlledBoxGridLayout.js";
import type { IRegionalPlacementCandidate } from "../Placement/Placement.Platground.Scene.ts";
import { WindowRegionPlacementValidator } from "../Placement/spesifications/WindowRegionPlacementValidator.ts";
import { SkyScraperWithPlacementFactory } from "./SkyScraperWithPlacementFactory.js";

export class BuildingPreviewWithPlacementPlaygroundScene extends PlaygroundSceneBase {
  protected override createDefaultGround(): void {
    // Match and slightly exceed the 120x120 planning footprint.
    super.createDefaultGround(132, 1, 132);
  }

  public constructor(
    scene: IThreeScene,
    materialFactory: IMaterialFactory,
    viewId = "building-preview-with-placement",
  ) {
    super(scene, "building-preview-with-placement-root", materialFactory, viewId);
  }

  protected override createContent(): void {
    const planning = this.createGroundPlanning();
    this.addToRoot(planning.group);

    for (let index = 0; index < planning.acceptedCenters.length; index += 1) {
      const center = planning.acceptedCenters[index];
      const skyscraper = new SkyScraperWithPlacementFactory(
        this.materialFactory,
        index + 1,
      ).create();
      skyscraper.position.set(center.x, 0, center.z);
      this.addToRoot(skyscraper);
    }

    this.addToRoot(new THREE.AxesHelper(8));
  }

  private createGroundPlanning(): { group: THREE.Group; acceptedCenters: readonly { x: number; z: number }[] } {
    const group = new THREE.Group();
    group.name = "skyscraper-ground-planning";

    const gridWidth = 160;
    const gridDepth = 120;
    const columns = 10;
    const rows = 10;
    const layout = new ControlledBoxGridLayout();
    const placements = layout.createPlacements({
      playgroundWidth: gridWidth,
      playgroundDepth: gridDepth,
      columns,
      rows,
      boxHeight: 0.04,
      boxInsetRatio: 0.08,
      baseTopY: 0.02,
    });

    const boxModule = new BoxCompositionRoot();
    const host = boxModule.createAabb2(
      new Vector2Gpu(-(gridWidth * 0.5), -(gridDepth * 0.5)),
      new Vector2Gpu(gridWidth * 0.5, gridDepth * 0.5),
    );
    const validator = new WindowRegionPlacementValidator(
      host,
      placements.map((value) => value.zone),
      0.01,
      boxModule,
    );

    const occupied: IOccupiedPlacement[] = [];
    const accepted = placements.filter((placement) => {
      const candidate: IRegionalPlacementCandidate = {
        regionId: placement.zone.id.value,
        candidate: placement.candidate,
      };
      const result = validator.validate(candidate, occupied);
      if (!result.isValid || result.acceptedPlan === null) {
        return false;
      }
      occupied.push({ candidate: placement.candidate });
      return true;
    });

    for (const placement of accepted) {
      group.add(this.createBoundsGuide(placement.candidate.bounds, 0x6b7280, 0.03));
    }

    const acceptedCenters = accepted.map((value) => {
      const center = value.candidate.bounds.center();
      return { x: center.x, z: center.y };
    });

    return {
      group,
      acceptedCenters,
    };
  }

  private createBoundsGuide(
    bounds: { center(): { x: number; y: number }; width(): number; height(): number },
    color: number,
    yOffset: number,
  ): THREE.LineSegments {
    const center = bounds.center();
    const geometry = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(bounds.width(), 0.02, bounds.height()),
    );
    const material = new THREE.LineBasicMaterial({ color });
    const guide = new THREE.LineSegments(geometry, material);
    guide.position.set(center.x, yOffset, center.y);
    return guide;
  }
}
