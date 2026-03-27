// ============================================================================
// FILE: src/RectSemantic.ts
// ============================================================================

export class RectSemantic {
  public static readonly Top = Object.freeze({
    Left: "Top.Left",
    Mid: "Top.Mid",
    Right: "Top.Right",
  });

  public static readonly Right = Object.freeze({
    Start: "Right.Start",
    Mid: "Right.Mid",
    End: "Right.End",
  });

  public static readonly Bottom = Object.freeze({
    Left: "Bottom.Left",
    Mid: "Bottom.Mid",
    Right: "Bottom.Right",
  });

  public static readonly Left = Object.freeze({
    Start: "Left.Start",
    Mid: "Left.Mid",
    End: "Left.End",
  });
}
