// =====================================================================================
// PACKAGE: @monorepo/core-math-probability-estimation
// SINGLE SNIPPET — COMPLETE VERTICAL SLICE
// - abstractions
// - deterministic random
// - continuous distributions
// - triangular / beta-pert / skew-normal estimate distributions
// - statistics / percentile / report builder
// - monte carlo project estimator
// - fixtures + vitest tests
//
// NOTE:
// - PDF/CDF/InverseCDF are fully implemented for Normal distribution.
// - Triangular has PDF/CDF/InverseCDF.
// - Beta-PERT and SkewNormal are implemented for sampling + metadata;
//   PDF/CDF/InverseCDF delegate only where mathematically justified in this compact slice.
//   Reporting is intentionally distribution-agnostic and driven by samples.
// =====================================================================================
// =====================================================================================
// DOMAIN — VALUE OBJECTS
// =====================================================================================

export class Probability {
    private constructor(public readonly value: number) { }

    public static create(value: number): Probability {
        if (!Number.isFinite(value) || value < 0 || value > 1) {
            throw new RangeError("Probability must be in range [0,1].");
        }

        return new Probability(value);
    }
}

export class EstimateRange {
    public constructor(
        public readonly minimum: number,
        public readonly mostLikely: number,
        public readonly maximum: number
    ) {
        if (!Number.isFinite(minimum) || !Number.isFinite(mostLikely) || !Number.isFinite(maximum)) {
            throw new RangeError("EstimateRange values must be finite.");
        }

        if (!(minimum <= mostLikely && mostLikely <= maximum)) {
            throw new RangeError("EstimateRange must satisfy minimum <= mostLikely <= maximum.");
        }

        if (minimum === maximum) {
            throw new RangeError("EstimateRange must have a non-zero span.");
        }
    }

    public get span(): number {
        return this.maximum - this.minimum;
    }
}

export class EstimateShape {
    public constructor(
        public readonly confidence: number, // [0,1]
        public readonly optimismBias: number, // [-1,1] positive => right tail
        public readonly tailWeight: number
    ) {
        if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
            throw new RangeError("confidence must be in [0,1].");
        }

        if (!Number.isFinite(optimismBias) || optimismBias < -1 || optimismBias > 1) {
            throw new RangeError("optimismBias must be in [-1,1].");
        }

        if (!Number.isFinite(tailWeight) || tailWeight <= 0) {
            throw new RangeError("tailWeight must be > 0.");
        }
    }
}

export class Sample {
    public constructor(public readonly values: readonly number[]) {
        if (values.length === 0) {
            throw new RangeError("Sample cannot be empty.");
        }

        for (const value of values) {
            if (!Number.isFinite(value)) {
                throw new RangeError("Sample contains a non-finite value.");
            }
        }
    }
}
// =====================================================================================
// DOMAIN — ENUMS / CONTRACTS
// =====================================================================================

export enum DistributionKind {
    Triangular = "Triangular",
    Pert = "Pert",
    SkewNormal = "SkewNormal"
}

export enum TailKind {
    Left = "Left",
    Right = "Right",
    TwoSided = "TwoSided"
}

export interface IRandomSource {
    next(): number; // [0,1)
}

export interface IProbabilityDistribution {
    readonly kind: DistributionKind;
    sample(random: IRandomSource): number;
}

export interface IContinuousProbabilityDistribution extends IProbabilityDistribution {
    pdf(x: number): number;
    cdf(x: number): number;
    inverseCdf(probability: number): number;
}

export interface IEstimateDistributionContext {
    readonly range: EstimateRange;
    readonly shape: EstimateShape;
    readonly kind: DistributionKind;
}

export interface IEstimateDistributionPolicy {
    supports(kind: DistributionKind): boolean;
    create(context: IEstimateDistributionContext): IContinuousProbabilityDistribution;
}

export interface IEstimateDistributionFactory {
    create(context: IEstimateDistributionContext): IContinuousProbabilityDistribution;
}

export interface IStatisticsService {
    mean(sample: Sample): number;
    variancePopulation(sample: Sample): number;
    varianceSample(sample: Sample): number;
    standardDeviationPopulation(sample: Sample): number;
    standardDeviationSample(sample: Sample): number;
    minimum(sample: Sample): number;
    maximum(sample: Sample): number;
}

export interface IPercentileService {
    percentile(sample: Sample, probability: Probability): number;
}

export interface IMonteCarloSimulator {
    simulate(
        distribution: IProbabilityDistribution,
        random: IRandomSource,
        iterations: number
    ): Sample;
}

export interface ITaskEstimate {
    readonly id: string;
    readonly name: string;
    readonly range: EstimateRange;
    readonly shape: EstimateShape;
    readonly distributionKind: DistributionKind;
}

export interface IUserStoryEstimate {
    readonly id: string;
    readonly name: string;
    readonly tasks: readonly ITaskEstimate[];
}

export interface IFeatureEstimate {
    readonly id: string;
    readonly name: string;
    readonly stories: readonly IUserStoryEstimate[];
}

export interface IProjectEstimate {
    readonly id: string;
    readonly name: string;
    readonly features: readonly IFeatureEstimate[];
}

export interface IZTestResult {
    readonly statistic: number;
    readonly pValue: number;
    readonly alpha: number;
    readonly rejectNull: boolean;
    readonly criticalValue: number;
}

export interface ITTestResult {
    readonly statistic: number;
    readonly pValue: number;
    readonly alpha: number;
    readonly rejectNull: boolean;
    readonly degreesOfFreedom: number;
}

export interface IOneSampleTTest {
    test(
        sampleMean: number,
        hypothesizedMean: number,
        sampleStandardDeviation: number,
        sampleSize: number,
        alpha: Probability,
        tail: TailKind
    ): ITTestResult;
}
// =====================================================================================
// INFRA — DETERMINISTIC RANDOM
// =====================================================================================

export class Mulberry32RandomSource implements IRandomSource {
    private state: number;

    public constructor(seed: number) {
        if (!Number.isInteger(seed)) {
            throw new RangeError("seed must be an integer.");
        }

        this.state = seed >>> 0;
    }

    public next(): number {
        this.state = (this.state + 0x6d2b79f5) >>> 0;

        let t = this.state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}
