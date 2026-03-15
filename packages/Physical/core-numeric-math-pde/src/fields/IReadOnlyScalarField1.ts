import { IUniformGrid1 } from "../grid/IUniformGrid1.js";

// ============================================================
// FIELD CONTRACTS
// ============================================================

export interface IReadOnlyScalarField1 {
  readonly grid: IUniformGrid1;
  sample(i: number): number;
}
