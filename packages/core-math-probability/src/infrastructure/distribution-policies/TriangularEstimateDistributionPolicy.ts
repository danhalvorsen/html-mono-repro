
// =====================================================================================
// INFRA — DISTRIBUTION POLICIES / FACTORY
// =====================================================================================

import { DistributionKind, IContinuousProbabilityDistribution, IEstimateDistributionContext, IEstimateDistributionPolicy } from "../../domain/value-objects/Probability.js";
import { TriangularDistribution } from "../distributions/TriangularDistribution.js";

export class TriangularEstimateDistributionPolicy implements IEstimateDistributionPolicy {
    public supports(kind: DistributionKind): boolean {
        return kind === DistributionKind.Triangular;
    }

    public create(context: IEstimateDistributionContext): IContinuousProbabilityDistribution {
        return new TriangularDistribution(
            context.range.minimum,
            context.range.mostLikely,
            context.range.maximum
        );
    }
}
