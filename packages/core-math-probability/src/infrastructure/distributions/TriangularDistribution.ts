import { IContinuousProbabilityDistribution, DistributionKind, IRandomSource } from "../../domain/value-objects/Probability.js";
import { NumericGuard } from "../numerics/NumericGuard.js";

export class TriangularDistribution implements IContinuousProbabilityDistribution {
    public readonly kind = DistributionKind.Triangular;

    public constructor(
        private readonly minimum: number,
        private readonly mode: number,
        private readonly maximum: number
    ) {
        if (!(minimum <= mode && mode <= maximum)) {
            throw new RangeError("Triangular distribution requires minimum <= mode <= maximum.");
        }

        if (minimum === maximum) {
            throw new RangeError("Triangular distribution requires minimum < maximum.");
        }
    }

    public pdf(x: number): number {
        if (x < this.minimum || x > this.maximum) return 0;

        if (x === this.mode) {
            return 2 / (this.maximum - this.minimum);
        }

        if (x <= this.mode) {
            const denominator = (this.maximum - this.minimum) * (this.mode - this.minimum);
            if (denominator === 0) return 0;
            return (2 * (x - this.minimum)) / denominator;
        }

        const denominator = (this.maximum - this.minimum) * (this.maximum - this.mode);
        if (denominator === 0) return 0;
        return (2 * (this.maximum - x)) / denominator;
    }

    public cdf(x: number): number {
        if (x <= this.minimum) return 0;
        if (x >= this.maximum) return 1;

        if (x <= this.mode) {
            const denominator = (this.maximum - this.minimum) * (this.mode - this.minimum);
            if (denominator === 0) return 0;
            return ((x - this.minimum) * (x - this.minimum)) / denominator;
        }

        const denominator = (this.maximum - this.minimum) * (this.maximum - this.mode);
        if (denominator === 0) return 1;
        return 1 - ((this.maximum - x) * (this.maximum - x)) / denominator;
    }

    public inverseCdf(probability: number): number {
        NumericGuard.probability(probability, "probability");

        if (probability === 0) return this.minimum;
        if (probability === 1) return this.maximum;

        const c = (this.mode - this.minimum) / (this.maximum - this.minimum);

        if (probability < c) {
            return this.minimum + Math.sqrt(probability * (this.maximum - this.minimum) * (this.mode - this.minimum));
        }

        return this.maximum - Math.sqrt((1 - probability) * (this.maximum - this.minimum) * (this.maximum - this.mode));
    }

    public sample(random: IRandomSource): number {
        return this.inverseCdf(random.next());
    }
}
