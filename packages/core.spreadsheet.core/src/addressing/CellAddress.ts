export class CellAddress {
    constructor(
        public readonly sheet: string,
        public readonly column: number, // 0-based
        public readonly row: number     // 0-based
    ) {}

    static parse(input: string): CellAddress {
        const [sheet, cell] = input.includes("!")
            ? input.split("!")
            : ["", input];

        const match = /^([A-Z]+)(\d+)$/.exec(cell);
        if (!match) throw new Error("Invalid address: " + input);

        const colStr = match[1];
        const rowStr = match[2];

        let col = 0;
        for (let i = 0; i < colStr.length; i++) {
            col = col * 26 + (colStr.charCodeAt(i) - 64);
        }

        return new CellAddress(
            sheet || "",
            col - 1,
            parseInt(rowStr, 10) - 1
        );
    }

    toString(): string {
        let col = this.column + 1;
        let colStr = "";

        while (col > 0) {
            const rem = (col - 1) % 26;
            colStr = String.fromCharCode(65 + rem) + colStr;
            col = Math.floor((col - 1) / 26);
        }

        return this.sheet
            ? `${this.sheet}!${colStr}${this.row + 1}`
            : `${colStr}${this.row + 1}`;
    }
}
