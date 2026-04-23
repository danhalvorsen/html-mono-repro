import { IAggregateRuleMessageModel } from "@monorepo/core-specifications-rules";
import { StrictAdsrEnvelope } from "./code.js";


export interface IStrictAdsrRuleMessageModel
    extends IAggregateRuleMessageModel<StrictAdsrEnvelope> {
}
