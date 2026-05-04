import { RegexTagSyntaxBase } from "@monorepo/core-tag-syntax-abstract";
import { BasicTagSyntaxIds } from "./BasicTagSyntaxIds.js";
import {
  BasicInstrumentFunctionCodes,
  createAlternationPattern,
} from "./BasicTagCodeCatalog.js";

export type InstrumentTagGroup =
  | "system"
  | "functionCode"
  | "loopNumber"
  | "suffix";

export class InstrumentTagSyntax extends RegexTagSyntaxBase<InstrumentTagGroup> {
  public constructor() {
    const functionCodePattern = createAlternationPattern(BasicInstrumentFunctionCodes);

    super({
      syntaxId: BasicTagSyntaxIds.Instrument,
      pattern: new RegExp(
        `^(?<system>\\d{1,3})-(?<functionCode>${functionCodePattern})-(?<loopNumber>\\d{1,6})(?<suffix>[A-Z]?)$`,
        "u",
      ),
    });
  }
}