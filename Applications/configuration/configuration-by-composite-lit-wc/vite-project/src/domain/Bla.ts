export type Interval = readonly [number, number];

export interface BlaOption {
  readonly scale: Interval;
  readonly step?: number;
  readonly label?: string;
  readonly currentValue?: number;
}

export const DefaultBlaOption = {
  scale: [0, 100],
  step: 1,
  label: "Bla",
  currentValue: 50,
} as const satisfies BlaOption;
