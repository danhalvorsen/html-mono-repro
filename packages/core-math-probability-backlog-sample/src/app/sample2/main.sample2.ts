// src/app/sample2/main.sample2.ts

import {
  MonteCarloSimulator,
  EstimateReportBuilder,
  StatisticsService,
  PercentileService,
  Mulberry32RandomSource,
  EstimateRange,
  EstimateShape,
  NormalDistribution,
  TriangularDistribution,
  SkewNormalEstimateDistribution,
  type IContinuousProbabilityDistribution,
} from "@monorepo/core-math-probability";

type DistributionKindArgument = "normal" | "triangular" | "skew-normal";

interface IArguments {
  readonly kind: DistributionKindArgument;
  readonly iterations: number;
  readonly seed: number;
  readonly mean: number;
  readonly stddev: number;
  readonly min: number;
  readonly mode: number;
  readonly max: number;
  readonly confidence: number;
  readonly bias: number;
  readonly tail: number;
  readonly previewCount: number;
}

class ArgumentParser {
  public parse(argv: readonly string[]): IArguments {
    const map = this.toMap(argv);

    const kind = this.readEnum(
      map,
      "kind",
      ["normal", "triangular", "skew-normal"],
      "triangular",
    );

    return {
      kind,
      iterations: this.readPositiveInteger(map, "iterations", 50),
      seed: this.readInteger(map, "seed", 42),
      mean: this.readNumber(map, "mean", 50),
      stddev: this.readPositiveNumber(map, "stddev", 15),
      min: this.readNumber(map, "min", 0),
      mode: this.readNumber(map, "mode", 50),
      max: this.readNumber(map, "max", 100),
      confidence: this.readBoundedNumber(map, "confidence", 0.65, 0, 1),
      bias: this.readBoundedNumber(map, "bias", 0.25, -1, 1),
      tail: this.readPositiveNumber(map, "tail", 1.1),
      previewCount: this.readPositiveInteger(map, "preview", 50),
    };
  }

  private toMap(argv: readonly string[]): ReadonlyMap<string, string> {
    const result = new Map<string, string>();

    for (let index = 0; index < argv.length; index += 1) {
      const token = argv[index];
      if (token === undefined || !token.startsWith("--")) {
        continue;
      }

      const key = token.slice(2).toLowerCase();
      const value = argv[index + 1];

      if (value === undefined || value.startsWith("--")) {
        throw new RangeError(`Missing value for argument '--${key}'.`);
      }

      result.set(key, value);
      index += 1;
    }

    return result;
  }

  private readEnum<TValue extends string>(
    map: ReadonlyMap<string, string>,
    key: string,
    allowed: readonly TValue[],
    defaultValue: TValue,
  ): TValue {
    const value = map.get(key);
    if (value === undefined) {
      return defaultValue;
    }

    if (!allowed.includes(value as TValue)) {
      throw new RangeError(
        `Argument '--${key}' must be one of: ${allowed.join(", ")}.`,
      );
    }

    return value as TValue;
  }

  private readInteger(
    map: ReadonlyMap<string, string>,
    key: string,
    defaultValue: number,
  ): number {
    const value = map.get(key);
    if (value === undefined) {
      return defaultValue;
    }

    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed)) {
      throw new RangeError(`Argument '--${key}' must be an integer.`);
    }

    return parsed;
  }

  private readPositiveInteger(
    map: ReadonlyMap<string, string>,
    key: string,
    defaultValue: number,
  ): number {
    const value = this.readInteger(map, key, defaultValue);
    if (value <= 0) {
      throw new RangeError(`Argument '--${key}' must be > 0.`);
    }

    return value;
  }

  private readNumber(
    map: ReadonlyMap<string, string>,
    key: string,
    defaultValue: number,
  ): number {
    const value = map.get(key);
    if (value === undefined) {
      return defaultValue;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new RangeError(`Argument '--${key}' must be a finite number.`);
    }

    return parsed;
  }

  private readPositiveNumber(
    map: ReadonlyMap<string, string>,
    key: string,
    defaultValue: number,
  ): number {
    const value = this.readNumber(map, key, defaultValue);
    if (value <= 0) {
      throw new RangeError(`Argument '--${key}' must be > 0.`);
    }

    return value;
  }

  private readBoundedNumber(
    map: ReadonlyMap<string, string>,
    key: string,
    defaultValue: number,
    minimum: number,
    maximum: number,
  ): number {
    const value = this.readNumber(map, key, defaultValue);
    if (value < minimum || value > maximum) {
      throw new RangeError(`Argument '--${key}' must be in [${minimum}, ${maximum}].`);
    }

    return value;
  }
}

class DistributionFactory {
  public create(args: IArguments): IContinuousProbabilityDistribution {
    switch (args.kind) {
      case "normal":
        return new NormalDistribution(args.mean, args.stddev);

      case "triangular":
        return new TriangularDistribution(args.min, args.mode, args.max);

      case "skew-normal":
        return new SkewNormalEstimateDistribution(
          new EstimateRange(args.min, args.mode, args.max),
          new EstimateShape(args.confidence, args.bias, args.tail),
        );
    }
  }
}

class Sample2Application {
  private readonly parser = new ArgumentParser();
  private readonly distributionFactory = new DistributionFactory();
  private readonly simulator = new MonteCarloSimulator();
  private readonly reportBuilder = new EstimateReportBuilder(
    new StatisticsService(),
    new PercentileService(),
  );

