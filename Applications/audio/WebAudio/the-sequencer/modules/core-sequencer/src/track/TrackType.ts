
// ============================
// TrackType (no magic strings)
// ============================

import { ValueObject } from "../infrastructure/ValueObject.js";

export class TrackType extends ValueObject {
  public static readonly Trigger = new TrackType("trigger");
  public static readonly Value = new TrackType("value");
  public static readonly Automation = new TrackType("automation");
  public static readonly Modulation = new TrackType("modulation");

  private readonly _value: string;

  private constructor(value: string) {
    super();
    this._value = value;
  }

  public static create(value: string): TrackType {
    return new TrackType(value);
  }

  public get value(): string {
    return this._value;
  }

  public override equals(other: ValueObject): boolean {
    return other instanceof TrackType && other._value === this._value;
  }
}
