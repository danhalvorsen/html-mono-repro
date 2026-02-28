// src/svg/infrastructure/svg-ns.ts
export const SVG_NS = "http://www.w3.org/2000/svg" as const;

export function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
): SVGElementTagNameMap[K] {
  return document.createElementNS(SVG_NS, tag);
}