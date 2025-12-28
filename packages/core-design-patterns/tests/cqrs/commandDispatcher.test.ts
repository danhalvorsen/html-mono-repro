// tests/CommandDispatcher.test.ts

import { describe, it, expect } from 'vitest';

import { CommandDispatcher } from '../../src/command-query/Dispatcher/CommandDispatcher.js';
import { FooCommandHandler, FooCommand } from 'core-design-patterns/src/sample/code.js';
 
describe('CommandDispatcher (fixtures)', () => {

  it('dispatches FooCommand using shared fixtures', async () => {
    const dispatcher = new CommandDispatcher([
      new FooCommandHandler()
    ]);

    const result = await dispatcher.dispatch(
      new FooCommand('hello')
    );

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe('cmd:hello');
  });

  it('throws when handler is missing', async () => {
    const dispatcher = new CommandDispatcher([]);

    await expect(
      dispatcher.dispatch(new FooCommand('fail'))
    ).rejects.toThrow(/No handler found/);
  });

});
