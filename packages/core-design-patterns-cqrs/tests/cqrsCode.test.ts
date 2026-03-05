// packages/core-design-patterns/tests/CQRS/code.test.ts
import { NonUndefined, Result } from '@monorepo/core-design-patterns';
import {
  CommandHandler,
  QueryHandler,
  NotificationHandler,
  type ICommand,
  type IQuery,
  type INotification
} from '../src/index.js'
import { CqrsContractFixture } from './fixtures/CqrsContractFixture.js';

import { describe, it, expect } from "vitest";
import { FooCommand, FooNotification, FooQuery } from './messages/FooMessages.js';

describe("CQRS contracts", () => {
  const fx = new CqrsContractFixture();

  it("exports handler base classes at runtime", () => {
    expect(typeof CommandHandler).toBe("function");
    expect(typeof QueryHandler).toBe("function");
    expect(typeof NotificationHandler).toBe("function");
  });

  it("command handler can be implemented and invoked", async () => {
    const command = fx.createCommand(new FooCommand(1));
    const expected = fx.createExpectedResult<number, string>();

    class FooCommandHandler extends CommandHandler<FooCommand, number, string> {
      public Handle(command: ICommand<FooCommand>): Promise<Result<number, string>> {
        throw new Error("Method not implemented.");
      }
      public async handle(_command: ICommand<FooCommand>): Promise<Result<number, string>> {
        return expected;
      }
    }

    const handler = new FooCommandHandler();
    const actual = await handler.handle(command);

    expect(actual).toBe(expected);
  });

  it("query handler can be implemented and invoked", async () => {
    const query = fx.createQuery(new FooQuery("a"));
    const expected = fx.createExpectedResult<({ id: string; value: number } & NonUndefined), string>();

    class FooQueryHandler extends QueryHandler<FooQuery, ({ id: string; value: number } & NonUndefined), string> {
      public async handle(_query: IQuery<FooQuery>): Promise<Result<({ id: string; value: number } & NonUndefined), string>> {
        return expected;
      }
    }

    const handler = new FooQueryHandler();
    const actual = await handler.handle(query);

    expect(actual).toBe(expected);
  });

  it("notification handler can be implemented and invoked", async () => {
    const notification = fx.createNotification(new FooNotification("x"));

    class FooNotificationHandler extends NotificationHandler<FooNotification> {
      public Handle(notification: INotification<FooNotification>): void | Promise<void> {
        throw new Error('Method not implemented.');
      }
      public async handle(_notification: INotification<FooNotification>): Promise<void> {}
    }

    const handler = new FooNotificationHandler();
    await expect(handler.handle(notification)).resolves.toBeUndefined();
  });
});