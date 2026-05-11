import {
  ServiceCollection,
} from "@monorepo/core-ioc-inversify/new";

import {
  BlaQuery,
  BlaQueryHandler,
  BlaQueryHandlerContract,
  FooCommand,
  FooCommandHandler,
  FooCommandHandlerContract,
} from "@monorepo/core-ioc-inversify-sample-objects";

class Program {
  public async Main(): Promise<void> {
    const services = new ServiceCollection();

    services.AddTransient(
      FooCommandHandlerContract,
      FooCommandHandler,
    );

    services.AddTransient(
      BlaQueryHandlerContract,
      BlaQueryHandler,
    );

    const provider = services.BuildServiceProvider();

    const fooHandler = provider.GetRequiredService(FooCommandHandlerContract);
    const blaHandler = provider.GetRequiredService(BlaQueryHandlerContract);

    const foo = await fooHandler.Handle(new FooCommand(41));
    const bla = await blaHandler.Handle(new BlaQuery("bla"));

    console.log({
      foo,
      bla,
    });
  }
}

await new Program().Main();
