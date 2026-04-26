import type {
  DecibelsValue,
  FrequencyHzValue,
  UnipolarNormalizedValue,
} from "../types/index.js";
import {
  Decibels,
  FrequencyHz,
} from "../value-objects/index.js";

export interface IParameterScale<TValue> {
  fromNormalized(value: UnipolarNormalizedValue): TValue;
  toNormalized(value: TValue): UnipolarNormalizedValue;
}

export class LinearParameterScale implements IParameterScale<number> {
  public constructor(
    private readonly minimum: number,
    private readonly maximum: number,
  ) {
    if (!Number.isFinite(minimum)) {
      throw new Error("minimum must be finite.");
    }

    if (!Number.isFinite(maximum)) {
      throw new Error("maximum must be finite.");
    }

    if (maximum <= minimum) {
      throw new Error("maximum must be greater than minimum.");
    }
  }

  public fromNormalized(value: UnipolarNormalizedValue): number {
    return this.minimum + value * (this.maximum - this.minimum);
  }

  public toNormalized(value: number): UnipolarNormalizedValue {
    return (value - this.minimum) / (this.maximum - this.minimum);
  }
}

export class BipolarLinearParameterScale implements IParameterScale<number> {
  public constructor(
    private readonly negativeMaximum: number,
    private readonly positiveMaximum: number,
  ) {
    if (!Number.isFinite(negativeMaximum)) {
      throw new Error("negativeMaximum must be finite.");
    }

    if (!Number.isFinite(positiveMaximum)) {
      throw new Error("positiveMaximum must be finite.");
    }

    if (negativeMaximum >= 0) {
      throw new Error("negativeMaximum must be less than 0.");
    }

    if (positiveMaximum <= 0) {
      throw new Error("positiveMaximum must be greater than 0.");
    }
  }

  public fromNormalized(value: UnipolarNormalizedValue): number {
    return this.negativeMaximum + value * (this.positiveMaximum - this.negativeMaximum);
  }

  public toNormalized(value: number): UnipolarNormalizedValue {
    return (value - this.negativeMaximum) / (this.positiveMaximum - this.negativeMaximum);
  }
}

export class LogarithmicFrequencyScale implements IParameterScale<FrequencyHzValue> {
  public constructor(
    private readonly minimumHz: FrequencyHzValue,
    private readonly maximumHz: FrequencyHzValue,
  ) {
    FrequencyHz.create(minimumHz);
    FrequencyHz.create(maximumHz);

    if (maximumHz <= minimumHz) {
      throw new Error("maximumHz must be greater than minimumHz.");
    }
  }

  public fromNormalized(value: UnipolarNormalizedValue): FrequencyHzValue {
    return this.minimumHz * Math.pow(this.maximumHz / this.minimumHz, value);
  }

  public toNormalized(value: FrequencyHzValue): UnipolarNormalizedValue {
    return Math.log(value / this.minimumHz) / Math.log(this.maximumHz / this.minimumHz);
  }
}

export class ExponentialParameterScale implements IParameterScale<number> {
  public constructor(
    private readonly minimum: number,
    private readonly maximum: number,
    private readonly exponent: number,
  ) {
    if (!Number.isFinite(minimum)) {
      throw new Error("minimum must be finite.");
    }

    if (!Number.isFinite(maximum)) {
      throw new Error("maximum must be finite.");
    }

    if (maximum <= minimum) {
      throw new Error("maximum must be greater than minimum.");
    }

    if (!Number.isFinite(exponent) || exponent <= 0) {
      throw new Error("exponent must be finite and greater than 0.");
    }
  }

  public fromNormalized(value: UnipolarNormalizedValue): number {
    return this.minimum + Math.pow(value, this.exponent) * (this.maximum - this.minimum);
  }

  public toNormalized(value: number): UnipolarNormalizedValue {
    return Math.pow((value - this.minimum) / (this.maximum - this.minimum), 1 / this.exponent);
  }
}

export class SteppedParameterScale implements IParameterScale<number> {
  public constructor(
    private readonly minimum: number,
    private readonly maximum: number,
    private readonly stepCount: number,
  ) {
    if (!Number.isFinite(minimum)) {
      throw new Error("minimum must be finite.");
    }

    if (!Number.isFinite(maximum)) {
      throw new Error("maximum must be finite.");
    }

    if (maximum <= minimum) {
      throw new Error("maximum must be greater than minimum.");
    }

    if (!Number.isInteger(stepCount) || stepCount <= 1) {
      throw new Error("stepCount must be an integer greater than 1.");
    }
  }

  public fromNormalized(value: UnipolarNormalizedValue): number {
    const index = Math.round(value * (this.stepCount - 1));
    const normalizedStep = index / (this.stepCount - 1);

    return this.minimum + normalizedStep * (this.maximum - this.minimum);
  }

  public toNormalized(value: number): UnipolarNormalizedValue {
    const raw = (value - this.minimum) / (this.maximum - this.minimum);
    const index = Math.round(raw * (this.stepCount - 1));

    return index / (this.stepCount - 1);
  }
}

export class DecibelGainScale implements IParameterScale<DecibelsValue> {
  public constructor(
    private readonly minimumDb: DecibelsValue,
    private readonly maximumDb: DecibelsValue,
  ) {
    Decibels.create(minimumDb);
    Decibels.create(maximumDb);

    if (maximumDb <= minimumDb) {
      throw new Error("maximumDb must be greater than minimumDb.");
    }
  }

  public fromNormalized(value: UnipolarNormalizedValue): DecibelsValue {
    return this.minimumDb + value * (this.maximumDb - this.minimumDb);
  }

  public toNormalized(value: DecibelsValue): UnipolarNormalizedValue {
    Decibels.create(value);

    return (value - this.minimumDb) / (this.maximumDb - this.minimumDb);
  }
}
