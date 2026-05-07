import type { ICommand, IQuery } from "@monorepo/core-design-patterns-cqrs-no-json";
import { should } from "chai";
import { describe, it } from "vitest";
import { CommandDispatcher, QueryDispatcher } from "../src/cqrs/Dispatchers.js";
import type {
  ICommandMessageHandler,
  IQueryMessageHandler,
} from "../src/cqrs/MessageHandlers.js";
import {
  CommandMessageType,
  type CommandMessage,
  type GenerateTrainingImagesCommandMessage,
} from "../src/messages/CommandMessages.js";
import {
  QueryMessageType,
  type GetApiCatalogQueryMessage,
  type GetGenerationStatusQueryMessage,
  type ListSvgFilesQueryMessage,
  type QueryMessage,
} from "../src/messages/QueryMessages.js";
import { TestFixtures } from "./TestFixtures.js";

should();

class FakeCommandHandler
  implements ICommandMessageHandler<GenerateTrainingImagesCommandMessage>
{
  public handledMessages: GenerateTrainingImagesCommandMessage[] = [];

  public async Handle(
    command: ICommand<GenerateTrainingImagesCommandMessage>,
  ): Promise<unknown> {
    this.handledMessages.push(command.message);

    return {
      commandHandled: command.message.type,
    };
  }
}

class FakeListSvgFilesQueryHandler
  implements IQueryMessageHandler<ListSvgFilesQueryMessage>
{
  public handledMessages: ListSvgFilesQueryMessage[] = [];

  public async Handle(
    query: IQuery<ListSvgFilesQueryMessage>,
  ): Promise<unknown> {
    this.handledMessages.push(query.message);

    return [
      {
        category: "valves",
        itemName: "ball-valve",
      },
    ];
  }
}

class FakeStatusQueryHandler
  implements IQueryMessageHandler<GetGenerationStatusQueryMessage>
{
  public handledMessages: GetGenerationStatusQueryMessage[] = [];

  public async Handle(
    query: IQuery<GetGenerationStatusQueryMessage>,
  ): Promise<unknown> {
    this.handledMessages.push(query.message);

    return TestFixtures.createGenerationStatus();
  }
}

class FakeCatalogQueryHandler
  implements IQueryMessageHandler<GetApiCatalogQueryMessage>
{
  public handledMessages: GetApiCatalogQueryMessage[] = [];

  public async Handle(
    query: IQuery<GetApiCatalogQueryMessage>,
  ): Promise<unknown> {
    this.handledMessages.push(query.message);

    return {
      serviceName: "training-image-api",
    };
  }
}

describe("CommandDispatcher", () => {
  it("should dispatch GenerateTrainingImages command", async () => {
    const handler = new FakeCommandHandler();
    const dispatcher = new CommandDispatcher(handler);

    const message: GenerateTrainingImagesCommandMessage = {
      type: CommandMessageType.GenerateTrainingImages,
      selection: TestFixtures.createGenerationSelection(),
      config: TestFixtures.createGenerationConfig(),
    };

    const result = await dispatcher.dispatch(message);

    result.ok.should.equal(true);
    result.data.should.deep.equal({
      commandHandled: CommandMessageType.GenerateTrainingImages,
    });

    handler.handledMessages.length.should.equal(1);
    handler.handledMessages[0]!.selection.categoryItem.should.equal("valves.ball-valve");
  });

  it("should reject unsupported command message types", async () => {
    const dispatcher = new CommandDispatcher(new FakeCommandHandler());

    const result = await dispatcher.dispatch({
      type: "UnsupportedCommand",
    } as unknown as CommandMessage);

    result.ok.should.equal(false);
    result.error!.should.contain("Unsupported command type");
  });
});

describe("QueryDispatcher", () => {
  it("should dispatch ListSvgFiles query", async () => {
    const listHandler = new FakeListSvgFilesQueryHandler();
    const statusHandler = new FakeStatusQueryHandler();
    const catalogHandler = new FakeCatalogQueryHandler();

    const dispatcher = new QueryDispatcher(
      listHandler,
      statusHandler,
      catalogHandler,
    );

    const message: ListSvgFilesQueryMessage = {
      type: QueryMessageType.ListSvgFiles,
      sourceDirectory: "source",
    };

    const result = await dispatcher.dispatch(message);

    result.ok.should.equal(true);
    listHandler.handledMessages.length.should.equal(1);
    listHandler.handledMessages[0]!.sourceDirectory.should.equal("source");
  });

  it("should dispatch GetGenerationStatus query", async () => {
    const listHandler = new FakeListSvgFilesQueryHandler();
    const statusHandler = new FakeStatusQueryHandler();
    const catalogHandler = new FakeCatalogQueryHandler();

    const dispatcher = new QueryDispatcher(
      listHandler,
      statusHandler,
      catalogHandler,
    );

    const message: GetGenerationStatusQueryMessage = {
      type: QueryMessageType.GetGenerationStatus,
    };

    const result = await dispatcher.dispatch(message);

    result.ok.should.equal(true);
    result.data.should.deep.equal(TestFixtures.createGenerationStatus());
    statusHandler.handledMessages.length.should.equal(1);
  });

  it("should dispatch GetApiCatalog query", async () => {
    const listHandler = new FakeListSvgFilesQueryHandler();
    const statusHandler = new FakeStatusQueryHandler();
    const catalogHandler = new FakeCatalogQueryHandler();

    const dispatcher = new QueryDispatcher(
      listHandler,
      statusHandler,
      catalogHandler,
    );

    const message: GetApiCatalogQueryMessage = {
      type: QueryMessageType.GetApiCatalog,
    };

    const result = await dispatcher.dispatch(message);

    result.ok.should.equal(true);
    result.data.should.deep.equal({
      serviceName: "training-image-api",
    });
    catalogHandler.handledMessages.length.should.equal(1);
  });

  it("should reject unsupported query message types", async () => {
    const dispatcher = new QueryDispatcher(
      new FakeListSvgFilesQueryHandler(),
      new FakeStatusQueryHandler(),
      new FakeCatalogQueryHandler(),
    );

    const result = await dispatcher.dispatch({
      type: "UnsupportedQuery",
    } as unknown as QueryMessage);

    result.ok.should.equal(false);
    result.error!.should.contain("Unsupported query type");
  });
});