// tests/fixtures/DagMappingFixture.ts
import { expect } from "vitest";
import { DagGraph } from "../../src/DagGraph.js";
import { DagMapper } from "../../src/DagMapper.js";
import { Address } from "../../src/Address.js";
import { CellReference, RangeReference, type Reference } from "../../src/Reference.js";

export class DagMappingFixture {
  public readonly dag = new DagGraph();
  public readonly mapper = new DagMapper(this.dag);

  public cell(a1: string): CellReference {
    return new CellReference(this.parse(a1));
  }

  public range(a1: string, b2: string): RangeReference {
    return new RangeReference(this.parse(a1), this.parse(b2));
  }

  public map(target: string, refs: readonly Reference[]): this {
    this.mapper.map(target, [...refs]);
    return this;
  }

  public expectEdges(...edges: readonly string[]): void {
    const actual = this.dag.edges.map((e: { source: { id: any; }; target: { id: any; }; }) => `${e.source.id}->${e.target.id}`);
    for (const e of edges) expect(actual).toContain(e);
  }

  public expectEdgeCount(n: number): void {
    expect(this.dag.edges.length).toBe(n);
  }

  // --- Address parsing for tests only (keeps prod addressing clean) ---
  private parse(a1: string): Address {
    const m = /^([A-Z]+)(\d+)$/.exec(a1);
    if (!m) throw new Error(`Invalid A1: ${a1}`);
    const col = this.colToNum(m[1]);
    const row = Number(m[2]);
    return new Address(col, row);
  }

  private colToNum(label: string): number {
    let n = 0;
    for (const ch of label) n = n * 26 + (ch.charCodeAt(0) - 64);
    return n;
  }
}