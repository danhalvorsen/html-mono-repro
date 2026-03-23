 
// =====================================================================================
// APPLICATION — SERVICES
// =====================================================================================

import { IStatisticsService, Sample } from "../../domain/value-objects/Probability.js";

export class StatisticsService implements IStatisticsService {
    public mean(sample: Sample): number {
        let sum = 0;
        for (const value of sample.values) {
            sum += value;
        }
        return sum / sample.values.length;
    }

    public variancePopulation(sample: Sample): number {
        const mean = this.mean(sample);
        let sum = 0;

        for (const value of sample.values) {
            const d = value - mean;
            sum += d * d;
        }

        return sum / sample.values.length;
    }

    public varianceSample(sample: Sample): number {
        if (sample.values.length < 2) {
            throw new RangeError("Sample variance requires at least 2 values.");
        }

        const mean = this.mean(sample);
        let sum = 0;

        for (const value of sample.values) {
            const d = value - mean;
            sum += d * d;
        }

        return sum / (sample.values.length - 1);
    }

    public standardDeviationPopulation(sample: Sample): number {
        return Math.sqrt(this.variancePopulation(sample));
    }

    public standardDeviationSample(sample: Sample): number {
        return Math.sqrt(this.varianceSample(sample));
    }

    public minimum(sample: Sample): number {
        return Math.min(...sample.values);
    }

    public maximum(sample: Sample): number {
        return Math.max(...sample.values);
    }
}
