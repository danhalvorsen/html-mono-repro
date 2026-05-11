import { IocError } from "./IocError.js";

export class IocAdapterError extends IocError {
  public static readonly ErrorCode = "IOC_ADAPTER_ERROR";

  public readonly Code = IocAdapterError.ErrorCode;

  public constructor(message: string) {
    super("IocAdapterError", message);
  }
}