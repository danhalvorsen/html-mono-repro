// packages/core-ioc/core-ioc-inversify-sample-dispatcher/src/ctorSample.ts

import { Injectable, } from "@monorepo/core-ioc-inversify"; import { ServiceCollection, } from "@monorepo/core-ioc-inversify/new";
import { BlaQuery, BlaQueryHandler, FooCommand, FooCommandHandler, } from "@monorepo/core-ioc-inversify-sample-objects";

@Injectable()
class Program {
  public constructor(
    private readonly fooHandler: FooCommandHandler,
    private readonly blaHandler: BlaQueryHandler,
  ) {}

  public async Main(): Promise<void> {
    const foo = await this.fooHandler.Handle(new FooCommand(41));
    const bla = await this.blaHandler.Handle(new BlaQuery("bla"));

    console.log({
      foo,
      bla,
    });
  }
}

const services = new ServiceCollection();

services.AddTransient(FooCommandHandler);
services.AddTransient(BlaQueryHandler);
services.AddTransient(Program);

const program = services
  .BuildServiceProvider()
  .GetRequiredService(Program);

await program.Main();