// ============================================================================
// VEX GEOMETRY (independent of Shape)
// ============================================================================

import {Vector2 } from "@monorepo/core-math";
import { VexVertex } from "./VexVertex.js";
import { VexLineShapeAdapterFactory } from "./Line/VexLineShapeAdapterFactory.js";
import { VexLine } from "./Line/VexLine.js";

// ============================================================================
// USAGE
// ============================================================================

const start = new VexVertex(new Vector2(80, 80), 10, true, true);
const end = new VexVertex(new Vector2(220, 160), 10, true, true);

const line = new VexLine(start, end);
const adapter = new VexLineShapeAdapterFactory().create(line);

// adapter is IShape and can be consumed by your existing drawing pipeline