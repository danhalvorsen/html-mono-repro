import type { IBox2, IBoxModule } from "@monorepo/core-math-rectangle";
import type { IPlacementZone, IOccupiedPlacement } from "@monorepo/core-rectangle-placement";
import { Window, WindowBuilder } from "../../../../Builders/IWindowBuilder.ts";
import type { IMaterialFactory } from "@monorepo/core-threejs-app-framework/src/Materials/IMaterialFactory.js";
import { MaterialToken } from "@monorepo/core-threejs-app-framework/src/Materials/MaterialToken.js";
import { type IPlacementSceneDrawingStrategy, type IWallPlacementInitialization, REGION_GUIDE_COLOR, type IRegionalPlacementCandidate, REJECTED_GUIDE_COLOR, WINDOW_Z_OFFSET, WALL_WIDTH, WALL_HEIGHT, WALL_DEPTH } from "../Placement.Platground.Scene.ts";
import { WindowRegionPlacementValidator } from "../spesifications/WindowRegionPlacementValidator.ts";
 
import * as THREE from "three";
export class PlacementPlaygroundDrawingStrategy
  implements IPlacementSceneDrawingStrategy {
  public constructor(
    private readonly materialFactory: IMaterialFactory,
    private readonly boxModule: IBoxModule,
  ) { }

  public draw(initialization: IWallPlacementInitialization): THREE.Object3D {
    const group = new THREE.Group();
    const { positionX, positionZ, rotationYRadians, hostBounds, scenario } = initialization;

    group.position.set(positionX, 0, positionZ);
    group.rotation.y = rotationYRadians;
    group.add(this.createWallMesh());

    for (const region of scenario.regions) {
      group.add(this.createBoundsGuide(region.bounds, REGION_GUIDE_COLOR, 0.2));
    }

    this.drawValidatedWindows(
      group,
      scenario.candidates,
      hostBounds,
      scenario.regions
    );

    return group;
  }

  private drawValidatedWindows(
    root: THREE.Object3D,
    candidates: readonly IRegionalPlacementCandidate[],
    hostBounds: IBox2,
    regions: readonly IPlacementZone[]
  ): void {
    const validator = new WindowRegionPlacementValidator(
      hostBounds,
      regions,
      0.15,
      this.boxModule,
    );
    const occupied: IOccupiedPlacement[] = [];

    for (const regionalCandidate of candidates) {
      const result = validator.validate(regionalCandidate, occupied);

      if (!result.isValid || result.acceptedPlan === null) {
        root.add(
          this.createBoundsGuide(
            regionalCandidate.candidate.bounds,
            REJECTED_GUIDE_COLOR,
            0.22
          )
        );
        continue;
      }

      const acceptedCandidate = result.acceptedPlan.reservation.candidate;
      const center = acceptedCandidate.bounds.center();
      const window = this.createWindow(
        acceptedCandidate.bounds.width(),
        acceptedCandidate.bounds.height()
      );

      window.position.set(center.x, center.y, WINDOW_Z_OFFSET);
      root.add(window);

      occupied.push({ candidate: acceptedCandidate });
    }
  }

  private createWallMesh(): THREE.Mesh {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(WALL_WIDTH, WALL_HEIGHT, WALL_DEPTH),
      this.materialFactory.create(MaterialToken.BuildingWhite)
    );

    wall.position.set(0, WALL_HEIGHT * 0.5, 0);
    wall.castShadow = true;
    wall.receiveShadow = true;

    return wall;
  }

  private createWindow(width: number, height: number): THREE.Object3D {
    return new WindowBuilder(this.materialFactory).build(
      new Window(
        { rect: { x: 0, y: 0, width, height }, material: MaterialToken.BuildingBlue },
        { material: MaterialToken.WindowGlassDark, inset: 0.08 },
      ),
    );
  }

  private createBoundsGuide(
    bounds: IBox2,
    color: number,
    zOffset: number
  ): THREE.LineSegments {
    const center = bounds.center();
    const geometry = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(bounds.width(), bounds.height(), 0.02)
    );
    const material = new THREE.LineBasicMaterial({ color });
    const guide = new THREE.LineSegments(geometry, material);

    guide.position.set(center.x, center.y, zOffset);

    return guide;
  }
}
