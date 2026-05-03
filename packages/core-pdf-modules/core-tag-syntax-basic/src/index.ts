export { BasicTagSyntaxIds } from "./syntax/BasicTagSyntaxIds.js";
export type { BasicTagSyntaxId } from "./syntax/BasicTagSyntaxIds.js";

export {
  BasicEquipmentOrValveClassCodes,
  BasicInstrumentFunctionCodes,
  createAlternationPattern,
} from "./syntax/BasicTagCodeCatalog.js";

export {
  EquipmentOrValveTagSyntax,
} from "./syntax/EquipmentOrValveTagSyntax.js";
export type {
  EquipmentOrValveTagGroup,
} from "./syntax/EquipmentOrValveTagSyntax.js";

export {
  InstrumentTagSyntax,
} from "./syntax/InstrumentTagSyntax.js";
export type {
  InstrumentTagGroup,
} from "./syntax/InstrumentTagSyntax.js";

export {
  LineNumberTagSyntax,
} from "./syntax/LineNumberTagSyntax.js";
export type {
  LineNumberTagGroup,
} from "./syntax/LineNumberTagSyntax.js";

export {
  BasicTagSyntaxRegistryFactory,
} from "./syntax/BasicTagSyntaxRegistryFactory.js";

export { EquipmentOrValveTagSpecification } from "./specifications/EquipmentOrValveTagSpecification.js";
export { InstrumentTagSpecification } from "./specifications/InstrumentTagSpecification.js";
export { LineNumberTagSpecification } from "./specifications/LineNumberTagSpecification.js";
export { BasicTagSystemSpecification } from "./specifications/BasicTagSystemSpecification.js";
export { EquipmentOrValveClassCodeSpecification } from "./specifications/EquipmentOrValveClassCodeSpecification.js";
export { InstrumentFunctionCodeSpecification } from "./specifications/InstrumentFunctionCodeSpecification.js";
export { LineServiceCodeSpecification } from "./specifications/LineServiceCodeSpecification.js";