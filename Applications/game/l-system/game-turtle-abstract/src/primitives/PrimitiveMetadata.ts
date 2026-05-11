export type PrimitiveMetadata = {
  readonly id?: string;
  readonly tags?: readonly string[];
  readonly layer?: string | number;
  readonly userData?: Readonly<Record<string, unknown>>;
};