// =====================================================
// core.spreadsheet.cell  — SINGLE CELL KERNEL
// =====================================================

// =====================================================
// addressing / CellAddress
// =====================================================
export class CellAddress {
    private constructor(
        public readonly sheet: string,
        public readonly column: number, // 0-based
        public readonly row: number     // 0-based
    ) {}

    static parse(input: string): CellAddress {
        const [sheet, ref] = input.includes("!")
            ? input.split("!", 2)
            : ["", input];

        const match = /^([A-Z]+)(\d+)$/.exec(ref);
        if (!match) {
            throw new Error(`Invalid cell address: ${input}`);
        }

        const column = CellAddress.a1ToColumn(match[1]);
        const row = Number(match[2]) - 1;

        if (row < 0 || column < 0) {
            throw new Error(`Invalid cell address: ${input}`);
        }

        return new CellAddress(sheet, column, row);
    }

    toString(): string {
        const col = CellAddress.columnToA1(this.column);
        const row = this.row + 1;
        return this.sheet ? `${this.sheet}!${col}${row}` : `${col}${row}`;
    }

    private static a1ToColumn(a1: string): number {
        let col = 0;
        for (const c of a1) {
            col = col * 26 + (c.charCodeAt(0) - 64);
        }
        return col - 1;
    }

    private static columnToA1(index: number): string {
        let col = index + 1;
        let out = "";
        while (col > 0) {
            const r = (col - 1) % 26;
            out = String.fromCharCode(65 + r) + out;
            col = Math.floor((col - 1) / 26);
        }
        return out;
    }
}

// =====================================================
// addressing / CellRange (utility only)
// =====================================================
export class CellRange {
    constructor(
        public readonly start: CellAddress,
        public readonly end: CellAddress
    ) {}

    static parse(input: string): CellRange {
        const [a, b] = input.split(":");
        if (!b) {
            throw new Error(`Invalid cell range: ${input}`);
        }
        return new CellRange(
            CellAddress.parse(a),
            CellAddress.parse(b)
        );
    }
}

// =====================================================
// parsing / CellFormulaToken
// =====================================================
export interface CellFormulaToken {
    readonly type: "number" | "identifier" | "operator";
    readonly value: string;
}

// =====================================================
// parsing / CellFormulaAst
// =====================================================
export interface CellFormulaAst {
    readonly type: "number" | "identifier" | "binary";
    readonly value?: number | string;
    readonly left?: CellFormulaAst;
    readonly right?: CellFormulaAst;
}

// =====================================================
// parsing / ICellFormulaTokenizer
// =====================================================
export interface ICellFormulaTokenizer {
    tokenize(input: string): ReadonlyArray<CellFormulaToken>;
}

// =====================================================
// parsing / CellFormulaTokenizer
// =====================================================
export class CellFormulaTokenizer implements ICellFormulaTokenizer {
    tokenize(input: string): ReadonlyArray<CellFormulaToken> {
        const tokens: CellFormulaToken[] = [];
        let i = 0;

        const push = (
            type: CellFormulaToken["type"],
            value: string
        ) => tokens.push({ type, value });

        while (i < input.length) {
            const c = input[i];

            if (/\s/.test(c)) {
                i++;
                continue;
            }

            if (/\d/.test(c)) {
                const s = i;
                while (/\d|\./.test(input[i])) i++;
                push("number", input.slice(s, i));
                continue;
            }

            if (/[A-Za-z]/.test(c)) {
                const s = i;
                while (/[A-Za-z0-9_]/.test(input[i])) i++;
                push("identifier", input.slice(s, i));
                continue;
            }

            if ("+-*/()=,".includes(c)) {
                push("operator", c);
                i++;
                continue;
            }

            throw new Error(`Unexpected character: ${c}`);
        }

        return tokens;
    }
}

// =====================================================
// parsing / ICellFormulaParser
// =====================================================
export interface ICellFormulaParser {
    parse(tokens: ReadonlyArray<CellFormulaToken>): CellFormulaAst;
}

// =====================================================
// parsing / CellFormulaParser (minimal, correct)
// =====================================================
export class CellFormulaParser implements ICellFormulaParser {
    parse(tokens: ReadonlyArray<CellFormulaToken>): CellFormulaAst {
        if (tokens.length === 1 && tokens[0].type === "number") {
            return {
                type: "number",
                value: Number(tokens[0].value)
            };
        }

        throw new Error("Unsupported formula expression");
    }
}

// =====================================================
// cell / ValueType
// =====================================================
export enum CellValueKind {
    Number,
    String,
    Boolean,
    Date,
    Null
}

export interface CellValue {
    readonly kind: CellValueKind;
    readonly value: number | string | boolean | Date | null;
}

export const CellValueFactory = {
    number: (v: number): CellValue => ({ kind: CellValueKind.Number, value: v }),
    string: (v: string): CellValue => ({ kind: CellValueKind.String, value: v }),
    boolean: (v: boolean): CellValue => ({ kind: CellValueKind.Boolean, value: v }),
    date: (v: Date): CellValue => ({ kind: CellValueKind.Date, value: v }),
    null: (): CellValue => ({ kind: CellValueKind.Null, value: null })
};

// =====================================================
// cell / Cell (SINGLE canonical model)
// =====================================================
export class Cell {
    constructor(
        public readonly address: CellAddress,
        public readonly formula: string,
        public readonly ast: CellFormulaAst | null,
        public readonly value: CellValue
    ) {}
}
