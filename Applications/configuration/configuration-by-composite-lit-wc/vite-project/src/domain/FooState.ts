export class FooState {
  public readonly min: number | null;
  public readonly max: number | null;

  public constructor(min: number | null, max: number | null) {
    this.min = min;
    this.max = max;
  }

  public static createDefault(): FooState {
    return new FooState(0, 100);
  }

  public withMin(min: number | null): FooState {
    return new FooState(min, this.max);
  }

  public withMax(max: number | null): FooState {
    return new FooState(this.min, max);
  }
}
