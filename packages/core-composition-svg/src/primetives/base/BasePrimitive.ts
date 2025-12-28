 
import { CompositeNode } from "../../CompositeNode.js";
import { PrimitiveStyle } from "./PrimitiveStyle.js";

export interface PrimitiveOptions extends PrimitiveStyle {
  matrix?: DOMMatrix;
}

/**
 * Bounding-box wrapper around a visual primitive.
 * Outer node carries the bbox; inner visual node holds the shape element.
 */
export abstract class BasePrimitive extends CompositeNode {
  protected readonly visual: CompositeNode;
  svgGroup: any;

  constructor(id: string, options: PrimitiveOptions = {}) {
    super(id, options.matrix);
    this.svgGroup.classList.add("primitive-bbox");

    this.visual = new CompositeNode(`${id}-visual`);
    this.visual.svgGroup.classList.add("primitive-visual");
    // Route hits on the visual back to this wrapper
    this.visual.hitProxyFor = this;
    this.addChild(this.visual);
  }

  protected applyStyle(element: SVGElement, style: PrimitiveStyle) {
    if (style.fill !== undefined) element.setAttribute("fill", style.fill);
    if (style.stroke !== undefined) element.setAttribute("stroke", style.stroke);
    if (style.strokeWidth !== undefined) element.setAttribute("stroke-width", `${style.strokeWidth}`);
  }

  protected attachVisual(element: SVGElement) {
    this.visual.svgGroup.appendChild(element);
  }

  /**
   * Set local and world bbox metadata from a set of points in local space.
   */
  protected setBBoxesFromPoints(points: DOMPointInit[]) {
    if (!points.length) return;
    const locals = points.map((p) => new DOMPoint(p.x ?? 0, p.y ?? 0));
    const xs = locals.map((p) => p.x);
    const ys = locals.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    this.setLocalBBox(minX, minY, maxX - minX, maxY - minY);

    const worldPoints = locals.map((p) => this.localMatrix.transformPoint(p));
    const worldXs = worldPoints.map((p) => p.x);
    const worldYs = worldPoints.map((p) => p.y);
    const minWorldX = Math.min(...worldXs);
    const maxWorldX = Math.max(...worldXs);
    const minWorldY = Math.min(...worldYs);
    const maxWorldY = Math.max(...worldYs);
    this.svgGroup.setAttribute(
      "data-bbox",
      `${minWorldX},${minWorldY},${maxWorldX - minWorldX},${maxWorldY - minWorldY}`
    );
  }
}
