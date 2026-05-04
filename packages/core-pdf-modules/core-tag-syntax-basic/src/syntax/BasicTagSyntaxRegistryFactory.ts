import { TagSyntaxRegistry, type ITagSyntaxRegistry } from "@monorepo/core-tag-syntax-abstract";
import { EquipmentOrValveTagSyntax } from "./EquipmentOrValveTagSyntax.js";
import { InstrumentTagSyntax } from "./InstrumentTagSyntax.js";
import { LineNumberTagSyntax } from "./LineNumberTagSyntax.js";

export class BasicTagSyntaxRegistryFactory {
  public create(): ITagSyntaxRegistry {
    return new TagSyntaxRegistry([
      new LineNumberTagSyntax(),
      new InstrumentTagSyntax(),
      new EquipmentOrValveTagSyntax(),
    ]);
  }
}