import "reflect-metadata";
import { Container, inject, injectable } from "inversify";
import {
  BlaQuery,
  BlaQueryHandler,
  FooCommand,
  FooCommandHandler,
} from "@monorepo/core-ioc-inversify-sample-objects";

@injectable()
class Program {
  public constructor(
    @inject(FooCommandHandler)
    private readonly fooHandler: FooCommandHandler,
    @inject(BlaQueryHandler)
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

const container = new Container({
  defaultScope: "Transient",
  autoBindInjectable: false,
});

container.bind(FooCommandHandler).toDynamicValue(() => new FooCommandHandler());
container.bind(BlaQueryHandler).toDynamicValue(() => new BlaQueryHandler());
container.bind(Program).toSelf();

const program = container.get(Program);

await program.Main();
