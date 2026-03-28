import { RectSemantic } from "./RectSemantic.js";

// ============================================================================
// FILE: src/RectSemantic.ts
// ============================================================================

export type RectSemanticPoint = typeof RectSemantic.Top.Left |
    typeof RectSemantic.Top.Mid |
    typeof RectSemantic.Top.Right |
    typeof RectSemantic.Right.Start |
    typeof RectSemantic.Right.Mid |
    typeof RectSemantic.Right.End |
    typeof RectSemantic.Bottom.Left |
    typeof RectSemantic.Bottom.Mid |
    typeof RectSemantic.Bottom.Right |
    typeof RectSemantic.Left.Start |
    typeof RectSemantic.Left.Mid |
    typeof RectSemantic.Left.End;
