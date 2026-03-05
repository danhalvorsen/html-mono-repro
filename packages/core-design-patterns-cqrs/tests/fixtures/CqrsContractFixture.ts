// packages/core-design-patterns/tests/CQRS/fixtures/CqrsContractFixture.ts
import type {
  ICommand,
  IQuery,
  INotification,
  ICommandBase,
  IQueryBase,
  INotificationBase,
} from '../../src/index.js';

import type { NonUndefined, Result } from "@monorepo/core-design-patterns";

export class CqrsContractFixture {

  public createCommand<TMessage extends ICommandBase>(message: TMessage): ICommand<TMessage> {
    return { json: JSON.stringify({ type: message.constructor.name, payload: message }) };
  }

  public createQuery<TMessage extends IQueryBase>(message: TMessage): IQuery<TMessage> {
    return { json: JSON.stringify({ type: message.constructor.name, payload: message }) };
  }

  public createNotification<TMessage extends INotificationBase>(message: TMessage): INotification<TMessage> {
    return { json: JSON.stringify({ type: message.constructor.name, payload: message }) };
  }

  public createExpectedResult<TResult extends NonUndefined, TError extends NonUndefined>(): Result<TResult, TError> {
    return {} as Result<TResult, TError>;
  }
}