export interface IFormulaToken {
    readonly type: string;   // "number", "operator", "identifier", "paren", etc.
    readonly value: string;  // raw text
}