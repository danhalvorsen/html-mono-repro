export const BasicEquipmentOrValveClassCodes = Object.freeze([
  "HA",
  "GT",
  "BU",
  "CH",
  "BL",
] as const);

export const BasicInstrumentFunctionCodes = Object.freeze([
  "TIC",
  "TIT",
  "TST",
  "FIC",
  "PIC",
  "HS",
  "FIT",
] as const);

export function createAlternationPattern(values: readonly string[]): string {
  if (values.length === 0) {
    throw new Error("values must contain at least one item.");
  }

  return values.map(escapeRegex).join("|");
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}