import { ErrorCode } from "./ErrorCode.js";

export class DomainError extends Error {
  private readonly _code: ErrorCode;
  private readonly _context: string;

  public constructor(code: ErrorCode, context: string, detail?: string) {
    super(`${code.value}:${context}${detail ? `:${detail}` : ""}`);

    this._code = code;
    this._context = context;
  }

  public get code(): ErrorCode {
    return this._code;
  }

  public get context(): string {
    return this._context;
  }
}
