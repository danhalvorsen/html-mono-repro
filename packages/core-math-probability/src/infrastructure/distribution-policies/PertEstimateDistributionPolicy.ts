 
import { DistributionKind, EstimateShape, IContinuousProbabilityDistribution, IEstimateDistributionContext, IEstimateDistributionPolicy } from "../../domain/value-objects/Probability.js";
import { BetaPertDistribution } from "../distributions/BetaPertDistribution.js";
 export class PertEstimateDistributionPolicy implements IEstimateDistributionPolicy {
    public supports(kind: DistributionKind): boolean {
        return kind === DistributionKind.Pert;
    }

    public create(context: IEstimateDistributionContext): IContinuousProbabilityDistribution {
        const lambda = this.resolveLambda(context.shape);
        return new BetaPertDistribution(
            context.range.minimum,
            context.range.mostLikely,
            context.range.maximum,
            lambda
        );
    }

    private resolveLambda(shape: EstimateShape): number {
        // higher confidence => tighter around mode; tailWeight can loosen it
        const confidenceFactor = 2 + shape.confidence * 6;
        const tailAdjustment = 1 / Math.max(shape.tailWeight, 0.25);
        return Math.max(1.1, confidenceFactor * tailAdjustment);
    }
}
