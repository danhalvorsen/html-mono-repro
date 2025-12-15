export class TimeStamp {
  private constructor(private readonly value: number) {}

  static now(): TimeStamp {
    return new TimeStamp(performance.now());
  }

  toNumber(): number {
    return this.value;
  }

  toString(): string {
    return `TimeStamp(${this.value})`;
  }
}
