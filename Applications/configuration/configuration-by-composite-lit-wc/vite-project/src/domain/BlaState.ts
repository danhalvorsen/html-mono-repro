export class BlaState {
  public readonly value: number | null;

  public constructor(value: number | null) {
    this.value = value;
  }

  public static createDefault(): BlaState {
    return new BlaState(50);
  }

  public withValue(value: number | null): BlaState {
    return new BlaState(value);
  }
}
