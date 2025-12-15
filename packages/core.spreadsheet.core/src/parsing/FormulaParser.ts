import { IFormulaParser } from "./IFormulaParser.js";
import { IFormulaAst } from "./IFormulaAst.js";
import { IFormulaToken } from "./IFormulaToken.js";

export class FormulaParser implements IFormulaParser {
    FormulaParser(tokens: ReadonlyArray<any>) {
        throw new Error("Method not implemented.");
    }
    parse(tokens: ReadonlyArray<IFormulaToken>): IFormulaAst {
        // VERY minimal parser (XP: start small)
        // Only handles single numeric literal for now.

        if (tokens.length === 1 && tokens[0].type === "number") {
            return { type: "number", value: Number(tokens[0].value) };
        }

        throw new Error("Parser not implemented for this expression.");
    }
}
