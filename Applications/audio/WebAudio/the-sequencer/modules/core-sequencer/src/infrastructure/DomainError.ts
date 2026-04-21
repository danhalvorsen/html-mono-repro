import { ErrorCode } from "./ErrorCode.js";

export class DomainError extends Error {
  private readonly _code: ErrorCode;
  private readonly _context: string;
  private readonly _detail?: string;

  public constructor(code: ErrorCode, context: string, detail?: string) {
    super(
      detail === undefined
        ? `${code.value}:${context}`
        : `${code.value}:${context}:${detail}`,
    );

    this._code = code;
    this._context = context;
    this._detail = detail;
  }

  public get code(): ErrorCode {
    return this._code;
  }

  public get context(): string {
    return this._context;
  }

  public get detail(): string | undefined {
    return this._detail;
  }
}
