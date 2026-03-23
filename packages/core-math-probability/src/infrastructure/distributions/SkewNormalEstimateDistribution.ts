import { IContinuousProbabilityDistribution, DistributionKind, EstimateRange, EstimateShape, IRandomSource } from "../../domain/value-objects/Probability.js";
import { NumericGuard } from "../numerics/NumericGuard.js";
import { CachedStandardNormalSource } from "../random/CachedStandardNormalSource.js";
import { NormalDistribution } from "./NormalDistribution.js";

export class SkewNormalEstimateDistribution implements IContinuousProbabilityDistribution {
    public readonly kind = DistributionKind.SkewNormal;
    private readonly normal = new NormalDistribution(0, 1);
    private readonly delta: number;
    private readonly mu: number;
    private readonly sigma: number;

    public constructor(
        private readonly range: EstimateRange,
        private readonly shape: EstimateShape
    ) {
        const center = (range.minimum + 4 * range.mostLikely + range.maximum) / 6;
        const baseSigma = Math.max(range.span / (2.5 + 3.5 * shape.confidence), Number.EPSILON);

        this.mu = center;
        this.sigma = baseSigma * (1 / Math.max(shape.tailWeight, 0.1));
        this.delta = shape.optimismBias * 0.9;
    }

    public pdf(x: number): number {
        // A compact approximation for reporting support.
        const z = (x - this.mu) / this.sigma;
        const phi = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z);
        const Phi = this.normal.cdf(this.delta * z * Math.sqrt(2));
        return (2 / this.sigma) * phi * Phi;
    }

    public cdf(x: number): number {
        // Numeric approximation by integrating pdf on a bounded interval.
        const low = this.range.minimum - 4 * this.range.span;
        const high = Math.min(x, this.range.maximum + 4 * this.range.span);

        if (x <= low) return 0;
        if (x >= this.range.maximum + 4 * this.range.span) return 1;

        const steps = 400;
        const step = (high - low) / steps;
        let area = 0;
        let current = low;

        for (let index = 0; index < steps; index += 1) {
            const next = current + step;
            area += 0.5 * (this.pdf(current) + this.pdf(next)) * step;
            current = next;
        }

        return Math.max(0, Math.min(1, area));
    }

    public inverseCdf(probability: number): number {
        NumericGuard.probability(probability, "probability");

        if (probability === 0) return this.range.minimum - 4 * this.range.span;
        if (probability === 1) return this.range.maximum + 4 * this.range.span;

        let low = this.range.minimum - 4 * this.range.span;
        let high = this.range.maximum + 4 * this.range.span;

        for (let index = 0; index < 100; index += 1) {
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
        const normalSource = new CachedStandardNormalSource(random);
        const u0 = normalSource.next();
        const v = normalSource.next();

        const skewedStandard = this.delta * Math.abs(u0) + Math.sqrt(1 - this.delta * this.delta) * v;
        return this.mu + this.sigma * skewedStandard;
    }
}
