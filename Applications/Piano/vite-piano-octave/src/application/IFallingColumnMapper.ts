export interface IFallingColumnMapper {
  toColumn(note: string, octaveIndex: number): number | null;
}
