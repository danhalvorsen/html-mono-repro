// src/IPdfStructuredExtractionResult.ts

export interface IPdfStructuredExtractionResult<TValue> {
  readonly schemaName: string;
  readonly value: TValue;
}