// ============================================================================
// TREE MODELING - STRATEGY DESIGN PATTERN
// Production-oriented TypeScript example
// One snippet, interface-first, open for extension, deterministic
// ============================================================================

// ============================================================================
// DOMAIN CONTRACTS
// ============================================================================

export interface ITreeNoiseSource {
  sample01(key: string): number;
}

export interface ITreeSpeciesId {
  readonly value: string;
}

export class TreeSpeciesId implements ITreeSpeciesId {
  public readonly value: string;

  public constructor(value: string) {
    if (value.trim().length === 0) {
      throw new Error("TreeSpeciesId must be a non-empty string.");
    }

    this.value = value;
  }
}

export interface ITreeModelingRequest {
  readonly speciesId: ITreeSpeciesId;
  readonly years: number;
  readonly totalHeight: number;
  readonly radialSampleCount: number;
  readonly verticalSampleCount: number;
  readonly baseRadius: number;
}

export class TreeModelingRequest implements ITreeModelingRequest {
  public readonly speciesId: ITreeSpeciesId;
  public readonly years: number;
  public readonly totalHeight: number;
  public readonly radialSampleCount: number;
  public readonly verticalSampleCount: number;
  public readonly baseRadius: number;

  public constructor(params: ITreeModelingRequest) {
    this.speciesId = params.speciesId;
    this.years = TreeGuards.requirePositiveInteger(params.years, "years");
    this.totalHeight = TreeGuards.requirePositiveNumber(params.totalHeight, "totalHeight");
    this.radialSampleCount = TreeGuards.requireMinimumInteger(params.radialSampleCount, 8, "radialSampleCount");
    this.verticalSampleCount = TreeGuards.requireMinimumInteger(params.verticalSampleCount, 2, "verticalSampleCount");
    this.baseRadius = TreeGuards.requirePositiveNumber(params.baseRadius, "baseRadius");
  }
}

export interface ITreeCrossSectionSample {
  readonly sampleIndex: number;
  readonly angleRadians: number;
  readonly radius: number;
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface ITreeCrossSection {
  readonly sectionIndex: number;
  readonly normalizedHeight: number;
  readonly z: number;
  readonly samples: ReadonlyArray<ITreeCrossSectionSample>;
}

export interface ITreeTrunkDomainObject {
  readonly speciesId: ITreeSpeciesId;
  readonly years: number;
  readonly totalHeight: number;
  readonly radialSampleCount: number;
  readonly verticalSampleCount: number;
  readonly crossSections: ReadonlyArray<ITreeCrossSection>;
}

// ============================================================================
// STRATEGY CONTRACTS
// ============================================================================

export interface ITreeProfileStrategy {
  createBaseRadius(
    request: ITreeModelingRequest,
    normalizedHeight: number,
  ): number;
}

export interface ITreeCrossSectionShapeStrategy {
  sampleRadius(
    request: ITreeModelingRequest,
    normalizedHeight: number,
    angleRadians: number,
    baseRadius: number,
    noiseSource: ITreeNoiseSource,
    keyPrefix: string,
  ): number;
}

export interface ITreeVerticalMemoryStrategy {
  evolve(
    previousOffsets: ReadonlyArray<number> | undefined,
    request: ITreeModelingRequest,
    sectionIndex: number,
    normalizedHeight: number,
    noiseSource: ITreeNoiseSource,
  ): ReadonlyArray<number>;
}

export interface ITreeSpeciesModelStrategy {
  readonly speciesId: ITreeSpeciesId;
  readonly profileStrategy: ITreeProfileStrategy;
  readonly shapeStrategy: ITreeCrossSectionShapeStrategy;
  readonly verticalMemoryStrategy: ITreeVerticalMemoryStrategy;
}

export interface ITreeSpeciesModelStrategyRegistry {
  getBySpeciesId(speciesId: ITreeSpeciesId): ITreeSpeciesModelStrategy;
}

export interface ITreeTrunkGenerator {
  generate(request: ITreeModelingRequest): ITreeTrunkDomainObject;
}

// ============================================================================
// GENERATOR
// ============================================================================

export class TreeTrunkGenerator implements ITreeTrunkGenerator {
  private readonly registry: ITreeSpeciesModelStrategyRegistry;
  private readonly noiseSource: ITreeNoiseSource;

