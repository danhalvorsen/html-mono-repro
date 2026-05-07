import request from "supertest";
import { should } from "chai";
import { describe, it } from "vitest";
import {
  type ApiCatalogResponse,
  type ApiEnvelope,
  ExpressApiTestFixture,
} from "./ExpressApiTestFixture.js";

should();

describe("API query: GetApiCatalog", () => {
  it("should return supported commands and queries from POST /api/query", async () => {
    const fixture = new ExpressApiTestFixture();
    const app = fixture.createApp();

    const response = await request(app)
      .post("/api/query")
      .send({
        type: "GetApiCatalog",
      })
      .expect(200);

    const envelope = response.body as ApiEnvelope<ApiCatalogResponse>;

    envelope.ok.should.equal(true);
    envelope.data!.serviceName.should.equal("training-image-api");

    envelope.data!.commands
      .some((command) => command.type === "GenerateTrainingImages")
      .should.equal(true);

    envelope.data!.queries
      .some((query) => query.type === "ListSvgFiles")
      .should.equal(true);

    envelope.data!.queries
      .some((query) => query.type === "GetGenerationStatus")
      .should.equal(true);

    envelope.data!.queries
      .some((query) => query.type === "GetApiCatalog")
      .should.equal(true);
  });
});