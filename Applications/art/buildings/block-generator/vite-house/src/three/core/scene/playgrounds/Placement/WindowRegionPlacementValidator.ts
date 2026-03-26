import type { IBox2 } from "@monorepo/core-math-rectangle";
import { type IPlacementZone, type IOccupiedPlacement, type IPlacementResult, type IPlacementContext, type IPlacementCandidate, type IPlaceholder, PlaceholderState } from "@monorepo/core-rectangle-placement";
import type { Box2SpatialRules, IRegionalPlacementCandidate } from "./Placement.Platground.Scene";

export class WindowRegionPlacementValidator {
  private readonly regionsById: ReadonlyMap<string, IPlacementZone>;

  public constructor(
    private readonly hostBounds: IBox2,
    regions: readonly IPlacementZone[],
    private readonly minimumSpacing: number,
    private readonly spatialRules: Box2SpatialRules
  ) {
    const regionsById = new Map<string, IPlacementZone>();

    for (const region of regions) {
      regionsById.set(region.id.value, region);
    }

    this.regionsById = regionsById;
  }

  public validate(
    regionalCandidate: IRegionalPlacementCandidate,
    occupied: readonly IOccupiedPlacement[]
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
    const candidateBounds = regionalCandidate.candidate.bounds;
    const isInsideHost = this.spatialRules.isContained(candidateBounds, context.host);
    const isInsideRegion = this.spatialRules.isContained(candidateBounds, region.bounds);
    const isAllowedInRegion = region.allowedKinds.some(
      (kind) => kind.value === regionalCandidate.candidate.kind.value
    );
    const hasRequiredSpacing = context.occupied.every((existing) => this.spatialRules.hasRequiredSpacingBetween(
      candidateBounds,
      existing.candidate.bounds,
      this.minimumSpacing
    )
    );

    if (!isInsideHost || !isInsideRegion || !isAllowedInRegion || !hasRequiredSpacing) {
      return {
        isValid: false,
        acceptedPlan: null,
      };
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

  private createAcceptedPlaceholder(
    candidate: IPlacementCandidate,
    region: IPlacementZone
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
