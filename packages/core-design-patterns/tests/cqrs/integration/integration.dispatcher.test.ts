// tests/integration.dispatcher.test.ts

import { CommandHandler } from 'core-design-patterns/src/command-query/ICommandHandler.js';
import { QueryHandler } from 'core-design-patterns/src/command-query/IQueryHandler.js';
import { ICommand, Ok, IQuery, CommandDispatcher, QueryDispatcher } from 'core-design-patterns/src/index.js';
import { describe, it, expect } from 'vitest';

// =======================
// FooCommand
// =======================
class FooCommand implements ICommand<string> {
  readonly name = 'Foo';
  constructor(public readonly payload: string) {}
}

// =======================
// FooCommandHandler
// =======================
class FooCommandHandler
  extends CommandHandler<FooCommand, string, string> {

  handle(command: FooCommand) {
    return Promise.resolve(
      Ok(`FooCommand handled: ${command.payload}`)
    );
  }
}

// =======================
// BlaQuery
// =======================
class BlaQuery implements IQuery<string> {
  readonly name = 'Bla';
  constructor(public readonly payload: string) {}
}

// =======================
// BlaQueryHandler
// =======================
class BlaQueryHandler
  extends QueryHandler<BlaQuery, string, string> {

  handle(query: BlaQuery) {
    return Promise.resolve(
      Ok(`BlaQuery handled: ${query.payload}`)
    );
  }
}

// =======================
// Integration Tests
// =======================
describe('Integration: CommandDispatcher + QueryDispatcher', () => {

  it('executes command and query end-to-end', async () => {
    const commandDispatcher = new CommandDispatcher([
      new FooCommandHandler()
    ]);

    const queryDispatcher = new QueryDispatcher([
      new BlaQueryHandler()
    ]);

    const commandResult = await commandDispatcher.dispatch(
      new FooCommand('hello-command')
    );

    expect(commandResult.isOk()).toBe(true);
    expect(commandResult.unwrap()).toBe(
      'FooCommand handled: hello-command'
    );

    const queryResult = await queryDispatcher.dispatch(
      new BlaQuery('hello-query')
    );

    expect(queryResult.isOk()).toBe(true);
    expect(queryResult.unwrap()).toBe(
      'BlaQuery handled: hello-query'
    );
  });

});
