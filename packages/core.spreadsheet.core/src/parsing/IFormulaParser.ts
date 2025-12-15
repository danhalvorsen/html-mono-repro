import { IFormulaAst } from "./IFormulaAst.js";

export interface IFormulaParser {
    FormulaParser(tokens: ReadonlyArray<any>): IFormulaAst;
}

