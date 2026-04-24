import { Err, Ok, type Result } from '@monorepo/core-design-patterns';
import {
  QueryHandler,
  type IQuery,
} from '@monorepo/core-design-patterns-cqrs';
import { InformationQuery } from './InformationQuery.js';
import {
  errInformationResult,
  okInformationResult,
  type InformationResultPayload,
} from './informationResult.js';

export class InformationQueryHandler<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
> extends QueryHandler<InformationQuery<TPayload>, InformationResultPayload<TPayload>, string> {
  public override async handle(
    query: IQuery<InformationQuery<TPayload>>,
  ): Promise<Result<InformationResultPayload<TPayload>, string>> {
    try {
      const parsed = JSON.parse(query.json) as { payload?: unknown };
      if (!isObject(parsed.payload)) {
        return errInformationResult('Query payload must be a JSON object.');
      }

      return okInformationResult(parsed.payload as TPayload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid information query json.';
      return Err(message);
    }
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