  public run(argv: readonly string[]): void {
    const args = this.parser.parse(argv);
    this.validateArguments(args);

    const distribution = this.distributionFactory.create(args);
    const random = new Mulberry32RandomSource(args.seed);
    const sample = this.simulator.simulate(distribution, random, args.iterations);
    const report = this.reportBuilder.build(distribution, sample);

    this.printHeader(args, distribution.kind);
    this.printInputParameters(args);
    this.printSequence(sample.values, args.previewCount);
    this.printCsv(sample.values);
    this.printStatistics(report.statistics);
  }

  private validateArguments(args: IArguments): void {
    if (args.kind !== "normal" && !(args.min <= args.mode && args.mode <= args.max)) {
      throw new RangeError("Range arguments must satisfy min <= mode <= max.");
    }
  }

private printHeader(args: IArguments, kind: string): void {
  console.log("# Random data sample");
  console.log("");

  console.log("## Distribution");
  console.log(`Type: ${kind}`);

  if (kind === "triangular" || kind === "skew-normal") {
    console.log("");
    console.log("## Input parameters");
    console.log(`Minimum: ${args.min.toFixed(4)}`);
    console.log(`Mode: ${args.mode.toFixed(4)}`);
    console.log(`Maximum: ${args.max.toFixed(4)}`);
    console.log(`Configured range width: ${(args.max - args.min).toFixed(4)}`);

    const center = (args.min + args.max) / 2;
    const skew = args.mode - center;

    console.log("");
    console.log("## Shape interpretation");

    if (Math.abs(skew) < 1e-6) {
      console.log("- Symmetric distribution (mode centered)");
    } else if (skew < 0) {
      console.log("- Left-heavy (more low values)");
    } else {
      console.log("- Right-heavy (more high values)");
    }

    console.log("- Values constrained to range [min, max]");
    console.log("- Highest density near mode");
  }

  if (kind === "normal") {
    console.log("");
    console.log("## Input parameters");
    console.log(`Mean: ${args.mean.toFixed(4)}`);
    console.log(`StdDev: ${args.stddev.toFixed(4)}`);
    console.log("- Unbounded distribution");
  }

  console.log("");
  console.log(`Iterations: ${args.iterations}`);
  console.log(`Seed: ${args.seed}`);
  console.log("");
}

  private printInputParameters(args: IArguments): void {
    console.log("## Input parameters");

    switch (args.kind) {
      case "normal":
        console.log(`Mean: ${args.mean.toFixed(4)}`);
        console.log(`StdDev: ${args.stddev.toFixed(4)}`);
        console.log("Note: normal distribution is not bounded.");
        break;

      case "triangular":
        console.log(`Minimum: ${args.min.toFixed(4)}`);
        console.log(`Mode: ${args.mode.toFixed(4)}`);
        console.log(`Maximum: ${args.max.toFixed(4)}`);
        console.log(`Configured range width: ${(args.max - args.min).toFixed(4)}`);
        break;

      case "skew-normal":
        console.log(`Minimum: ${args.min.toFixed(4)}`);
        console.log(`Mode: ${args.mode.toFixed(4)}`);
        console.log(`Maximum: ${args.max.toFixed(4)}`);
        console.log(`Configured range width: ${(args.max - args.min).toFixed(4)}`);
        console.log(`Confidence: ${args.confidence.toFixed(4)}`);
        console.log(`Bias: ${args.bias.toFixed(4)}`);
        console.log(`Tail weight: ${args.tail.toFixed(4)}`);
        break;
    }

    console.log("");
  }

  private printSequence(values: readonly number[], previewCount: number): void {
    console.log("## Sequence");

    const count = Math.min(previewCount, values.length);

    for (let index = 0; index < count; index += 1) {
      console.log(`${String(index + 1).padStart(3, " ")}: ${values[index]!.toFixed(4)}`);
    }

    if (count < values.length) {
      console.log(`... truncated ${values.length - count} value(s)`);
    }

    console.log("");
  }

  private printCsv(values: readonly number[]): void {
    console.log("## CSV");
    console.log(values.map((value) => value.toFixed(4)).join(", "));
    console.log("");
  }

  private printStatistics(statistics: {
    readonly mean: number;
    readonly variance: number;
    readonly standardDeviation: number;
    readonly minimum: number;
    readonly maximum: number;
    readonly percentile50: number;
    readonly percentile80: number;
    readonly percentile90: number;
    readonly percentile95: number;
  }): void {
    console.log("## Statistics");
    console.log(`Mean: ${statistics.mean.toFixed(4)}`);
    console.log(`Variance: ${statistics.variance.toFixed(4)}`);
    console.log(`StdDev: ${statistics.standardDeviation.toFixed(4)}`);
    console.log(`Min: ${statistics.minimum.toFixed(4)}`);
    console.log(`Max: ${statistics.maximum.toFixed(4)}`);
    console.log(`P50: ${statistics.percentile50.toFixed(4)}`);
    console.log(`P80: ${statistics.percentile80.toFixed(4)}`);
    console.log(`P90: ${statistics.percentile90.toFixed(4)}`);
    console.log(`P95: ${statistics.percentile95.toFixed(4)}`);
  }
}

new Sample2Application().run(process.argv.slice(2));