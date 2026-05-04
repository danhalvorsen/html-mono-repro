export const PidFragmentKinds = Object.freeze({
  TagCandidate: "pid-tag-candidate",
  EquipmentTag: "pid-equipment-tag",
  InstrumentTag: "pid-instrument-tag",
  LineNumber: "pid-line-number",
} as const);

export type PidFragmentKind =
  (typeof PidFragmentKinds)[keyof typeof PidFragmentKinds];