import { Composite } from "../core/composite.js";

export interface InputRangeOptions {
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly value: number;
  readonly step?: number;
}

type InputRangeHost = HTMLElement & {
  label: string;
  min: number;
  max: number;
  value: number;
  step: number;
};

export class InputRangeUI extends Composite {
  public constructor(public readonly options: InputRangeOptions) {
    super("InputRange");
    InputRangeUI.validate(options);
  }

  protected createHostElement(): HTMLElement {
    const element = document.createElement("ui-input-range") as InputRangeHost;

    element.label = this.options.label;
    element.min = this.options.min;
    element.max = this.options.max;
    element.step = this.options.step ?? 1;
    element.value = this.clamp(this.options.value);

    return element;
  }

  private clamp(value: number): number {
    return Math.min(this.options.max, Math.max(this.options.min, value));
  }

  private static validate(options: InputRangeOptions): void {
    if (options.label.trim().length === 0) {
      throw new RangeError("InputRangeUI label is required.");
    }

    if (!Number.isFinite(options.min)) {
      throw new RangeError("InputRangeUI min must be finite.");
    }

    if (!Number.isFinite(options.max)) {
      throw new RangeError("InputRangeUI max must be finite.");
    }

    if (options.max <= options.min) {
      throw new RangeError("InputRangeUI max must be greater than min.");
    }

    if (!Number.isFinite(options.value)) {
      throw new RangeError("InputRangeUI value must be finite.");
    }

    if (
      options.step !== undefined &&
      (!Number.isFinite(options.step) || options.step <= 0)
    ) {
      throw new RangeError("InputRangeUI step must be finite and greater than zero.");
    }
  }
}
