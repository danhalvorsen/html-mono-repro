import * as THREE from "three";
import { BoxCompositionRoot } from "@monorepo/core-math-rectangle";
import type { IOccupiedPlacement } from "@monorepo/core-rectangle-placement";
import type { IMaterialFactory } from "@monorepo/core-threejs-app-framework/src/Materials/IMaterialFactory.js";
import { MaterialToken } from "@monorepo/core-threejs-app-framework/src/Materials/MaterialToken.js";
import type { IThreeScene } from "../../IThreeScene.js";
import { PlaygroundSceneBase } from "../../common/PlaygroundSceneBase.ts";
import type { IRegionalPlacementCandidate } from "../Placement/Placement.Platground.Scene.ts";
import { WindowRegionPlacementValidator } from "../Placement/spesifications/WindowRegionPlacementValidator.ts";
import {
  ControlledBoxGridLayout,
  type IControlledBoxGridLayout,
  type IControlledBoxPlacement,
} from "./ControlledBoxGridLayout.js";

const PlaygroundSize = Object.freeze({
  Width: 8,
  Depth: 4,
  BaseHeight: 0.2,
  BoxHeight: 0.6,
  Columns: 10,
  Rows: 10,
  BoxInsetRatio: 0.18,
});
const ZONE_GUIDE_COLOR = 0x2f9e44;
const CANDIDATE_GUIDE_COLOR = 0x1971c2;

export class ControlledBoxGridPlaygroundScene extends PlaygroundSceneBase {
  private readonly layout: IControlledBoxGridLayout | undefined;

  public constructor(
    scene: IThreeScene,
    materialFactory: IMaterialFactory,
    layout?: IControlledBoxGridLayout,
    viewId = "controlled-box-grid",
  ) {
    super(scene, "controlled-box-grid-playground-root", materialFactory, viewId);
    this.layout = layout;
  }

  protected override createContent(): void {
    const playground = new THREE.Group();
    playground.name = "controlled-box-grid-playground";

    playground.add(this.createPlaygroundBase());

    for (const placement of this.createValidatedPlacements(this.createPlacements())) {
      playground.add(this.createPlacementBox(placement));
      playground.add(this.createBoundsGuide(placement.zone.bounds, ZONE_GUIDE_COLOR, PlaygroundSize.BaseHeight + 0.03));
      playground.add(this.createBoundsGuide(placement.candidate.bounds, CANDIDATE_GUIDE_COLOR, PlaygroundSize.BaseHeight + 0.06));
    }

    this.addToRoot(playground, new THREE.AxesHelper(5));
  }

  private createPlacements(): readonly IControlledBoxPlacement[] {
    const layout = this.layout ?? new ControlledBoxGridLayout();

    return layout.createPlacements({
      playgroundWidth: PlaygroundSize.Width,
      playgroundDepth: PlaygroundSize.Depth,
      columns: PlaygroundSize.Columns,
      rows: PlaygroundSize.Rows,
      boxHeight: PlaygroundSize.BoxHeight,
      boxInsetRatio: PlaygroundSize.BoxInsetRatio,
      baseTopY: PlaygroundSize.BaseHeight,
    });
  }

  private createValidatedPlacements(
    placements: readonly IControlledBoxPlacement[],
  ): readonly IControlledBoxPlacement[] {
    const boxModule = new BoxCompositionRoot();
    const host = boxModule.createAabb2(
      new THREE.Vector2(-(PlaygroundSize.Width * 0.5), -(PlaygroundSize.Depth * 0.5)) as never,
      new THREE.Vector2(PlaygroundSize.Width * 0.5, PlaygroundSize.Depth * 0.5) as never,
    );
    const regions = placements.map((value) => value.zone);
    const validator = new WindowRegionPlacementValidator(host, regions, 0.01, boxModule);
    const occupied: IOccupiedPlacement[] = [];
    const accepted: IControlledBoxPlacement[] = [];
    const byId = new Map(placements.map((value) => [value.zone.id.value, value] as const));

    for (const placement of placements) {
      const regionalCandidate: IRegionalPlacementCandidate = {
        regionId: placement.zone.id.value,
        candidate: placement.candidate,
      };
      const result = validator.validate(regionalCandidate, occupied);
      if (!result.isValid || result.acceptedPlan === null) {
        continue;
      }

      const match = byId.get(regionalCandidate.regionId);
      if (match !== undefined) {
        accepted.push(match);
      }
      occupied.push({ candidate: placement.candidate });
    }

    return accepted;
  }

  private createPlaygroundBase(): THREE.Mesh {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        PlaygroundSize.Width,
        PlaygroundSize.BaseHeight,
        PlaygroundSize.Depth,
      ),
      this.materialFactory.create(MaterialToken.BuildingWhite),
    );

    mesh.name = "playground-base-2x1";
    mesh.position.set(0, PlaygroundSize.BaseHeight * 0.5, 0);
    mesh.receiveShadow = true;

    return mesh;
  }

  private createPlacementBox(placement: IControlledBoxPlacement): THREE.Mesh {
    const center = placement.candidate.bounds.center();
    const width = placement.candidate.bounds.width();
    const depth = placement.candidate.bounds.height();
    const material = this.materialFactory.create(MaterialToken.BuildingBlue);
    material.transparent = true;
    material.opacity = 0.45;

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        placement.boxHeight,
        depth,
      ),
      material,
    );

    mesh.name = placement.name;
    mesh.position.set(
      center.x,
      PlaygroundSize.BaseHeight + (placement.boxHeight * 0.5),
      center.y,
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  private createBoundsGuide(
    bounds: IControlledBoxPlacement["candidate"]["bounds"],
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
