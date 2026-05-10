import { Query } from "@monorepo/core-design-patterns-cqrs-no-json";
import { should } from "chai";
import { describe, it } from "vitest";
import { StaticApiCatalogProvider } from "../src/application/ApiCatalogProvider.js";
import { ApiMessageKind, type ApiCatalog } from "../src/domain/ApiCatalog.js";
import { GetApiCatalogQueryHandler } from "../src/cqrs/Handlers.js";
import {
  QueryMessageType,
  type GetApiCatalogQueryMessage,
} from "../src/messages/QueryMessages.js";

should();

describe("GetApiCatalogQueryHandler", () => {
  it("should return supported commands and queries with examples", async () => {
    const handler = new GetApiCatalogQueryHandler(
      new StaticApiCatalogProvider(),
    );

    const message: GetApiCatalogQueryMessage = {
      type: QueryMessageType.GetApiCatalog,
    };

    const result = await handler.Handle(new Query(message));
    const catalog = result as ApiCatalog;

    catalog.serviceName.should.equal("training-image-api");
    catalog.commands.some((command) =>
      command.type === "GenerateTrainingImages" &&
      command.kind === ApiMessageKind.Command,
    ).should.equal(true);

    catalog.queries.some((query) =>
      query.type === "ListSvgFiles" &&
      query.kind === ApiMessageKind.Query,
    ).should.equal(true);

    catalog.queries.some((query) =>
      query.type === "GetApiCatalog" &&
      query.endpoint === "/api/query",
    ).should.equal(true);
  });
});