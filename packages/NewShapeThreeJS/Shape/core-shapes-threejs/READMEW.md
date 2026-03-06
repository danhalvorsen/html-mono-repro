# core.spreadsheet.abstract

Abstract interfaces and base types for spreadsheet-like models (cells, rows, columns, sheets) without enforcing a concrete storage engine.

## Goals
- Decouple spreadsheet domain from storage/rendering.
- Enable multiple backends (in-memory, file-based, remote).
- Keep API small and testable.

## Key concepts (suggested)
- ICell: address + value + format.
- IRow/ IColumn: index + collection helpers.
- ISheet: grid access, iteration, metadata.
- IWorkbook: multiple sheets, named lookup.

## Minimal example
```ts
// Example abstractions (suggested shape)
interface ICell { address: string; getValue(): unknown; setValue(v: unknown): void; }
interface ISheet { getCell(address: string): ICell; setCell(address: string, v: unknown): void; }

// usage
const sheet: ISheet = /* your impl */;
sheet.setCell("A1", 42);
const v = sheet.getCell("A1").getValue(); // 42
```

## Implementations
- Provide concrete implementations in sibling packages (e.g., core.spreadsheet.memory, core.spreadsheet.filesystem).

## Testing
- Use Vitest for unit tests; prefer pure domain tests (no I/O).
- Add coverage with V8 provider if needed.

## Build
- TypeScript ESM recommended; export only interfaces and minimal helpers.

## Notes
- Keep interfaces stable; add new features via extensions to avoid breaking changes.