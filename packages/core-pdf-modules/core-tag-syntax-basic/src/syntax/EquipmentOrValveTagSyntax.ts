import { RegexTagSyntaxBase } from "@monorepo/core-tag-syntax-abstract";
import { BasicTagSyntaxIds } from "./BasicTagSyntaxIds.js";
import {
  BasicEquipmentOrValveClassCodes,
  createAlternationPattern,
} from "./BasicTagCodeCatalog.js";

export type EquipmentOrValveTagGroup =
  | "system"
  | "classCode"
  | "sequence"
  | "suffix";

export class EquipmentOrValveTagSyntax
  extends RegexTagSyntaxBase<EquipmentOrValveTagGroup> {
  public constructor() {
    const classCodePattern = createAlternationPattern(BasicEquipmentOrValveClassCodes);

    super({
      syntaxId: BasicTagSyntaxIds.EquipmentOrValve,
      pattern: new RegExp(
        `^(?<system>\\d{1,3})-(?<classCode>${classCodePattern})-(?<sequence>\\d{1,6})(?<suffix>[A-Z]?)$`,
        "u",
      ),
    });
  }
}