import { type IBox2, type IBoxModule } from "@monorepo/core-math-rectangle";
import {
  PlaceholderState,
  type IOccupiedPlacement,
  type IPlacementCandidate,
  type IPlacementContext,
  type IPlacementResult,
  type IPlacementZone,
  type IPlaceholder,
} from "@monorepo/core-rectangle-placement";
import type { IRegionalPlacementCandidate } from "../Placement.Platground.Scene.js";
import { ContainedInZonePlacementSpecification } from "./ContainedInZonePlacementSpecification.js";
import { SpacingToOccupiedPlacementSpecification } from "./SpacingToOccupiedPlacementSpecification.js";
import { InsideHostPlacementSpecification } from "./InsideHostPlacementSpecification.js";
import { AllowedKindsPlacementSpecification } from "./AllowedKindsPlacementSpecification.js";

export class WindowRegionPlacementValidator {
  private readonly regionsById: ReadonlyMap<string, IPlacementZone>;
  private readonly insideHostSpecification: InsideHostPlacementSpecification;
  private readonly spacingSpecification: SpacingToOccupiedPlacementSpecification;

  public constructor(
    private readonly hostBounds: IBox2,
    regions: readonly IPlacementZone[],
    minimumSpacing: number,
    boxModule: IBoxModule,
  ) {
    const regionsById = new Map<string, IPlacementZone>();

    for (const region of regions) {
      regionsById.set(region.id.value, region);
    }

    this.regionsById = regionsById;
    this.insideHostSpecification = new InsideHostPlacementSpecification();
    this.spacingSpecification = new SpacingToOccupiedPlacementSpecification(
      boxModule,
      minimumSpacing,
    );
  }

  public validate(
    regionalCandidate: IRegionalPlacementCandidate,
    occupied: readonly IOccupiedPlacement[],
  ): IPlacementResult {
    const region = this.regionsById.get(regionalCandidate.regionId);

    if (region === undefined) {
      return {
        isValid: false,
        acceptedPlan: null,
      };
    }

    const context: IPlacementContext = {
      host: this.hostBounds,
      candidate: regionalCandidate.candidate,
      occupied,
    };
    const allowedKindsSpecification = new AllowedKindsPlacementSpecification(
      region.allowedKinds,
    );
    const containedInZoneSpecification = new ContainedInZonePlacementSpecification(
      region,
    );

    if (!allowedKindsSpecification.isSatisfiedBy(context)) {
      return this.createRejectedResult();
    }

    if (!this.insideHostSpecification.isSatisfiedBy(context)) {
      return this.createRejectedResult();
    }

    if (!containedInZoneSpecification.isSatisfiedBy(context)) {
      return this.createRejectedResult();
    }

    if (!this.spacingSpecification.isSatisfiedBy(context)) {
      return this.createRejectedResult();
    }

    return {
      isValid: true,
      acceptedPlan: {
        reservation: {
          placeholder: this.createAcceptedPlaceholder(regionalCandidate.candidate, region),
          candidate: regionalCandidate.candidate,
        },
      },
    };
  }

  private createRejectedResult(): IPlacementResult {
    return {
      isValid: false,
      acceptedPlan: null,
    };
  }

  private createAcceptedPlaceholder(
    candidate: IPlacementCandidate,
    region: IPlacementZone,
  ): IPlaceholder {
    const center = candidate.bounds.center();

    return {
      id: {
        value: `${region.id.value}-${center.x.toFixed(2)}-${center.y.toFixed(2)}`,
      },
      state: PlaceholderState.Occupied,
      zone: region,
      bounds: candidate.bounds,
      allowedKinds: region.allowedKinds,
      visualParts: [
        { name: "candidate", bounds: candidate.bounds },
        { name: "region", bounds: region.bounds },
      ],
    };
  }
}
