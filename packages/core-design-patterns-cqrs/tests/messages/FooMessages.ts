export class FooCommand {
  constructor(public readonly value: string = "foo-command") {}
}

export class FooNotification {
  constructor(public readonly value: string = "foo-notification") {}
}

export class FooQuery {
  constructor(public readonly value: string = "foo-query") {}
}