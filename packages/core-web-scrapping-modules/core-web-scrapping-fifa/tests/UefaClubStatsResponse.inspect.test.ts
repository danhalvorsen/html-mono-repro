// tests/UefaClubStatsResponse.inspect.test.ts
import { describe, it, expect } from "vitest";
import * as cheerio from "cheerio";
import { pipe, filter, map, unique, take } from "remeda";

import { HttpClientBuilder } from "@monorepo/core-http-messages-http-client";
import {
  HeaderName,
  HeadersBuilder,
  HttpRequestMessageBuilder,
} from "@monorepo/core-http-messages";

interface DataSourceCandidate {
  readonly kind: "url" | "json-script";
  readonly value: string;
}

describe("integration: inspect UEFA Champions League club stats response", () => {
  it("should inspect the HTML response for data/API candidates", async () => {
    const client = new HttpClientBuilder().build();

    const request = new HttpRequestMessageBuilder()
      .withMethod("GET")
      .withPath("https://www.uefa.com/uefachampionsleague/statistics/clubs/")
      .withHeaders(
        new HeadersBuilder()
          .with(HeaderName.custom("user-agent"), "Mozilla/5.0")
          .build(),
      )
      .build();

    const res = await client.send(request);

    expect(res.statusCode).toBe(200);
    expect(typeof res.body).toBe("string");

    const html = res.body as string;
    // Async-safe console.log of the body (first 500 chars for brevity)
    await new Promise<void>(resolve => {
      setTimeout(() => {
        console.log("Body:", html.slice(0, 500));
        resolve();
      }, 0);
    });

    // Assert that 'Paris' is present in the response body
    expect(html).toContain("Paris");

    const candidates = findDataSourceCandidates(html);
    console.table(candidates);
    expect(candidates.length).toBeGreaterThan(0);
  });
});

function findDataSourceCandidates(html: string): readonly DataSourceCandidate[] {
  const $ = cheerio.load(html);

  const scriptJsonCandidates = $("script[type='application/json']")
    .toArray()
    .map((x): DataSourceCandidate => ({
      kind: "json-script",
      value: $(x).html()?.trim() ?? "",
    }))
    .filter((x) => x.value.length > 0);

  const scriptText = $("script")
    .toArray()
    .map((x) => $(x).html() ?? "")
    .join("\n");

  const urlCandidates = pipe(
    extractUrls(scriptText + "\n" + html),
    filter((x) =>
      /api|stats|statistics|club|competition|standings|teams/i.test(x),
    ),
    unique(),
    take(50),
    map((x): DataSourceCandidate => ({
      kind: "url",
      value: x,
    })),
  );

  return [...urlCandidates, ...scriptJsonCandidates];
}

function extractUrls(text: string): readonly string[] {
  const absoluteUrls = text.match(/https?:\/\/[^"'\\\s<>]+/g) ?? [];
  const relativeUrls = text.match(/\/[^"'\\\s<>]*(?:api|stats|statistics|clubs|teams)[^"'\\\s<>]*/gi) ?? [];

  return [...absoluteUrls, ...relativeUrls];
}