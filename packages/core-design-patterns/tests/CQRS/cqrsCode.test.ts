// packages/core-design-patterns/tests/CQRS/code.test.ts
import { describe, it, expect } from "vitest";

import type { Result } from "../../src/functional/result/result.js";
import type { IPayload, ICommand, IQuery, INotification } from "../../src/CQRS/cqrsCode.js";
import { CommandHandler, QueryHandler, NotificationHandler } from "../../src/CQRS/cqrsCode.js";

describe("CQRS contracts", () => {
  it("exports handler base classes at runtime", () => {
    expect(typeof CommandHandler).toBe("function");
    expect(typeof QueryHandler).toBe("function");
    expect(typeof NotificationHandler).toBe("function");
  });

  it("command handler can be implemented and invoked", async () => {
    type FooPayload = IPayload & { readonly value: number };

    class FooCommand implements ICommand<FooPayload> {
      public readonly name = "FooCommand";
      public constructor(public readonly payload: FooPayload) {}
    }

    const expected = {} as unknown as Result<number, string>;

    class FooCommandHandler extends CommandHandler<FooCommand, number, string> {
      public async handle(_command: FooCommand): Promise<Result<number, string>> {
        return expected;
      }
    }

    const handler = new FooCommandHandler();
    const actual = await handler.handle(new FooCommand({ value: 1 } as FooPayload));

    expect(actual).toBe(expected);
  });

  it("query handler can be implemented and invoked", async () => {
    type FooPayload = IPayload & { readonly id: string };

    class FooQuery implements IQuery<FooPayload> {
      public readonly name = "FooQuery";
      public constructor(public readonly payload: FooPayload) {}
    }

    type FooQueryResult = { id: string; value: number };
    const expected = {} as unknown as Result<FooQueryResult, string>;

    class FooQueryHandler extends QueryHandler<FooQuery, FooQueryResult, string> {
      public async handle(_query: FooQuery): Promise<Result<FooQueryResult, string>> {
        return expected;
      }
    }

    const handler = new FooQueryHandler();
    const actual = await handler.handle(new FooQuery({ id: "a" } as FooPayload));

    expect(actual).toBe(expected);
  });

  it("notification handler can be implemented and invoked", async () => {
    type FooPayload = IPayload & { readonly message: string };

    class FooNotification implements INotification<FooPayload> {
      public readonly name = "FooNotification";
      public constructor(public readonly payload: FooPayload) {}
    }

    class FooNotificationHandler extends NotificationHandler<FooNotification> {
      public async handle(_notification: FooNotification): Promise<void> {}
    }

    const handler = new FooNotificationHandler();
    await handler.handle(new FooNotification({ message: "x" } as FooPayload));

    expect(true).toBe(true);
  });
});