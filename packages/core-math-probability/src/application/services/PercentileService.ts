import { IPercentileService, Probability, Sample } from "../../domain/value-objects/Probability.js";

export class PercentileService implements IPercentileService {
    public percentile(sample: Sample, probability: Probability): number {
        const sorted = [...sample.values].sort((left, right) => left - right);
        const p = probability.value;

        if (sorted.length === 0) {
            throw new Error("Sample cannot be empty");
        }

        if (sorted.length === 1) {
            return sorted[0]!;
        }

        const position = (sorted.length - 1) * p;
        const lowerIndex = Math.floor(position);
        const upperIndex = Math.ceil(position);

        if (lowerIndex === upperIndex) {
            return sorted[lowerIndex]!;
        }

        const weight = position - lowerIndex;
        return sorted[lowerIndex]! * (1 - weight) + sorted[upperIndex]! * weight;
    }
}