  public constructor(
    registry: ITreeSpeciesModelStrategyRegistry,
    noiseSource: ITreeNoiseSource,
  ) {
    this.registry = registry;
    this.noiseSource = noiseSource;
  }

  public generate(request: ITreeModelingRequest): ITreeTrunkDomainObject {
    const validatedRequest = new TreeModelingRequest(request);
    const strategy = this.registry.getBySpeciesId(validatedRequest.speciesId);
    const crossSections: ITreeCrossSection[] = [];

    let previousOffsets: ReadonlyArray<number> | undefined = undefined;

    for (let sectionIndex = 0; sectionIndex < validatedRequest.verticalSampleCount; sectionIndex++) {
      const normalizedHeight =
        validatedRequest.verticalSampleCount === 1
          ? 0
          : sectionIndex / (validatedRequest.verticalSampleCount - 1);

      const z = validatedRequest.totalHeight * normalizedHeight;
      const baseRadius = strategy.profileStrategy.createBaseRadius(
        validatedRequest,
        normalizedHeight,
      );

      const memoryOffsets = strategy.verticalMemoryStrategy.evolve(
        previousOffsets,
        validatedRequest,
        sectionIndex,
        normalizedHeight,
        this.noiseSource,
      );

      const samples: ITreeCrossSectionSample[] = [];

      for (let sampleIndex = 0; sampleIndex < validatedRequest.radialSampleCount; sampleIndex++) {
        const angleRadians =
          (sampleIndex / validatedRequest.radialSampleCount) * Math.PI * 2;

        const modeledRadius = strategy.shapeStrategy.sampleRadius(
          validatedRequest,
          normalizedHeight,
          angleRadians,
          baseRadius,
          this.noiseSource,
          `species:${validatedRequest.speciesId.value}:section:${sectionIndex}:sample:${sampleIndex}`,
        );

        const memoryOffset = memoryOffsets[sampleIndex] ?? 0;
        const radius = Math.max(validatedRequest.baseRadius * 0.15, modeledRadius + memoryOffset);
        const x = Math.cos(angleRadians) * radius;
        const y = Math.sin(angleRadians) * radius;

        samples.push(
          Object.freeze({
            sampleIndex,
            angleRadians,
            radius,
            x,
            y,
            z,
          }),
        );
      }

      crossSections.push(
        Object.freeze({
          sectionIndex,
          normalizedHeight,
          z,
          samples: Object.freeze(samples),
        }),
      );

      previousOffsets = memoryOffsets;
    }

    return Object.freeze({
      speciesId: validatedRequest.speciesId,
      years: validatedRequest.years,
      totalHeight: validatedRequest.totalHeight,
      radialSampleCount: validatedRequest.radialSampleCount,
      verticalSampleCount: validatedRequest.verticalSampleCount,
      crossSections: Object.freeze(crossSections),
    });
  }
}

// ============================================================================
// REGISTRY
// ============================================================================

export class TreeSpeciesModelStrategyRegistry implements ITreeSpeciesModelStrategyRegistry {
  private readonly strategies: ReadonlyMap<string, ITreeSpeciesModelStrategy>;

  public constructor(strategies: ReadonlyArray<ITreeSpeciesModelStrategy>) {
    if (strategies.length === 0) {
      throw new Error("At least one tree species strategy must be registered.");
    }

    const values = new Map<string, ITreeSpeciesModelStrategy>();

    for (const strategy of strategies) {
      const key = strategy.speciesId.value;

      if (values.has(key)) {
        throw new Error(`Duplicate tree species strategy registration: ${key}`);
      }

      values.set(key, strategy);
    }

    this.strategies = values;
  }

  public getBySpeciesId(speciesId: ITreeSpeciesId): ITreeSpeciesModelStrategy {
    const strategy = this.strategies.get(speciesId.value);

    if (!strategy) {
      throw new Error(`No tree species strategy registered for '${speciesId.value}'.`);
    }

    return strategy;
  }
}

// ============================================================================
// NOISE
// ============================================================================

export class DeterministicTreeNoiseSource implements ITreeNoiseSource {
  private readonly seed: string;

