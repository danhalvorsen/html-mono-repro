// sample/dispatcher.test.ts

import { describe, it, expect } from 'vitest';

import { CommandDispatcher } from 'core-design-patterns/src/command-query/Dispatcher/CommandDispatcher.js';
import { QueryDispatcher } from 'core-design-patterns/src/command-query/Dispatcher/QueryDispatcher.js';
import { FooCommandHandler, FooCommand, BlaQueryHandler, BlaQuery } from 'core-design-patterns/src/sample/code.js';

describe('Dispatcher integration (fixtures)', () => {

  it('dispatches FooCommand', async () => {
    const dispatcher = new CommandDispatcher([
      new FooCommandHandler()
    ]);

    const result = await dispatcher.dispatch(
      new FooCommand('hello')
    );

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe('cmd:hello');
  });

  it('dispatches BlaQuery', async () => {
    const dispatcher = new QueryDispatcher([
      new BlaQueryHandler()
    ]);

    const result = await dispatcher.dispatch(
      new BlaQuery('world')
    );

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe('qry:world');
  });

});
