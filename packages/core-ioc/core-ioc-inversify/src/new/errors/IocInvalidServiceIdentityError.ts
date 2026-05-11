import { IocError } from "./IocError.js";

export class IocInvalidServiceIdentityError extends IocError {
  public static readonly ErrorCode = "IOC_INVALID_SERVICE_IDENTITY";

  public readonly Code = IocInvalidServiceIdentityError.ErrorCode;

  public constructor() {
    super(
      "IocInvalidServiceIdentityError",
      "Service identity must be a runtime class, abstract class, or strongly typed runtime identity object. String identifiers and raw symbols are not supported.",
    );
  }
}