  public constructor(seed: string) {
    if (seed.trim().length === 0) {
      throw new Error("Seed must be a non-empty string.");
    }

    this.seed = seed;
  }

  public sample01(key: string): number {
    const value = this.fnv1a(`${this.seed}:${key}`);
    return value / 0x100000000;
  }

  private fnv1a(input: string): number {
    let hash = 0x811c9dc5;

    for (let index = 0; index < input.length; index++) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193);
      hash >>>= 0;
    }

    return hash >>> 0;
  }
}

// ============================================================================
// SHARED STRATEGY BUILDING BLOCKS
// ============================================================================

export class LinearTaperProfileStrategy implements ITreeProfileStrategy {
  private readonly topRadiusFactor: number;
  private readonly ageGrowthFactor: number;

  public constructor(
    topRadiusFactor: number,
    ageGrowthFactor: number,
  ) {
    this.topRadiusFactor = TreeGuards.requireRangeInclusive(topRadiusFactor, 0.05, 1, "topRadiusFactor");
    this.ageGrowthFactor = TreeGuards.requireNonNegativeNumber(ageGrowthFactor, "ageGrowthFactor");
  }

  public createBaseRadius(
    request: ITreeModelingRequest,
    normalizedHeight: number,
  ): number {
    const taperFactor = this.lerp(1, this.topRadiusFactor, normalizedHeight);
    const ageFactor = 1 + ((request.years - 1) * this.ageGrowthFactor);
    return request.baseRadius * ageFactor * taperFactor;
  }

  private lerp(start: number, end: number, amount: number): number {
    return start + ((end - start) * amount);
  }
}

export class SmoothMemoryStrategy implements ITreeVerticalMemoryStrategy {
  private readonly persistence: number;
  private readonly smoothing: number;
  private readonly injection: number;

  public constructor(
    persistence: number,
    smoothing: number,
    injection: number,
  ) {
    this.persistence = TreeGuards.requireRangeInclusive(persistence, 0, 1, "persistence");
    this.smoothing = TreeGuards.requireRangeInclusive(smoothing, 0, 1, "smoothing");
    this.injection = TreeGuards.requireNonNegativeNumber(injection, "injection");
  }

  public evolve(
    previousOffsets: ReadonlyArray<number> | undefined,
    request: ITreeModelingRequest,
    sectionIndex: number,
    normalizedHeight: number,
    noiseSource: ITreeNoiseSource,
  ): ReadonlyArray<number> {
    const count = request.radialSampleCount;
    const next: number[] = new Array<number>(count);

    for (let index = 0; index < count; index++) {
      const previous = previousOffsets?.[index] ?? 0;
      const previousLeft = previousOffsets?.[(index - 1 + count) % count] ?? previous;
      const previousRight = previousOffsets?.[(index + 1) % count] ?? previous;
      const neighborhoodAverage = (previousLeft + previous + previousRight) / 3;
      const freshNoise = ((noiseSource.sample01(
        `memory:section:${sectionIndex}:sample:${index}:h:${normalizedHeight.toFixed(4)}`,
      ) * 2) - 1) * this.injection;

      next[index] =
        (previous * this.persistence) +
        (neighborhoodAverage * this.smoothing) +
        freshNoise;
    }

    return Object.freeze(next);
  }
}

export class OakCrossSectionShapeStrategy implements ITreeCrossSectionShapeStrategy {
  public sampleRadius(
    _request: ITreeModelingRequest,
    normalizedHeight: number,
    angleRadians: number,
    baseRadius: number,
    noiseSource: ITreeNoiseSource,
    keyPrefix: string,
  ): number {
    const ellipseRatio = 0.88;
    const major = baseRadius;
    const minor = baseRadius * ellipseRatio;

    const structuralRadius = this.calculateEllipseRadius(major, minor, angleRadians);
    const barkRidge =
      Math.sin((angleRadians * 6) + (normalizedHeight * 1.5)) *
      (baseRadius * 0.05);

    const roughness =
      ((noiseSource.sample01(`${keyPrefix}:roughness`) * 2) - 1) *
      (baseRadius * 0.025);

    return structuralRadius + barkRidge + roughness;
  }

