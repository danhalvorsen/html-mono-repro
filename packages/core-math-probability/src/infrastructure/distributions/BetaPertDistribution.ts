import { IContinuousProbabilityDistribution, DistributionKind, IRandomSource } from "../../domain/value-objects/Probability.js";
import { BetaFunctions } from "../numerics/BetaFunctions.js";
import { NumericGuard } from "../numerics/NumericGuard.js";

export class BetaPertDistribution implements IContinuousProbabilityDistribution {
    public readonly kind = DistributionKind.Pert;
    private readonly alpha: number;
    private readonly beta: number;
    private readonly span: number;

    public constructor(
        private readonly minimum: number,
        private readonly mode: number,
        private readonly maximum: number,
        lambda: number = 4
    ) {
        if (!(minimum <= mode && mode <= maximum)) {
            throw new RangeError("PERT distribution requires minimum <= mode <= maximum.");
        }

        if (minimum === maximum) {
            throw new RangeError("PERT distribution requires minimum < maximum.");
        }

        NumericGuard.positive(lambda, "lambda");

        this.span = maximum - minimum;
        const relativeMode = (mode - minimum) / this.span;

        this.alpha = 1 + lambda * relativeMode;
        this.beta = 1 + lambda * (1 - relativeMode);
    }

    public pdf(x: number): number {
        if (x <= this.minimum || x >= this.maximum) {
            return 0;
        }

        const y = (x - this.minimum) / this.span;
        const numerator = Math.pow(y, this.alpha - 1) * Math.pow(1 - y, this.beta - 1);
        const denominator = BetaFunctions.beta(this.alpha, this.beta) * this.span;

        return numerator / denominator;
    }

    public cdf(x: number): number {
        if (x <= this.minimum) return 0;
        if (x >= this.maximum) return 1;

        const y = (x - this.minimum) / this.span;
        return BetaFunctions.regularizedIncompleteBeta(y, this.alpha, this.beta);
    }

    public inverseCdf(probability: number): number {
        NumericGuard.probability(probability, "probability");

        if (probability === 0) return this.minimum;
        if (probability === 1) return this.maximum;

        // monotonic binary search
        let low = this.minimum;
        let high = this.maximum;

        for (let index = 0; index < 120; index += 1) {
            const mid = (low + high) / 2;
            const cdf = this.cdf(mid);

            if (cdf < probability) {
                low = mid;
            } else {
                high = mid;
            }
        }

        return (low + high) / 2;
    }

    public sample(random: IRandomSource): number {
        return this.inverseCdf(random.next());
    }
}
