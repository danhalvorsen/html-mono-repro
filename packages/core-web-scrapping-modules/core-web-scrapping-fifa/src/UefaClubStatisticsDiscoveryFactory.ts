// packages/core-web-scrapping-fifa/src/UefaClubStatisticsDiscoveryFactory.ts
import { HttpClientBuilder } from "@monorepo/core-http-messages-http-client";
import { UefaClubStatisticsDiscovery } from "./UefaClubStatisticsDiscovery.js";

export class UefaClubStatisticsDiscoveryFactory {
  public create(): UefaClubStatisticsDiscovery {
    return new UefaClubStatisticsDiscovery(new HttpClientBuilder().build());
  }
}