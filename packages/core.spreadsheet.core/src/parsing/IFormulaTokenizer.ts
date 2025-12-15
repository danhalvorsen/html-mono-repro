import { IFormulaToken } from "./IFormulaToken.js";

export interface IFormulaTokenizer {
    FormulaTokenizer(input: string): ReadonlyArray<IFormulaToken>;
}