// Applications/vite-piano-octave/src/adapters/SvgOctaveAdapter.ts

import { svg } from "lit";
import type { PlacedPolygon } from "../octave/PlacedPolygon";

const GEOMETRY_HEIGHT_PERCENT = 100;
const SPACE_PERCENT = 1;

// tolerances
const EPS = 1e-6;

// total gap between overlapping edges (each polygon moves GAP/2 away from the overlap line)
const GAP = 2;

type Point = readonly [number, number];

type Segment = {
  readonly a: Point;
  readonly b: Point;
};

type OrientedSharedLine =
  | { readonly kind: "V"; readonly x: number; readonly y1: number; readonly y2: number }
  | { readonly kind: "H"; readonly y: number; readonly x1: number; readonly x2: number };

export default class SvgOctaveAdapter {
  adapt(polygons: PlacedPolygon[]) {
    // One global spacing transform for ALL polygons (keeps geometry comparable)
    const spaceXHalf = this.computeGlobalSpaceXHalf(polygons);
    const matrix = `matrix(1,0,0,1,${spaceXHalf},0)`;

    // "overlapping edges" (vertical + horizontal) across ALL keys (incl black)
    const overlapLines = this.computeSharedAxisAlignedEdges(polygons);

    return svg`
      <svg viewBox="0 0 169 ${GEOMETRY_HEIGHT_PERCENT}" xmlns="http://www.w3.org/2000/svg">
        <g transform="${matrix}">
          ${polygons.map(p => this.renderPolygonLocal(p, overlapLines))}
        </g>
      </svg>
    `;
  }

  // --------------------------------------------------------------------- //
  // Rendering (local geometry coordinates; group transform handles spacing) //
  // --------------------------------------------------------------------- //

  /**
   * Render-time deformation only:
   * For every vertex that lies on an overlapping vertical/horizontal segment,
   * push it away from that overlap line by GAP/2, creating a real visible gap.
   */
  private renderPolygonLocal(p: PlacedPolygon, overlapLines: readonly OrientedSharedLine[]) {
    const pts = p.geometry.points as readonly Point[];

    // classify side relative to the overlap line using bbox center
    const box = this.bboxOf(pts);
    const cx = (box.minX + box.maxX) * 0.5;
    const cy = (box.minY + box.maxY) * 0.5;

    const half = GAP * 0.5;

    const adjusted = pts.map(([x, y]) => {
      let nx = x;
      let ny = y;

      // NOTE: points are already sorted CW in your dataset (not required here).
      // We only adjust vertices that lie ON an overlap segment, not whole polygons.
      for (const l of overlapLines) {
        if (l.kind === "V") {
          // vertex lies on overlapping vertical segment?
          if (
            Math.abs(nx - l.x) <= EPS &&
            y >= l.y1 - EPS &&
            y <= l.y2 + EPS
          ) {
            nx += cx < l.x ? -half : +half;
          }
        } else {
          // vertex lies on overlapping horizontal segment?
          if (
            Math.abs(ny - l.y) <= EPS &&
            x >= l.x1 - EPS &&
            x <= l.x2 + EPS
          ) {
            ny += cy < l.y ? -half : +half;
          }
        }
      }

      return [nx, ny] as const;
    });

    const points = adjusted
      .map(([x, y]) => `${x},${GEOMETRY_HEIGHT_PERCENT - y}`)
      .join(" ");

    return svg`
      <polygon
        points="${points}"
        fill="${p.isBlack ? "#000" : "#fff"}"
        stroke="#000"
      />
    `;
  }

  // ------------------------------------------------------------- //
  // Overlapping edges: vertical + horizontal, across ALL keys      //
  // ------------------------------------------------------------- //

  private computeSharedAxisAlignedEdges(polygons: readonly PlacedPolygon[]): OrientedSharedLine[] {
    // Small N (12) => simple all-pairs is fine and very robust.
    const shared: OrientedSharedLine[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < polygons.length; i++) {
      const A = polygons[i].geometry;
      const aPts = A.points as readonly Point[];
      const aEdges = this.extractAxisAlignedEdges(aPts);

      const aBox = this.bboxOf(aPts);

      for (let j = i + 1; j < polygons.length; j++) {
        const B = polygons[j].geometry;
        const bPts = B.points as readonly Point[];

        // Fast reject by bbox
        if (!this.bboxIntersects(aBox, this.bboxOf(bPts))) continue;

        const bEdges = this.extractAxisAlignedEdges(bPts);

        // Match vertical-with-vertical + horizontal-with-horizontal
        for (const ea of aEdges) {
          for (const eb of bEdges) {
            const line = this.sharedOverlap(ea, eb);
            if (!line) continue;

            const key = this.lineKey(line);
            if (seen.has(key)) continue;
            seen.add(key);

            shared.push(line);
          }
        }
      }
    }

    // stable-ish ordering
    shared.sort((p, q) => {
      if (p.kind !== q.kind) return p.kind === "V" ? -1 : 1;
      if (p.kind === "V" && q.kind === "V") return p.x - q.x || p.y1 - q.y1;
      return (p as any).y - (q as any).y || (p as any).x1 - (q as any).x1;
    });

    return shared;
  }

