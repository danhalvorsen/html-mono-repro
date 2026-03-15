import { IReadOnlyScalarField1 } from "../fields/IReadOnlyScalarField1.js";
import { IScalarField1 } from "../fields/IScalarField1.js";

// ============================================================
// OPERATOR CONTRACTS
// ============================================================

export interface ILaplacianOperator1 {
  apply(source: IReadOnlyScalarField1, target: IScalarField1): void;
}
