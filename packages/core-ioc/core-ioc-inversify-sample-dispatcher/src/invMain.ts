import "reflect-metadata";
import { Container } from "inversify";

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
    const container = new Container({
      defaultScope: "Transient",
      autoBindInjectable: false,
    });

    container
      .bind(FooCommandHandlerContract)
      .toDynamicValue(() => new FooCommandHandler());

    container
      .bind(BlaQueryHandlerContract)
      .toDynamicValue(() => new BlaQueryHandler());

    const fooHandler = container.get<FooCommandHandlerContract>(FooCommandHandlerContract);
    const blaHandler = container.get<BlaQueryHandlerContract>(BlaQueryHandlerContract);

    const foo = await fooHandler.Handle(new FooCommand(41));
    const bla = await blaHandler.Handle(new BlaQuery("bla"));

    console.log({
      foo,
      bla,
    });
  }
}

await new Program().Main();
