import { IGeometryNode } from "./code2.js";
import { GeometryComposite } from "./GeometryComposite.js";

/* ============================================================
   Composite Note: NoteComposite.ts
   ============================================================ */

export class NoteComposite extends GeometryComposite {
    constructor(nodes: IGeometryNode[]) {
        super();
        for (const n of nodes) this.add(n);
    }
}
