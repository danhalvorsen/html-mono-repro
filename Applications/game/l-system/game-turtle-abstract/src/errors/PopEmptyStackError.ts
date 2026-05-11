import { TurtleDomainError } from "./TurtleDomainError.js";

export class PopEmptyStackError extends TurtleDomainError {
  public static readonly code = "POP_EMPTY_STACK";

  public readonly code = PopEmptyStackError.code;

  public constructor() {
    super("PopEmptyStackError", "Cannot pop turtle state because the state stack is empty.");
  }
}