import { IFormulaTokenizer } from "./IFormulaTokenizer.js";
import { IFormulaToken } from "./IFormulaToken.js";

export class FormulaTokenizer implements IFormulaTokenizer {
    constructor() {
        // No-op constructor; tokenizer is stateless for now.
    }
    FormulaTokenizer(input: string): ReadonlyArray<IFormulaToken> {
        // Backwards-compatibility helper: delegate to the instance tokenizer implementation.
        // Some callers may have expected an instance method named after the class.
        return this.tokenize(input);
    }

    // Convenience static helper so callers can tokenize without instantiating.
    static tokenize(input: string): ReadonlyArray<IFormulaToken> {
        return new FormulaTokenizer().tokenize(input);
    }
    tokenize(input: string): ReadonlyArray<IFormulaToken> {
        const tokens: IFormulaToken[] = [];
        let i = 0;

        const push = (type: string, value: string) =>
            tokens.push({ type, value });

        while (i < input.length) {
            const c = input[i];

            if (/\s/.test(c)) { i++; continue; }

            if (/[0-9]/.test(c)) {
                let start = i;
                while (/[0-9.]/.test(input[i])) i++;
                push("number", input.slice(start, i));
                continue;
            }

            if (/[A-Za-z]/.test(c)) {
                let start = i;
                while (/[A-Za-z0-9_]/.test(input[i])) i++;
                push("identifier", input.slice(start, i));
                continue;
            }

            if ("+-*/()=,".includes(c)) {
                push("operator", c);
                i++;
                continue;
            }

            throw new Error("Unexpected character: " + c);
        }

        return tokens;
    }
}
