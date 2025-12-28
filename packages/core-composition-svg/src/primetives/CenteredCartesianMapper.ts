import { Point } from "./Point";
import { Rect } from "./Rect";

// ---------- Cartesian → SVG Mapper (Origin at Center) ----------

export class CenteredCartesianMapper {
    private readonly rect: Rect;

    constructor(rect: Rect) {
        this.rect = rect;
    }

    public toSvg(p: Point): Point {
        return {
            x: p.x + this.rect.width / 2,
            y: this.rect.height / 2 - p.y
        };
    }

    public fromSvg(p: Point): Point {
        return {
            x: p.x - this.rect.width / 2,
            y: this.rect.height / 2 - p.y
        };
    }
}
