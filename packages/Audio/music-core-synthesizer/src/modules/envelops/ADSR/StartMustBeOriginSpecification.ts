import { Specification } from "@monorepo/core-specifications";
import { StrictAdsrEnvelope } from "./code.js";


export class StartMustBeOriginSpecification extends Specification<StrictAdsrEnvelope> {
    public override isSatisfiedBy(candidate: StrictAdsrEnvelope): boolean {
        return candidate.start.x === 0 && candidate.start.y === 0;
    }
}
