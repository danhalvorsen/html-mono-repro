// packages/core-web-scrapping-fifa/src/UefaClubStatisticsDiscovery.ts
import { filter, map, pipe, take, unique } from "remeda";

import {
  HeaderName,
  HeadersBuilder,
  HttpRequestMessageBuilder,
  type IHttpRequestMessage,
  type IHttpResponseMessage,
} from "@monorepo/core-http-messages";

import type { IHttpClient } from "@monorepo/core-http-messages-http-client";

export interface UefaClubStatisticsDiscoveryResult {
  readonly pageUrl: string;
  readonly statusCode: number;
  readonly serviceBaseUrls: readonly string[];
  readonly routeCandidates: readonly string[];
  readonly configurationCandidates: readonly string[];
}

export class UefaClubStatisticsDiscovery {
  private static readonly PageUrl =
    "https://www.uefa.com/uefachampionsleague/statistics/clubs/";

  public constructor(private readonly httpClient: IHttpClient) {}

  public async discover(): Promise<UefaClubStatisticsDiscoveryResult> {
    const response = await this.httpClient.send(this.createRequest());
    const html = this.readHtml(response);

    return {
      pageUrl: UefaClubStatisticsDiscovery.PageUrl,
      statusCode: response.statusCode,
      serviceBaseUrls: this.findServiceBaseUrls(html),
      routeCandidates: this.findRouteCandidates(html),
      configurationCandidates: this.findConfigurationCandidates(html),
    };
  }

  private createRequest(): IHttpRequestMessage {
    return new HttpRequestMessageBuilder()
      .withMethod("GET")
      .withPath(UefaClubStatisticsDiscovery.PageUrl)
      .withHeaders(
        new HeadersBuilder()
          .with(HeaderName.Accept, "text/html,application/xhtml+xml")
          .build(),
      )
      .build();
  }

  private readHtml(response: IHttpResponseMessage): string {
    if (response.statusCode !== 200) {
      throw new Error(`UEFA page request failed. Status code: ${response.statusCode}.`);
    }

    if (typeof response.body !== "string") {
      throw new Error("UEFA page response body was not HTML text.");
    }

    return response.body;
  }

  private findServiceBaseUrls(html: string): readonly string[] {
    return pipe(
      this.extractTextMatches(html, /https:\/\/[a-z0-9.-]+\.uefa\.com\/?/giu),
      map((x) => this.decodeHtml(x)),
      filter((x) =>
        x.includes("compstats.uefa.com") ||
        x.includes("matchstats.uefa.com") ||
        x.includes("standings.uefa.com") ||
        x.includes("editorial.uefa.com"),
      ),
      unique(),
      take(25),
    );
  }

  private findRouteCandidates(html: string): readonly string[] {
    return pipe(
      this.extractTextMatches(
        html,
        /\/[a-z0-9/_-]*(?:api|stats|statistics|tournament|teams|clubs)[a-z0-9/_-]*\/?/giu,
      ),
      map((x) => this.decodeHtml(x)),
      filter((x) =>
        x.includes("api") ||
        x.includes("stats") ||
        x.includes("statistics") ||
        x.includes("tournament") ||
        x.includes("teams") ||
        x.includes("clubs"),
      ),
      unique(),
      take(100),
    );
  }

  private findConfigurationCandidates(html: string): readonly string[] {
    const keywords = [
      "defaultFilters",
      "pageSize",
      "phase",
      "TOURNAMENT",
      "statistics/clubs",
      "stats/tournament/teams",
      "compstats",
      "api/v1",
    ] as const;

    return pipe(
      keywords.flatMap((keyword) => this.extractKeywordContexts(html, keyword, 350)),
      map((x) => this.decodeHtml(x)),
      unique(),
      take(100),
    );
  }

  private extractKeywordContexts(
    text: string,
    keyword: string,
    radius: number,
  ): readonly string[] {
    const contexts: string[] = [];
    let index = text.indexOf(keyword);

    while (index >= 0) {
      contexts.push(
        text.slice(
          Math.max(0, index - radius),
          Math.min(text.length, index + keyword.length + radius),
        ),
      );

      index = text.indexOf(keyword, index + keyword.length);
    }

    return contexts;
  }

  private extractTextMatches(text: string, pattern: RegExp): readonly string[] {
    return [...text.matchAll(pattern)].map((match) => match[0]);
  }

  private decodeHtml(value: string): string {
    return value
      .replaceAll("&quot;", '"')
      .replaceAll("&amp;", "&")
      .replaceAll("&#x2F;", "/")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">");
  }
}