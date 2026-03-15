import { Vector2 } from "@monorepo/core-math";

export class Vector2CenterConverter {
  public constructor(private readonly fallbackCenter: Vector2) { }

  public fromAttribute(value: string | null): Vector2 {
    if (value === null || value.trim() === "") {
      return new Vector2(this.fallbackCenter.x, this.fallbackCenter.y);
    }

    try {
      const parsed = JSON.parse(value) as Partial<{ x: number; y: number; }>;
      const x = Number(parsed.x);
      const y = Number(parsed.y);

      if (Number.isFinite(x) && Number.isFinite(y)) {
        return new Vector2(x, y);
      }
    } catch {
      // Fall through to default center.
    }

    return new Vector2(this.fallbackCenter.x, this.fallbackCenter.y);
  }

  public toAttribute(value: Vector2): string {
    return JSON.stringify({ x: value.x, y: value.y });
  }
}
