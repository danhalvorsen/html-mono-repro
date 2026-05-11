import { IocError } from "./IocError.js";

export class IocCollectionFrozenError extends IocError {
  public static readonly ErrorCode = "IOC_COLLECTION_FROZEN";

  public readonly Code = IocCollectionFrozenError.ErrorCode;

  public constructor() {
    super(
      "IocCollectionFrozenError",
      "The ServiceCollection is frozen because BuildServiceProvider has already completed.",
    );
  }
}