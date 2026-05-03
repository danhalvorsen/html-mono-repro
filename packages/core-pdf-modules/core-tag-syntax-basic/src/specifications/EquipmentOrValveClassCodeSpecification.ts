import { TagSyntaxGroupEqualsSpecification } from "@monorepo/core-tag-syntax-abstract";
import { EquipmentOrValveTagSyntax } from "../syntax/EquipmentOrValveTagSyntax.js";
import type { EquipmentOrValveTagGroup } from "../syntax/EquipmentOrValveTagSyntax.js";

export class EquipmentOrValveClassCodeSpecification
  extends TagSyntaxGroupEqualsSpecification<EquipmentOrValveTagGroup> {
  public constructor(expectedClassCode: string) {
    super(new EquipmentOrValveTagSyntax(), "classCode", expectedClassCode);
  }
}