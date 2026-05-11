import { describe, expect, it } from 'vitest';
import { FooCommand, FooCommandHandler } from '../../src/commandHandling/index.js';

describe('FooCommandHandler', () => {
  it('increments value and returns canonical result payload', async () => {
    const handler = new FooCommandHandler();
    const command = new FooCommand(41);

    expect(command.message).toEqual({
      value: 41,
      message: 'Foo:41',
      handlerName: 'FooCommandHandler',
    });

    const result = await handler.Handle(command);

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual({
      value: 42,
      message: 'Foo:41',
      handlerName: 'FooCommandHandler',
    });
  });
});
