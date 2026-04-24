import { DomainContext } from "../infrastructure/DomainContext.js";
import { DomainError } from "../infrastructure/DomainError.js";
import { ErrorCode } from "../infrastructure/ErrorCode.js";
import { Guard } from "../infrastructure/Guard.js";
import { ValueObject } from "../infrastructure/ValueObject.js";

export class TrackType extends ValueObject {
  public static readonly Trigger = new TrackType("trigger");
  public static readonly Value = new TrackType("value");
  public static readonly Automation = new TrackType("automation");
  public static readonly Modulation = new TrackType("modulation");
  private static readonly supportedTypes = Object.freeze([
    TrackType.Trigger,
    TrackType.Value,
    TrackType.Automation,
    TrackType.Modulation,
  ]);

  private readonly _value: string;

  private constructor(value: string) {
    super();
    this._value = Guard.notBlank(value, DomainContext.TrackType);
  }

  public static create(value: string): TrackType {
    const normalizedValue = Guard.notBlank(value, DomainContext.TrackType);
    const resolved = TrackType.supportedTypes.find(
      (type) => type._value === normalizedValue,
    );

    if (resolved === undefined) {
      throw new DomainError(
        ErrorCode.OutOfRange,
        DomainContext.TrackType,
        `Unsupported track type: ${normalizedValue}`,
      );
    }

    return resolved;
  }

  public get value(): string {
    return this._value;
  }

  public override equals(other: ValueObject): boolean {
    return other instanceof TrackType && other._value === this._value;
  }
}
