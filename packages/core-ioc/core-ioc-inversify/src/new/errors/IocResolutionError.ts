import { IocError } from "./IocError.js";

export class IocResolutionError extends IocError {
  public static readonly ErrorCode = "IOC_RESOLUTION_ERROR";

  public readonly Code = IocResolutionError.ErrorCode;

  public constructor(message: string) {
    super("IocResolutionError", message);
  }

  public static MissingService(serviceName: string): IocResolutionError {
    return new IocResolutionError(
      `Service resolution failed. Service='${serviceName}' is not registered.`,
    );
  }

  public static Failed(serviceName: string): IocResolutionError {
    return new IocResolutionError(
      `Service resolution failed. Service='${serviceName}'.`,
    );
  }
}