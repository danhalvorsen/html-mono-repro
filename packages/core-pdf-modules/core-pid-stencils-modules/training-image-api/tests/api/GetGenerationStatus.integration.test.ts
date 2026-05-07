import request from "supertest";
import { should } from "chai";
import { describe, it } from "vitest";
import {
  type ApiEnvelope,
  ExpressApiTestFixture,
  type GenerationStatusResponse,
} from "./ExpressApiTestFixture.js";

should();

describe("API query: GetGenerationStatus", () => {
  it("should return generation status from POST /api/query", async () => {
    const fixture = new ExpressApiTestFixture();

    const response = await request(fixture.createApp())
      .post("/api/query")
      .send({
        type: "GetGenerationStatus",
      })
      .expect(200);

    const envelope = response.body as ApiEnvelope<GenerationStatusResponse>;

    envelope.ok.should.equal(true);
    envelope.data!.state.should.equal("idle");
    envelope.data!.sourceFiles.should.equal(0);
    envelope.data!.generatedFiles.should.equal(0);
    envelope.data!.errors.length.should.equal(0);
  });
});