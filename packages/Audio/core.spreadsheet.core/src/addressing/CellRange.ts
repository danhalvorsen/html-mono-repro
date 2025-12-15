import { CellAddress } from "./CellAddress.js";

export class CellRange {
    constructor(
        public readonly start: CellAddress,
        public readonly end: CellAddress
    ) {}

    static parse(input: string): CellRange {
        const [a, b] = input.split(":");
        return new CellRange(
            CellAddress.parse(a),
            CellAddress.parse(b)
        );
    }

    contains(addr: CellAddress): boolean {
        const rs = Math.min(this.start.row, this.end.row);
        const re = Math.max(this.start.row, this.end.row);
        const cs = Math.min(this.start.column, this.end.column);
        const ce = Math.max(this.start.column, this.end.column);

        return (
            addr.row >= rs &&
            addr.row <= re &&
            addr.column >= cs &&
            addr.column <= ce
        );
    }

    toString(): string {
        return `${this.start.toString()}:${this.end.toString()}`;
    }
}
