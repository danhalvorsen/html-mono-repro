import { IocError } from "./IocError.js";

export class IocDuplicateDescriptorError extends IocError {
  public static readonly ErrorCode = "IOC_DUPLICATE_DESCRIPTOR";

  public readonly Code = IocDuplicateDescriptorError.ErrorCode;

  public constructor(
    serviceName: string,
    implementationName: string,
    lifetime: string,
  ) {
    super(
      "IocDuplicateDescriptorError",
      `Duplicate service descriptor rejected. Service='${serviceName}', Implementation='${implementationName}', Lifetime='${lifetime}'.`,
    );
  }
}