import request from "supertest";
import { should } from "chai";
import { afterEach, beforeEach, describe, it } from "vitest";
import {
  type ApiEnvelope,
  ExpressApiTestFixture,
  type ListedSvgFileResponse,
} from "./ExpressApiTestFixture.js";

should();

describe("API query: ListSvgFiles", () => {
  let fixture: ExpressApiTestFixture;

  beforeEach(async () => {
    fixture = new ExpressApiTestFixture();
    await fixture.initialize();
  });

  afterEach(async () => {
    await fixture.dispose();
  });

  it("should list SVG source files from POST /api/query", async () => {
    await fixture.createSourceSvgFile();

    const response = await request(fixture.createApp())
      .post("/api/query")
      .send({
        type: "ListSvgFiles",
        sourceDirectory: fixture.sourceDirectory,
      })
      .expect(200);

    const envelope = response.body as ApiEnvelope<readonly ListedSvgFileResponse[]>;

    envelope.ok.should.equal(true);
    envelope.data!.length.should.equal(1);
    envelope.data![0]!.category.should.equal("valves");
    envelope.data![0]!.itemName.should.equal("ball-valve");
    envelope.data![0]!.fileName.should.equal("valves-ball-valve.svg");
  });

  it("should return 400 for unsupported query message type", async () => {
    const response = await request(fixture.createApp())
      .post("/api/query")
      .send({
        type: "UnknownQuery",
      })
      .expect(400);

    const envelope = response.body as ApiEnvelope<unknown>;

    envelope.ok.should.equal(false);
    envelope.error!.should.contain("Unsupported query type");
  });
});