import { describe, it, expect } from "vitest";

import {
  HeaderName,
  type IHttpRequestMessage,
} from "@monorepo/core-http-messages";

import {
  JsonGetRequestMessageFactory,
  JsonPostRequestMessageFactory,
} from "../src/index.js";

interface TestBody {
  readonly value: string;
}

class TestJsonPostRequestMessageFactory extends JsonPostRequestMessageFactory<TestBody> {
  public constructor() {
    super("http://localhost:11434/api/generate");
  }
}

class TestJsonGetRequestMessageFactory extends JsonGetRequestMessageFactory {
  public constructor() {
    super("http://localhost:11434/api/tags");
  }
}

class Fixture {
  public createPostFactory(): TestJsonPostRequestMessageFactory {
    return new TestJsonPostRequestMessageFactory();
  }

  public createGetFactory(): TestJsonGetRequestMessageFactory {
    return new TestJsonGetRequestMessageFactory();
  }

  public createBody(): TestBody {
    return Object.freeze({
      value: "test",
    });
  }
}

describe("core-http-message-factories", () => {
  it("should create JSON POST request message", () => {
    const fixture = new Fixture();

    const request: IHttpRequestMessage = fixture
      .createPostFactory()
      .create(fixture.createBody());

    expect(request.method).toBe("POST");
    expect(request.path).toBe("http://localhost:11434/api/generate");

    const contentType = request.headers.get(HeaderName.ContentType);
    expect(contentType).toBeDefined();
    expect(contentType).toBe("application/json");

    const accept = request.headers.get(HeaderName.Accept);
    expect(accept).toBeDefined();
    expect(accept).toBe("application/json");

    expect(request.body).toBeDefined();
    expect(request.body).toEqual({ value: "test" });
  });

  it("should create JSON GET request message without body", () => {
    const fixture = new Fixture();

    const request: IHttpRequestMessage = fixture
      .createGetFactory()
      .create();

    expect(request.method).toBe("GET");
    expect(request.path).toBe("http://localhost:11434/api/tags");

    const accept = request.headers.get(HeaderName.Accept);
    expect(accept).toBeDefined();
    expect(accept).toBe("application/json");

    expect(request.headers.get(HeaderName.ContentType)).toBeUndefined();
    expect(request.body).toBeUndefined();
  });
});