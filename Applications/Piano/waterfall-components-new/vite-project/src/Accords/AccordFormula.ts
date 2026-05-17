export type AccordCategory =
  | "major"
  | "minor"
  | "seventh"
  | "extended"
  | "suspended"
  | "diminished"
  | "augmented"
  | "added"
  | "altered";

export type AccordFormula = Readonly<{
  readonly id: string;
  readonly name: string;
  readonly category: AccordCategory;
  readonly intervals: readonly number[];
}>;
