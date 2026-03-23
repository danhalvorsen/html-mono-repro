import { IEstimateDistributionFactory, IEstimateDistributionPolicy, IEstimateDistributionContext, IContinuousProbabilityDistribution } from "../../domain/value-objects/Probability.js";

export class EstimateDistributionFactory implements IEstimateDistributionFactory {
    public constructor(
        private readonly policies: readonly IEstimateDistributionPolicy[]
    ) { }

    public create(context: IEstimateDistributionContext): IContinuousProbabilityDistribution {
        const policy = this.policies.find((candidate) => candidate.supports(context.kind));

        if (!policy) {
            throw new Error(`Unsupported distribution kind: ${context.kind}`);
        }

        return policy.create(context);
    }
}
