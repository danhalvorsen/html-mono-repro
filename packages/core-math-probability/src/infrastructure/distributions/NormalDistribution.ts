 
import { IContinuousProbabilityDistribution, DistributionKind, IRandomSource } from "../../domain/value-objects/Probability.js";
import { ErrorFunction } from "../numerics/ErrorFunction.js";
import { InverseNormalApproximation } from "../numerics/InverseNormalApproximation.js";
import { NumericGuard } from "../numerics/NumericGuard.js";
import { CachedStandardNormalSource } from "../random/CachedStandardNormalSource.js";
 
// =====================================================================================
// INFRA — DISTRIBUTIONS
// =====================================================================================

export class NormalDistribution implements IContinuousProbabilityDistribution {
    public readonly kind = DistributionKind.SkewNormal; // internal metadata not used by estimator

    public constructor(
        private readonly mean: number = 0,
        private readonly standardDeviation: number = 1
    ) {
        NumericGuard.finite(mean, "mean");
        NumericGuard.positive(standardDeviation, "standardDeviation");
    }

    public pdf(x: number): number {
        const z = (x - this.mean) / this.standardDeviation;
        const coefficient = 1 / (this.standardDeviation * Math.sqrt(2 * Math.PI));
        return coefficient * Math.exp(-0.5 * z * z);
    }

    public cdf(x: number): number {
        const z = (x - this.mean) / (this.standardDeviation * Math.SQRT2);
        return 0.5 * (1 + ErrorFunction.erf(z));
    }

    public inverseCdf(probability: number): number {
        NumericGuard.openProbability(probability, "probability");
        return this.mean + this.standardDeviation * InverseNormalApproximation.inverseCdf(probability);
    }

    public sample(random: IRandomSource): number {
        const z = new CachedStandardNormalSource(random).next();
        return this.mean + this.standardDeviation * z;
    }
}
