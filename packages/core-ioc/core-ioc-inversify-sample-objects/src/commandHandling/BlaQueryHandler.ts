import { Ok, type Result } from "@monorepo/core-design-patterns";
import { QueryHandler, type IQuery } from "@monorepo/core-design-patterns-cqrs-no-json";
import {
  type BlaQueryError,
  type BlaQueryMessage,
  type BlaQueryResult,
} from "./BlaQuery.js";

export abstract class BlaQueryHandlerContract extends QueryHandler<
  BlaQueryMessage,
  BlaQueryResult,
  BlaQueryError
> {}

export class BlaQueryHandler extends BlaQueryHandlerContract {
  public async Handle(
    query: IQuery<BlaQueryMessage>,
  ): Promise<Result<BlaQueryResult, BlaQueryError>> {
    return Ok(Object.freeze({
      value: query.message.value.toUpperCase(),
      message: query.message.message,
      handlerName: "BlaQueryHandler",
    }));
  }
}
