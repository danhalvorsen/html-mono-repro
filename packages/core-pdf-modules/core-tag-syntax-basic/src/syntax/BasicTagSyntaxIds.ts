export const BasicTagSyntaxIds = Object.freeze({
  EquipmentOrValve: "basic.equipment-or-valve",
  Instrument: "basic.instrument",
  LineNumber: "basic.line-number",
} as const);

export type BasicTagSyntaxId =
  (typeof BasicTagSyntaxIds)[keyof typeof BasicTagSyntaxIds];