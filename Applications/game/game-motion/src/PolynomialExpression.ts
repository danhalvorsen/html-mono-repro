import type {
  PolynomialTermTuple,
  ScalarPolynomialExpressionOptions,
} from "./PolynomialTermOptions.js";

export class PolynomialExpression {
  readonly #terms: readonly PolynomialTermTuple[];

  public constructor(terms: ScalarPolynomialExpressionOptions) {
    this.#terms = this.#normalize(this.#validate(terms));
  }

  public get terms(): readonly PolynomialTermTuple[] {
    return this.#terms;
  }

  public evaluateAt(timeSeconds: number): number {
    if (!Number.isFinite(timeSeconds)) {
      throw new Error("timeSeconds must be finite.");
    }

    return this.#terms.reduce(
      (sum, [exponent, coefficient]) =>
        sum + coefficient * Math.pow(timeSeconds, exponent),
      0,
    );
  }

  public derivative(): PolynomialExpression {
    const terms = this.#terms
      .filter(([exponent]) => exponent > 0)
      .map(
        ([exponent, coefficient]) =>
          [exponent - 1, exponent * coefficient] as const,
      );

    return new PolynomialExpression(terms.length > 0 ? terms : [[0, 0]]);
  }

  public integrate(integrationConstant: number): PolynomialExpression {
    if (!Number.isFinite(integrationConstant)) {
      throw new Error("integrationConstant must be finite.");
    }

    const terms = this.#terms.map(
      ([exponent, coefficient]) =>
        [exponent + 1, coefficient / (exponent + 1)] as const,
    );

    return new PolynomialExpression([...terms, [0, integrationConstant]]);
  }

  public scale(factor: number): PolynomialExpression {
    if (!Number.isFinite(factor)) {
      throw new Error("factor must be finite.");
    }

    return new PolynomialExpression(
      this.#terms.map(
        ([exponent, coefficient]) => [exponent, coefficient * factor] as const,
      ),
    );
  }

  public addConstant(value: number): PolynomialExpression {
    if (!Number.isFinite(value)) {
      throw new Error("value must be finite.");
    }

    return new PolynomialExpression([...this.#terms, [0, value]]);
  }

  #validate(
    terms: ScalarPolynomialExpressionOptions,
  ): readonly PolynomialTermTuple[] {
    if (terms.length === 0) {
      throw new Error("PolynomialExpression requires at least one term.");
    }

    for (const [exponent, coefficient] of terms) {
      if (!Number.isInteger(exponent) || exponent < 0) {
        throw new Error("Polynomial exponent must be an integer >= 0.");
      }

      if (!Number.isFinite(coefficient)) {
        throw new Error("Polynomial coefficient must be finite.");
      }
    }

    return terms;
  }

  #normalize(
    terms: readonly PolynomialTermTuple[],
  ): readonly PolynomialTermTuple[] {
    const coefficientsByExponent = new Map<number, number>();

    for (const [exponent, coefficient] of terms) {
      coefficientsByExponent.set(
        exponent,
        (coefficientsByExponent.get(exponent) ?? 0) + coefficient,
      );
    }

    const normalized = [...coefficientsByExponent.entries()]
      .filter(([, coefficient]) => coefficient !== 0)
      .sort(([leftExponent], [rightExponent]) => rightExponent - leftExponent)
      .map(([exponent, coefficient]) => [exponent, coefficient] as const);

    return normalized.length > 0 ? normalized : [[0, 0]];
  }
}
