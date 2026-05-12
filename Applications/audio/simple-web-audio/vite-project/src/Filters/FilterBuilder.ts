import { FilterUnit } from "./FilterUnit";

export class FilterBuilder {
  readonly #context: AudioContext;

  #type: BiquadFilterType = "lowpass";
  #frequency = 1000;
  #q = 1;

  public constructor(context: AudioContext) {
    this.#context = context;
  }

  public type(value: BiquadFilterType): this {
    this.#type = value;
    return this;
  }

  public frequency(value: number): this {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error("Filter frequency must be greater than 0.");
    }

    this.#frequency = value;
    return this;
  }

  public q(value: number): this {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error("Filter Q must be greater than or equal to 0.");
    }

    this.#q = value;
    return this;
  }

  public build(): FilterUnit {
    const filter = this.#context.createBiquadFilter();
    filter.type = this.#type;
    filter.frequency.value = this.#frequency;
    filter.Q.value = this.#q;

    return new FilterUnit(filter);
  }
}