import { IReadOnlyScalarField1 } from "../fields/IReadOnlyScalarField1.js";

// ============================================================
// SAMPLER CONTRACTS
// ============================================================

export interface IScalarFieldSampler1 {
  sample(field: IReadOnlyScalarField1, i: number): number;
}
