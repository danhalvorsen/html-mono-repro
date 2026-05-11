import { TurtleDomainError } from "./TurtleDomainError.js";

export class InvalidRotationError extends TurtleDomainError {
  public static readonly code = "INVALID_ROTATION";

  public readonly code = InvalidRotationError.code;

  public constructor(message: string) {
    super("InvalidRotationError", message);
  }
}