  private calculateEllipseRadius(
    majorAxisRadius: number,
    minorAxisRadius: number,
    angleRadians: number,
  ): number {
    const cosAngle = Math.cos(angleRadians);
    const sinAngle = Math.sin(angleRadians);
    const numerator = majorAxisRadius * minorAxisRadius;
    const denominator = Math.sqrt(
      (minorAxisRadius * minorAxisRadius * cosAngle * cosAngle) +
      (majorAxisRadius * majorAxisRadius * sinAngle * sinAngle),
    );

    if (denominator <= 0) {
      throw new Error("Ellipse denominator must be greater than zero.");
    }

    return numerator / denominator;
  }
}

export class PineCrossSectionShapeStrategy implements ITreeCrossSectionShapeStrategy {
  public sampleRadius(
    _request: ITreeModelingRequest,
    normalizedHeight: number,
    angleRadians: number,
    baseRadius: number,
    noiseSource: ITreeNoiseSource,
    keyPrefix: string,
  ): number {
    const taperBulge = (1 - normalizedHeight) * baseRadius * 0.08;
    const roundness = baseRadius + taperBulge;
    const ringNoise =
      Math.sin((angleRadians * 4) + (normalizedHeight * 2.2)) *
      (baseRadius * 0.025);
    const fineNoise =
      ((noiseSource.sample01(`${keyPrefix}:fine`) * 2) - 1) *
      (baseRadius * 0.015);

    return roundness + ringNoise + fineNoise;
  }
}

export class BirchCrossSectionShapeStrategy implements ITreeCrossSectionShapeStrategy {
  public sampleRadius(
    _request: ITreeModelingRequest,
    normalizedHeight: number,
    angleRadians: number,
    baseRadius: number,
    noiseSource: ITreeNoiseSource,
    keyPrefix: string,
  ): number {
    const ellipseRatio = 0.95;
    const major = baseRadius;
    const minor = baseRadius * ellipseRatio;

    const structuralRadius = this.calculateEllipseRadius(major, minor, angleRadians);
    const subtleRipple =
      Math.sin((angleRadians * 8) + (normalizedHeight * 0.9)) *
      (baseRadius * 0.018);
    const microNoise =
      ((noiseSource.sample01(`${keyPrefix}:micro`) * 2) - 1) *
      (baseRadius * 0.01);

    return structuralRadius + subtleRipple + microNoise;
  }

  private calculateEllipseRadius(
    majorAxisRadius: number,
    minorAxisRadius: number,
    angleRadians: number,
  ): number {
    const cosAngle = Math.cos(angleRadians);
    const sinAngle = Math.sin(angleRadians);
    const numerator = majorAxisRadius * minorAxisRadius;
    const denominator = Math.sqrt(
      (minorAxisRadius * minorAxisRadius * cosAngle * cosAngle) +
      (majorAxisRadius * majorAxisRadius * sinAngle * sinAngle),
    );

    if (denominator <= 0) {
      throw new Error("Ellipse denominator must be greater than zero.");
    }

    return numerator / denominator;
  }
}

// ============================================================================
// SPECIES STRATEGIES
// ============================================================================

export class OakTreeSpeciesModelStrategy implements ITreeSpeciesModelStrategy {
  public readonly speciesId: ITreeSpeciesId = new TreeSpeciesId("oak");
  public readonly profileStrategy: ITreeProfileStrategy;
  public readonly shapeStrategy: ITreeCrossSectionShapeStrategy;
  public readonly verticalMemoryStrategy: ITreeVerticalMemoryStrategy;

  public constructor() {
    this.profileStrategy = new LinearTaperProfileStrategy(0.32, 0.03);
    this.shapeStrategy = new OakCrossSectionShapeStrategy();
    this.verticalMemoryStrategy = new SmoothMemoryStrategy(0.78, 0.18, 0.010);
  }
}

export class PineTreeSpeciesModelStrategy implements ITreeSpeciesModelStrategy {
  public readonly speciesId: ITreeSpeciesId = new TreeSpeciesId("pine");
  public readonly profileStrategy: ITreeProfileStrategy;
  public readonly shapeStrategy: ITreeCrossSectionShapeStrategy;
  public readonly verticalMemoryStrategy: ITreeVerticalMemoryStrategy;

