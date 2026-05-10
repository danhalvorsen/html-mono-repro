export interface FooOption {
  readonly min: number;
  readonly max: number;
}

export const DefaultFooOption: FooOption = {
  min: 0,
  max: 100,
} as const;
