import { HeaderName } from "@monorepo/core-http-messages";
import { should } from "chai";
import { describe, it } from "vitest";
import { HttpRequestMessageFactory } from "../src/client/HttpRequestMessageFactory.js";

should();

describe("HttpRequestMessageFactory", () => {
  it("should create a JSON POST request message", () => {
    const request = new HttpRequestMessageFactory().createJsonPost(
      "http://localhost:3000/api/command",
      { type: "AnyCommand" },
      undefined,
    );

    request.method.should.equal("POST");
    request.path.should.equal("http://localhost:3000/api/command");
    request.body.should.deep.equal({ type: "AnyCommand" });
    request.headers.get(HeaderName.ContentType).should.equal("application/json");
    request.headers.get(HeaderName.Accept).should.equal("application/json");
  });

  it("should add bearer authorization when token is configured", () => {
    const request = new HttpRequestMessageFactory().createJsonPost(
      "http://localhost:3000/api/query",
      { type: "AnyQuery" },
      "token-123",
    );

    request.headers.get(HeaderName.Authorization).should.equal("Bearer token-123");
  });
});