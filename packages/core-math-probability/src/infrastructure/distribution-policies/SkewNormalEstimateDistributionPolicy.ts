import { IEstimateDistributionPolicy, DistributionKind, IEstimateDistributionContext, IContinuousProbabilityDistribution } from "../../domain/value-objects/Probability.js";
import { SkewNormalEstimateDistribution } from "../distributions/SkewNormalEstimateDistribution.js";

export class SkewNormalEstimateDistributionPolicy implements IEstimateDistributionPolicy {
    public supports(kind: DistributionKind): boolean {
        return kind === DistributionKind.SkewNormal;
    }

    public create(context: IEstimateDistributionContext): IContinuousProbabilityDistribution {
        return new SkewNormalEstimateDistribution(context.range, context.shape);
    }
}
