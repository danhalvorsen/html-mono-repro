// packages/core-web-scrapping-modules/core-web-scrapping-abstract/tests/fetch-lyse-html-body.integration.test.ts

import { describe, expect, it } from "vitest";

import {
  HeaderName,
  HeadersBuilder,
  HttpRequestMessageBuilder,
} from "@monorepo/core-http-messages";

import { HttpClientBuilder } from "@monorepo/core-http-messages-http-client";

const LyseStrompriserUrl = "https://www.lyse.no/strom/strompriser";

describe("integration: fetch Lyse HTML body", () => {
  it("should fetch the Lyse strømpriser HTML body through core-http-messages-http-client", async () => {
    const client = new HttpClientBuilder().build();

    const request = new HttpRequestMessageBuilder()
      .withMethod("GET")
      .withPath(LyseStrompriserUrl)
      .withHeaders(
        new HeadersBuilder()
          .with(HeaderName.Accept, "text/html,application/xhtml+xml,text/plain")
          .build(),
      )
      .build();

    const response = await client.send(request);

    expect(response.statusCode).toBe(200);
    expect(typeof response.body).toBe("string");

    const html = response.body as string;

    expect(html.length).toBeGreaterThan(1_000);
    expect(html.toLowerCase()).toContain("strømpris");

    console.log({
      statusCode: response.statusCode,
      bodyLength: html.length,
      preview: html.slice(0, 1_000),
    });
  });
});