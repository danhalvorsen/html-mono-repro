// =======================
// sample/index.ts
// =======================

// ---------- framework imports ----------
import { Result, Ok, NonUndefined } from '../functional/result/result.js';
import { ICommand } from '../command-query/ICommand.js';
import { IQuery } from '../command-query/IQuery.js';
import { CommandHandler } from '../command-query/ICommandHandler.js';
import { QueryHandler } from '../command-query/IQueryHandler.js';
import { CommandDispatcher } from '../command-query/Dispatcher/CommandDispatcher.js';
import { QueryDispatcher } from '../command-query/Dispatcher/QueryDispatcher.js';

// =======================
// FooCommand
// =======================
export class FooCommand implements ICommand<string> {
  readonly name = 'Foo';

  constructor(
    public readonly payload: string
  ) {}
}

// =======================
// FooCommandHandler
// =======================
export class FooCommandHandler
  extends CommandHandler<FooCommand, string, string> {

  handle(command: FooCommand): Promise<Result<string, string>> {
    return Promise.resolve(
      Ok(`FooCommand handled: ${command.payload}`)
    );
  }
}

// =======================
// BlaQuery
// =======================
export class BlaQuery implements IQuery<string> {
  readonly name = 'Bla';

  constructor(
    public readonly payload: string
  ) {}
}

// =======================
// BlaQueryHandler
// =======================
export class BlaQueryHandler
  extends QueryHandler<BlaQuery, string, string> {

  handle(query: BlaQuery): Promise<Result<string, string>> {
    return Promise.resolve(
      Ok(`BlaQuery handled: ${query.payload}`)
    );
  }
}

// =======================
// Bootstrap
// =======================
const commandDispatcher = new CommandDispatcher([
  new FooCommandHandler()
]);

const queryDispatcher = new QueryDispatcher([
  new BlaQueryHandler()
]);

await commandDispatcher.dispatch(
  new FooCommand('hello-command')
);

const result = await queryDispatcher.dispatch(
  new BlaQuery('hello-query')
);

result.match({
  ok: v => console.log(v),
  err: e => console.error(e)
});
