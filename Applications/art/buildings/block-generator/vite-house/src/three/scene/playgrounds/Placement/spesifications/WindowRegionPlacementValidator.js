import { PlaceholderState, } from "@monorepo/core-rectangle-placement";
import { ContainedInZonePlacementSpecification } from "./ContainedInZonePlacementSpecification.js";
import { SpacingToOccupiedPlacementSpecification } from "./SpacingToOccupiedPlacementSpecification.js";
import { InsideHostPlacementSpecification } from "./InsideHostPlacementSpecification.js";
import { AllowedKindsPlacementSpecification } from "./AllowedKindsPlacementSpecification.js";
export class WindowRegionPlacementValidator {
    hostBounds;
    regionsById;
    insideHostSpecification;
    spacingSpecification;
    constructor(hostBounds, regions, minimumSpacing, boxModule) {
        this.hostBounds = hostBounds;
        const regionsById = new Map();
        for (const region of regions) {
            regionsById.set(region.id.value, region);
        }
        this.regionsById = regionsById;
        this.insideHostSpecification = new InsideHostPlacementSpecification();
        this.spacingSpecification = new SpacingToOccupiedPlacementSpecification(boxModule, minimumSpacing);
    }
    validate(regionalCandidate, occupied) {
        const region = this.regionsById.get(regionalCandidate.regionId);
        if (region === undefined) {
            return {
                isValid: false,
                acceptedPlan: null,
            };
        }
        const context = {
            host: this.hostBounds,
            candidate: regionalCandidate.candidate,
            occupied,
        };
        const allowedKindsSpecification = new AllowedKindsPlacementSpecification(region.allowedKinds);
        const containedInZoneSpecification = new ContainedInZonePlacementSpecification(region);
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
    createRejectedResult() {
        return {
            isValid: false,
            acceptedPlan: null,
        };
    }
    createAcceptedPlaceholder(candidate, region) {
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
//# sourceMappingURL=WindowRegionPlacementValidator.js.map