import { IocError } from "./IocError.js";

export class IocInvalidRegistrationError extends IocError {
  public static readonly ErrorCode = "IOC_INVALID_REGISTRATION";

  public readonly Code = IocInvalidRegistrationError.ErrorCode;

  public constructor(message: string) {
    super("IocInvalidRegistrationError", message);
  }
}