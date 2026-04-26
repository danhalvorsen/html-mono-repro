import {
  type ISpecification,
  Specification,
} from "@monorepo/core-specifications";

export class FiniteNumberSpecification extends Specification<number> {
  public isSatisfiedBy(candidate: number): boolean {
    return Number.isFinite(candidate);
  }
}

export class PositiveNumberSpecification extends Specification<number> {
  public isSatisfiedBy(candidate: number): boolean {
    return candidate > 0;
  }
}

export class NonNegativeNumberSpecification extends Specification<number> {
  public isSatisfiedBy(candidate: number): boolean {
    return candidate >= 0;
  }
}

export class IntegerNumberSpecification extends Specification<number> {
  public isSatisfiedBy(candidate: number): boolean {
    return Number.isInteger(candidate);
  }
}

export class MinimumNumberSpecification extends Specification<number> {
  public constructor(private readonly minimum: number) {
    super();

    if (!Number.isFinite(minimum)) {
      throw new Error("minimum must be finite.");
    }
  }

  public isSatisfiedBy(candidate: number): boolean {
    return Number.isFinite(candidate) && candidate >= this.minimum;
  }
}

export class MaximumNumberSpecification extends Specification<number> {
  public constructor(private readonly maximum: number) {
    super();

    if (!Number.isFinite(maximum)) {
      throw new Error("maximum must be finite.");
    }
  }

  public isSatisfiedBy(candidate: number): boolean {
    return Number.isFinite(candidate) && candidate <= this.maximum;
  }
}

export class RangeNumberSpecification extends Specification<number> {
  private readonly specification: ISpecification<number>;

  public constructor(
    minimum: number,
    maximum: number,
  ) {
    super();

    if (!Number.isFinite(minimum)) {
      throw new Error("minimum must be finite.");
    }

    if (!Number.isFinite(maximum)) {
      throw new Error("maximum must be finite.");
    }

    if (maximum < minimum) {
      throw new Error("maximum must be greater than or equal to minimum.");
    }

    this.specification = new MinimumNumberSpecification(minimum).and(
      new MaximumNumberSpecification(maximum),
    );
  }

  public isSatisfiedBy(candidate: number): boolean {
    return this.specification.isSatisfiedBy(candidate);
  }
}

export class NumberSpecifications {
  public static finite(): ISpecification<number> {
    return new FiniteNumberSpecification();
  }

  public static positiveFinite(): ISpecification<number> {
    return new FiniteNumberSpecification().and(new PositiveNumberSpecification());
  }

  public static nonNegativeFinite(): ISpecification<number> {
    return new FiniteNumberSpecification().and(new NonNegativeNumberSpecification());
  }

  public static integerFinite(): ISpecification<number> {
    return new FiniteNumberSpecification().and(new IntegerNumberSpecification());
  }

  public static range(
    minimum: number,
    maximum: number,
  ): ISpecification<number> {
    return new FiniteNumberSpecification().and(
      new RangeNumberSpecification(minimum, maximum),
    );
  }

  public static integerRange(
    minimum: number,
    maximum: number,
  ): ISpecification<number> {
    return new FiniteNumberSpecification()
      .and(new IntegerNumberSpecification())
      .and(new RangeNumberSpecification(minimum, maximum));
  }
}
