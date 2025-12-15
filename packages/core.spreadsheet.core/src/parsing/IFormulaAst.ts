
export interface IFormulaAst {
    readonly type: string;
    readonly value?: string | number;
    readonly left?: IFormulaAst;
    readonly right?: IFormulaAst;
    readonly args?: ReadonlyArray<IFormulaAst>;
}
