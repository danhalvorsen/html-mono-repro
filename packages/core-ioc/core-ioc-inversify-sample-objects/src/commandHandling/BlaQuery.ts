import { IQuery } from "@monorepo/core-design-patterns-cqrs-no-json"; 

export type BlaQueryResult = Readonly<{
  readonly value: string;
  readonly message: string;
  readonly handlerName: "BlaQueryHandler";
}>;

export type BlaQueryMessage = Readonly<{
  readonly value: string;
  readonly message: string;
  readonly handlerName: "BlaQueryHandler";
}>;

export type BlaQueryError = Readonly<{
  readonly code: "BLA_QUERY_ERROR";
  readonly message: string;
}>;

export class BlaQuery implements IQuery<BlaQueryMessage> {
  public readonly message: BlaQueryMessage;

  public constructor(
    public readonly value: string,
  ) {
    this.message = Object.freeze({
      value,
      message: `Bla:${value}`,
      handlerName: "BlaQueryHandler",
    });
  }
}
