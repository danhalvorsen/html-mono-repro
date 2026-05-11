export class PlayerInputAxis {
  readonly #negative: boolean;
  readonly #positive: boolean;

  public constructor(options: {
    readonly negative: boolean;
    readonly positive: boolean;
  }) {
    this.#negative = options.negative;
    this.#positive = options.positive;
  }

  public get value(): number {
    if (this.#negative && !this.#positive) return -1;
    if (this.#positive && !this.#negative) return 1;

    return 0;
  }
}