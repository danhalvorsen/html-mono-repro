import {
  CreateDefaultContainerBuilder,
} from "@monorepo/core-ioc-inversify/new";
import {
  BlaQuery,
  BlaQueryHandler,
  BlaQueryHandlerContract,
  FooCommand,
  FooCommandHandler,
  FooCommandHandlerContract,
} from "@monorepo/core-ioc-inversify-sample-objects";
import { CommandHandlerRegistry } from "./CommandHandlerRegistry.js";
import { IocCqrsServiceProvider } from "./IocCqrsServiceProvider.js";
import { QueryHandlerRegistry } from "./QueryHandlerRegistry.js";

export function CreateSampleIocCqrsServiceProvider(): IocCqrsServiceProvider {
  const builder = CreateDefaultContainerBuilder();

  const commandHandlerRegistry = new CommandHandlerRegistry([
    {
      CommandType: FooCommand,
      HandlerType: FooCommandHandlerContract,
    },
  ]);

  const queryHandlerRegistry = new QueryHandlerRegistry([
    {
      QueryType: BlaQuery,
      HandlerType: BlaQueryHandlerContract,
    },
  ]);

  builder.Services.AddSingletonInstance(
    CommandHandlerRegistry,
    commandHandlerRegistry,
  );

  builder.Services.AddSingletonInstance(
    QueryHandlerRegistry,
    queryHandlerRegistry,
  );

  builder.Services.AddTransient(
    FooCommandHandlerContract,
    FooCommandHandler,
  );

  builder.Services.AddTransient(
    BlaQueryHandlerContract,
    BlaQueryHandler,
  );

  const provider = builder.Services.BuildServiceProvider();

  return new IocCqrsServiceProvider(
    provider,
    provider.GetRequiredService(CommandHandlerRegistry),
    provider.GetRequiredService(QueryHandlerRegistry),
  );
}