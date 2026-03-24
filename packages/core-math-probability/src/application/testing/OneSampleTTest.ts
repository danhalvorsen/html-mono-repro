import { IOneSampleTTest, Probability, TailKind, ITTestResult } from "../../domain/value-objects/Probability.js";
import { StudentTDistribution } from "../../infrastructure/distributions/StudentTDistribution.js";
import { NumericGuard } from "../../infrastructure/numerics/NumericGuard.js";

export class OneSampleTTest implements IOneSampleTTest {
    public test(
        sampleMean: number,
        hypothesizedMean: number,
        sampleStandardDeviation: number,
        sampleSize: number,
        alpha: Probability,
        tail: TailKind
    ): ITTestResult {
        NumericGuard.finite(sampleMean, "sampleMean");
        NumericGuard.finite(hypothesizedMean, "hypothesizedMean");
        NumericGuard.positive(sampleStandardDeviation, "sampleStandardDeviation");

        if (!Number.isInteger(sampleSize) || sampleSize < 2) {
            throw new RangeError("sampleSize must be an integer >= 2.");
        }

        const statistic = (sampleMean - hypothesizedMean) /
            (sampleStandardDeviation / Math.sqrt(sampleSize));

        const distribution = new StudentTDistribution(sampleSize - 1);
        const pValue = this.resolvePValue(distribution, statistic, tail);

        return {
            statistic,
            pValue,
            alpha: alpha.value,
            rejectNull: pValue < alpha.value,
            degreesOfFreedom: sampleSize - 1,
        };
    }

    private resolvePValue(
        distribution: StudentTDistribution,
        statistic: number,
        tail: TailKind
    ): number {
        const cdf = distribution.cdf(statistic);

        switch (tail) {
            case TailKind.Left:
                return cdf;
            case TailKind.Right:
                return 1 - cdf;
            case TailKind.TwoSided:
                return 2 * Math.min(cdf, 1 - cdf);
        }
    }
}
