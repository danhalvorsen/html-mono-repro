import { describe, expect, it } from 'vitest';
import { FooCommand } from '../../src/commandHandling/FooCommand.js';

describe('FooCommand', () => {
  it('creates canonical message payload', () => {
    const command = new FooCommand(7);

    expect(command.value).toBe(7);
    expect(command.message).toEqual({
      value: 7,
      message: 'Foo:7',
      handlerName: 'FooCommandHandler',
    });
  });

  it('freezes message payload', () => {
    const command = new FooCommand(1);

    expect(Object.isFrozen(command.message)).toBe(true);
  });
});
