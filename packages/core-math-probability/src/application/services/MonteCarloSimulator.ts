import { IMonteCarloSimulator, IProbabilityDistribution, IRandomSource, Sample } from "../../domain/value-objects/Probability.js";

export class MonteCarloSimulator implements IMonteCarloSimulator {
    public simulate(
        distribution: IProbabilityDistribution,
        random: IRandomSource,
        iterations: number
    ): Sample {
        if (!Number.isInteger(iterations) || iterations <= 0) {
            throw new RangeError("iterations must be a positive integer.");
        }

        const values: number[] = [];

        for (let index = 0; index < iterations; index += 1) {
            values.push(distribution.sample(random));
        }

        return new Sample(values);
    }
}
