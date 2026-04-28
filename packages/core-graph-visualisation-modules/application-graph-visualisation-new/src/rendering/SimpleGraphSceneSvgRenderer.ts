import { svg, type TemplateResult } from "lit";
import type { GraphSvgScene } from "@monorepo/core-graph-visualisation";

export function renderSimpleGraphSceneSvg(scene: GraphSvgScene): TemplateResult {
  return svg`
    <svg
      viewBox="0 0 ${scene.width} ${scene.height}"
      width=${scene.width}
      height=${scene.height}
      role="img"
      aria-label="Graph visualization"
    >
      <rect
        x=${scene.boundary.topLeft.x}
        y=${scene.boundary.topLeft.y}
        width=${scene.boundary.width}
        height=${scene.boundary.height}
        fill="#f8fbff"
        stroke="#8aa0bd"
        stroke-width="2"
      ></rect>

      ${scene.edges.map((edge) => svg`
        <path
          d=${edge.edge.path}
          fill="none"
          stroke="#365a7f"
          stroke-width="2"
        ></path>
      `)}

      ${scene.nodes.map((node) => svg`
        <g>
          <circle
            cx=${node.center.x}
            cy=${node.center.y}
            r=${node.circle?.radius ?? 32}
            fill="#1f3a5f"
            stroke="#dce6f2"
            stroke-width="2"
          ></circle>
          <text
            x=${node.center.x}
            y=${node.center.y + 4}
            text-anchor="middle"
            font-family="Segoe UI, sans-serif"
            font-size="12"
            fill="#f8fbff"
          >${node.label || node.id}</text>
        </g>
      `)}
    </svg>
  `;
}