  private extractAxisAlignedEdges(points: readonly Point[]): Segment[] {
    const out: Segment[] = [];
    const n = points.length;

    for (let i = 0; i < n; i++) {
      const a = points[i];
      const b = points[(i + 1) % n];

      const dx = b[0] - a[0];
      const dy = b[1] - a[1];

      // only vertical or horizontal edges
      if (Math.abs(dx) <= EPS || Math.abs(dy) <= EPS) {
        out.push({ a, b });
      }
    }
    return out;
  }

  private sharedOverlap(a: Segment, b: Segment): OrientedSharedLine | null {
    const ax = a.a[0];
    const ay = a.a[1];
    const bx = a.b[0];
    const by = a.b[1];

    const cx = b.a[0];
    const cy = b.a[1];
    const dx = b.b[0];
    const dy = b.b[1];

    const aVert = Math.abs(ax - bx) <= EPS && Math.abs(ay - by) > EPS;
    const aHorz = Math.abs(ay - by) <= EPS && Math.abs(ax - bx) > EPS;

    const bVert = Math.abs(cx - dx) <= EPS && Math.abs(cy - dy) > EPS;
    const bHorz = Math.abs(cy - dy) <= EPS && Math.abs(cx - dx) > EPS;

    // Vertical overlapping segment
    if (aVert && bVert) {
      if (Math.abs(ax - cx) > EPS) return null;

      const aY1 = Math.min(ay, by);
      const aY2 = Math.max(ay, by);
      const bY1 = Math.min(cy, dy);
      const bY2 = Math.max(cy, dy);

      const y1 = Math.max(aY1, bY1);
      const y2 = Math.min(aY2, bY2);

      if (y2 - y1 <= EPS) return null;

      return { kind: "V", x: ax, y1, y2 };
    }

    // Horizontal overlapping segment
    if (aHorz && bHorz) {
      if (Math.abs(ay - cy) > EPS) return null;

      const aX1 = Math.min(ax, bx);
      const aX2 = Math.max(ax, bx);
      const bX1 = Math.min(cx, dx);
      const bX2 = Math.max(cx, dx);

      const x1 = Math.max(aX1, bX1);
      const x2 = Math.min(aX2, bX2);

      if (x2 - x1 <= EPS) return null;

      return { kind: "H", y: ay, x1, x2 };
    }

    return null;
  }

  private lineKey(l: OrientedSharedLine): string {
    // quantize to avoid eps-noise duplicates
    const q = (v: number) => Math.round(v * 1_000_000) / 1_000_000;

    if (l.kind === "V") return `V:${q(l.x)}:${q(l.y1)}:${q(l.y2)}`;
    return `H:${q(l.y)}:${q(l.x1)}:${q(l.x2)}`;
  }

  // ------------------------------------------------------------- //
  // Layout: compute one global spacing shift (no geometry changes) //
  // ------------------------------------------------------------- //

  private computeGlobalSpaceXHalf(polygons: readonly PlacedPolygon[]): number {
    // Use median white-key width as representative (stable)
    const whites = polygons.filter(p => !p.isBlack).map(p => p.geometry.points as readonly Point[]);
    const widths = whites.map(pts => this.widthOf(pts)).sort((a, b) => a - b);
    const medianWidth = widths[Math.floor(widths.length / 2)] ?? 0;

    const spaceX = medianWidth * (SPACE_PERCENT / 100);
    return spaceX / 2;
  }

  private widthOf(points: readonly Point[]): number {
    const xs = points.map(pt => pt[0]);
    return Math.max(...xs) - Math.min(...xs);
  }

  // --------------------- //
  // bbox helpers          //
  // --------------------- //

  private bboxOf(points: readonly Point[]) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x, y] of points) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    return { minX, maxX, minY, maxY };
  }

  private bboxIntersects(
    a: { minX: number; maxX: number; minY: number; maxY: number },
    b: { minX: number; maxX: number; minY: number; maxY: number }
  ) {
    return !(a.maxX < b.minX || b.maxX < a.minX || a.maxY < b.minY || b.maxY < a.minY);
  }
}
