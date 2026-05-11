import { TurtleDomainError } from "./TurtleDomainError.js";

export class InvalidPrimitiveParameterError extends TurtleDomainError {
  public static readonly code = "INVALID_PRIMITIVE_PARAMETER";

  public readonly code = InvalidPrimitiveParameterError.code;

  public constructor(message: string) {
    super("InvalidPrimitiveParameterError", message);
  }
}