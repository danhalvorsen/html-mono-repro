import { IocError } from "./IocError.js";

export class IocBuildError extends IocError {
  public static readonly ErrorCode = "IOC_BUILD_ERROR";

  public readonly Code = IocBuildError.ErrorCode;

  public constructor(message: string) {
    super("IocBuildError", message);
  }
}