  public constructor() {
    this.profileStrategy = new LinearTaperProfileStrategy(0.18, 0.02);
    this.shapeStrategy = new PineCrossSectionShapeStrategy();
    this.verticalMemoryStrategy = new SmoothMemoryStrategy(0.86, 0.10, 0.006);
  }
}

export class BirchTreeSpeciesModelStrategy implements ITreeSpeciesModelStrategy {
  public readonly speciesId: ITreeSpeciesId = new TreeSpeciesId("birch");
  public readonly profileStrategy: ITreeProfileStrategy;
  public readonly shapeStrategy: ITreeCrossSectionShapeStrategy;
  public readonly verticalMemoryStrategy: ITreeVerticalMemoryStrategy;

  public constructor() {
    this.profileStrategy = new LinearTaperProfileStrategy(0.28, 0.018);
    this.shapeStrategy = new BirchCrossSectionShapeStrategy();
    this.verticalMemoryStrategy = new SmoothMemoryStrategy(0.70, 0.24, 0.004);
  }
}

// ============================================================================
// COMPOSITION ROOT
// ============================================================================

export interface ITreeModelingCompositionRoot {
  createGenerator(): ITreeTrunkGenerator;
}

export class TreeModelingCompositionRoot implements ITreeModelingCompositionRoot {
  public createGenerator(): ITreeTrunkGenerator {
    const registry = new TreeSpeciesModelStrategyRegistry([
      new OakTreeSpeciesModelStrategy(),
      new PineTreeSpeciesModelStrategy(),
      new BirchTreeSpeciesModelStrategy(),
    ]);

    const noiseSource = new DeterministicTreeNoiseSource("tree-model-seed-01");

    return new TreeTrunkGenerator(registry, noiseSource);
  }
}

// ============================================================================
// GUARDS
// ============================================================================

class TreeGuards {
  public static requirePositiveInteger(value: number, name: string): number {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(`${name} must be a positive integer.`);
    }

    return value;
  }

  public static requireMinimumInteger(value: number, minimum: number, name: string): number {
    if (!Number.isInteger(value) || value < minimum) {
      throw new Error(`${name} must be an integer greater than or equal to ${minimum}.`);
    }

    return value;
  }

  public static requirePositiveNumber(value: number, name: string): number {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${name} must be a positive finite number.`);
    }

    return value;
  }

  public static requireNonNegativeNumber(value: number, name: string): number {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${name} must be a non-negative finite number.`);
    }

    return value;
  }

  public static requireRangeInclusive(
    value: number,
    minimum: number,
    maximum: number,
    name: string,
  ): number {
    if (!Number.isFinite(value) || value < minimum || value > maximum) {
      throw new Error(`${name} must be between ${minimum} and ${maximum}.`);
    }

    return value;
  }
}

// ============================================================================
// USAGE
// ============================================================================

const compositionRoot = new TreeModelingCompositionRoot();
const generator = compositionRoot.createGenerator();

const oakTree = generator.generate({
  speciesId: new TreeSpeciesId("oak"),
  years: 24,
  totalHeight: 12,
  radialSampleCount: 32,
  verticalSampleCount: 96,
  baseRadius: 0.16,
});

const pineTree = generator.generate({
  speciesId: new TreeSpeciesId("pine"),
  years: 18,
  totalHeight: 15,
  radialSampleCount: 28,
  verticalSampleCount: 88,
  baseRadius: 0.14,
});

const birchTree = generator.generate({
  speciesId: new TreeSpeciesId("birch"),
  years: 12,
  totalHeight: 10,
  radialSampleCount: 24,
  verticalSampleCount: 72,
  baseRadius: 0.10,
});

console.log(
  oakTree.speciesId.value,
  oakTree.crossSections.length,
  oakTree.crossSections[0].samples.length,
);

console.log(
  pineTree.speciesId.value,
  pineTree.crossSections.length,
  pineTree.crossSections[0].samples.length,
);

console.log(
  birchTree.speciesId.value,
  birchTree.crossSections.length,
  birchTree.crossSections[0].samples.length,
);