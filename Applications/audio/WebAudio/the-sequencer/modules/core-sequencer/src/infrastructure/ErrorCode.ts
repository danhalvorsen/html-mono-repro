import { ValueObject } from "./ValueObject.js";

export class ErrorCode extends ValueObject {
  public static readonly Required = new ErrorCode("ERR_REQUIRED");
  public static readonly Integer = new ErrorCode("ERR_INTEGER");
  public static readonly NonNegative = new ErrorCode("ERR_NON_NEGATIVE");
  public static readonly Positive = new ErrorCode("ERR_POSITIVE");
  public static readonly OutOfRange = new ErrorCode("ERR_OUT_OF_RANGE");
  public static readonly InvalidState = new ErrorCode("ERR_INVALID_STATE");

  private readonly _value: string;

  private constructor(value: string) {
    super();
    this._value = value;
  }

  public get value(): string {
    return this._value;
  }

  public override equals(other: ValueObject): boolean {
    return other instanceof ErrorCode && other._value === this._value;
  }
}
