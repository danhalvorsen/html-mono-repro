// packages/core-design-patterns/tests/CQRS/messages/FooMessages.ts
import type { ICommandBase, IQueryBase, NotificationBase } from "../../../src/CQRS/cqrsCode.js";

export class FooCommand implements ICommandBase {
  public constructor(public readonly value: number) {}
}

export class FooQuery implements IQueryBase {
  public constructor(public readonly id: string) {}
}

export class FooNotification implements NotificationBase {
  public constructor(public readonly message: string) {}
}