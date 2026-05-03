import { TagSyntaxMatchesTextSpecification } from "@monorepo/core-tag-syntax-abstract";
import { EquipmentOrValveTagSyntax } from "../syntax/EquipmentOrValveTagSyntax.js";

export class EquipmentOrValveTagSpecification
  extends TagSyntaxMatchesTextSpecification {
  public constructor() {
    super(new EquipmentOrValveTagSyntax());
  }
}